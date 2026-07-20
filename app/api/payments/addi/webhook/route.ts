import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/server';
import { getServerEnv } from '@/config/env';

/**
 * Webhook de Addi. Recibe la notificación del resultado de la solicitud de
 * crédito y actualiza el estado del pedido. Es un endpoint público (Addi lo
 * llama sin sesión), así que se protege con un secreto compartido opcional
 * (`ADDI_WEBHOOK_SECRET`) y todas las escrituras usan el cliente admin.
 *
 * ⚠️ El esquema exacto del payload y el mecanismo de firma los define Addi en
 * el onboarding. Aquí se leen los campos de forma tolerante (applicationId /
 * orderId / status) y se acepta el secreto por cabecera. Ajusta la validación
 * de firma a lo que indique tu documentación.
 */

function pick(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v) return v;
  }
  return undefined;
}

/** Normaliza el estado de Addi a nuestro modelo. */
function mapStatus(raw: string | undefined): 'approved' | 'rejected' | 'pending' {
  const s = (raw ?? '').toUpperCase();
  if (['APPROVED', 'ACCEPTED', 'PAID', 'DISBURSED', 'COMPLETED'].includes(s)) return 'approved';
  if (['REJECTED', 'DECLINED', 'CANCELLED', 'CANCELED', 'FAILED', 'EXPIRED'].includes(s)) return 'rejected';
  return 'pending';
}

export async function POST(req: Request) {
  const env = getServerEnv();

  // Validación de secreto compartido (si está configurado).
  if (env.ADDI_WEBHOOK_SECRET) {
    const provided =
      req.headers.get('x-addi-signature') ??
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
      req.headers.get('x-webhook-secret') ??
      '';
    if (provided !== env.ADDI_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Firma no válida' }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'JSON no válido' }, { status: 400 });
  }

  const orderNumber = pick(body, ['orderId', 'orderNumber', 'externalId', 'reference']);
  const applicationId = pick(body, ['applicationId', 'id']);
  const status = mapStatus(pick(body, ['status', 'applicationStatus', 'state']));

  if (!orderNumber && !applicationId) {
    return NextResponse.json({ error: 'Falta orderId o applicationId' }, { status: 400 });
  }

  const admin = createAdminSupabase();

  // Localizar el pedido por número o por la referencia de pago (applicationId).
  const query = admin.from('orders').select('id, order_number, status, payment_status');
  const { data } = orderNumber
    ? await query.eq('order_number', orderNumber).maybeSingle()
    : await query.eq('payment_reference', applicationId as string).maybeSingle();

  const order = data as { id: string; order_number: string; status: string; payment_status: string } | null;
  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }

  // Idempotencia: si ya está resuelto, no reprocesar.
  if (order.payment_status === 'paid' || order.status === 'cancelled') {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  if (status === 'approved') {
    await admin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'paid',
        payment_reference: applicationId ?? undefined,
      } as never)
      .match({ id: order.id });
  } else if (status === 'rejected') {
    await admin
      .from('orders')
      .update({ payment_status: 'failed', status: 'cancelled' } as never)
      .match({ id: order.id });

    // Reponer el stock reservado al crear el pedido.
    const { data: items } = await admin
      .from('order_items')
      .select('variant_id, quantity')
      .match({ order_id: order.id });
    for (const it of (items as { variant_id: string | null; quantity: number }[] | null) ?? []) {
      if (!it.variant_id) continue;
      await admin.rpc('apply_inventory_movement', {
        p_variant_id: it.variant_id,
        p_type: 'in',
        p_quantity: it.quantity,
        p_reason: 'pago_rechazado',
        p_reference: order.order_number,
      });
    }
  }

  return NextResponse.json({ ok: true, status });
}
