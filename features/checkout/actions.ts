'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server';
import { checkoutSchema } from '@/schemas/checkout';
import { getStoreSettings, computeTotals } from '@/features/settings/queries';
import { getVariantsForCheckout, validateCoupon } from './queries';
import { getPaymentProvider } from '@/services/payments';
import { siteConfig } from '@/config/site';

export interface CreateOrderResult {
  error?: string;
  orderNumber?: string;
}

/** Valida el carrito contra la BD y crea el pedido (estructura lista para pagos). */
export async function createOrderAction(input: unknown): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Revisa los datos del formulario.' };
  }
  const { address, items, couponCode, paymentMethod } = parsed.data;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Debes iniciar sesión para completar la compra.' };

  // 1) Validar cada línea contra la BD (precio y stock reales)
  const lines = await getVariantsForCheckout(items.map((i) => i.variantId));
  const byId = new Map(lines.map((l) => [l.variantId, l]));

  const orderItems: {
    variantId: string;
    productName: string;
    label: string | null;
    sku: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[] = [];
  let subtotal = 0;

  for (const item of items) {
    const line = byId.get(item.variantId);
    if (!line || !line.published) {
      return { error: 'Uno de los productos ya no está disponible.' };
    }
    if (line.available < item.quantity) {
      return { error: `Stock insuficiente de ${line.productName}. Disponibles: ${line.available}.` };
    }
    const lineTotal = line.unitPrice * item.quantity;
    subtotal += lineTotal;
    orderItems.push({
      variantId: line.variantId,
      productName: line.productName,
      label: [line.color, line.size].filter(Boolean).join(' / ') || null,
      sku: line.sku,
      unitPrice: line.unitPrice,
      quantity: item.quantity,
      lineTotal,
    });
  }

  // 2) Cupón (opcional)
  let discount = 0;
  let couponId: string | null = null;
  if (couponCode) {
    const coupon = await validateCoupon(couponCode);
    if (!coupon) return { error: 'Cupón no válido o expirado.' };
    if (subtotal < coupon.minPurchase) {
      return { error: 'La compra no alcanza el mínimo para este cupón.' };
    }
    discount =
      coupon.type === 'percentage'
        ? Math.round((subtotal * coupon.value) / 100)
        : Math.min(coupon.value, subtotal);
    couponId = coupon.id;
  }

  // 3) Totales (envío e impuestos según la configuración vigente de la tienda)
  const settings = await getStoreSettings();
  const { shipping, tax, grandTotal } = computeTotals(subtotal, discount, settings);
  const orderNumber = `ORD-${new Date().getFullYear()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

  // 4) Crear el pedido en estado pendiente (admin: operación controlada tras autenticar)
  const admin = createAdminSupabase();

  const { data: order, error: orderErr } = await admin
    .from('orders')
    .insert({
      user_id: user.id,
      order_number: orderNumber,
      status: 'pending',
      payment_status: 'pending',
      payment_method: paymentMethod,
      subtotal,
      discount_total: discount,
      shipping_total: shipping,
      tax_total: tax,
      grand_total: grandTotal,
      coupon_id: couponId,
      shipping_address: address,
      notes: address.notes ?? null,
      placed_at: new Date().toISOString(),
    } as never)
    .select('id')
    .single();

  if (orderErr || !order) return { error: 'No fue posible crear el pedido. Inténtalo de nuevo.' };
  const orderId = (order as { id: string }).id;

  const itemsPayload = orderItems.map((oi) => ({
    order_id: orderId,
    variant_id: oi.variantId,
    product_name: oi.productName,
    variant_label: oi.label,
    sku: oi.sku,
    unit_price: oi.unitPrice,
    quantity: oi.quantity,
    line_total: oi.lineTotal,
  }));
  await admin.from('order_items').insert(itemsPayload as never);

  // 5) Descontar stock de forma transaccional por variante
  for (const oi of orderItems) {
    await admin.rpc('apply_inventory_movement', {
      p_variant_id: oi.variantId,
      p_type: 'out',
      p_quantity: -oi.quantity,
      p_reason: 'venta',
      p_reference: orderNumber,
      p_actor: user.id,
    });
  }

  // 6) Pago (proveedor desacoplado). Puede devolver una URL de redirección
  //    (pasarelas externas como Addi) o resolverse en el acto (contra entrega).
  let redirectTo = `/pedido/${orderNumber}`;
  try {
    const payment = await getPaymentProvider(paymentMethod).createPayment({
      orderNumber,
      amount: grandTotal,
      currency: siteConfig.currency,
      shippingAmount: shipping,
      taxAmount: tax,
      customer: { email: user.email, fullName: address.recipient, phone: address.phone },
      items: orderItems.map((oi) => ({
        sku: oi.sku,
        name: oi.productName,
        quantity: oi.quantity,
        unitPrice: oi.unitPrice,
      })),
      shippingAddress: {
        line1: address.line1,
        line2: address.line2 ?? null,
        city: address.city,
        state: address.state ?? null,
        country: address.country,
      },
      siteUrl: siteConfig.url,
    });

    await admin
      .from('orders')
      .update({
        payment_status: payment.status,
        payment_reference: payment.reference ?? null,
        payment_provider: payment.provider ?? paymentMethod,
      } as never)
      .match({ id: orderId });

    if (payment.redirectUrl) redirectTo = payment.redirectUrl;
  } catch (err) {
    // Si la pasarela falla, revertimos: reponemos stock y eliminamos el pedido
    // para no dejar inventario descontado ni pedidos huérfanos.
    for (const oi of orderItems) {
      await admin.rpc('apply_inventory_movement', {
        p_variant_id: oi.variantId,
        p_type: 'in',
        p_quantity: oi.quantity,
        p_reason: 'pago_fallido',
        p_reference: orderNumber,
        p_actor: user.id,
      });
    }
    await admin.from('orders').delete().match({ id: orderId });
    const message = err instanceof Error ? err.message : 'Error al iniciar el pago.';
    return { error: `No fue posible iniciar el pago: ${message}` };
  }

  revalidatePath('/account/pedidos');
  redirect(redirectTo);
}

/** Cancela un pedido del usuario (si está pendiente/en preparación) y repone stock. */
export async function cancelOrderAction(orderNumber: string): Promise<{ error?: string; ok?: boolean }> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Debes iniciar sesión.' };

  // RLS: el usuario solo puede leer sus propios pedidos.
  const { data } = await supabase
    .from('orders')
    .select('id, status, user_id, order_items(variant_id, quantity)')
    .eq('order_number', orderNumber)
    .maybeSingle();

  const order = data as unknown as {
    id: string;
    status: string;
    user_id: string;
    order_items: { variant_id: string | null; quantity: number }[];
  } | null;

  if (!order || order.user_id !== user.id) return { error: 'Pedido no encontrado.' };
  if (order.status !== 'pending' && order.status !== 'processing') {
    return { error: 'Este pedido ya no se puede cancelar.' };
  }

  const admin = createAdminSupabase();
  const { error: updErr } = await admin
    .from('orders')
    .update({ status: 'cancelled', payment_status: 'failed' } as never)
    .match({ id: order.id });
  if (updErr) return { error: 'No fue posible cancelar el pedido.' };

  // Reponer el stock descontado en la compra.
  for (const it of order.order_items ?? []) {
    if (!it.variant_id) continue;
    await admin.rpc('apply_inventory_movement', {
      p_variant_id: it.variant_id,
      p_type: 'in',
      p_quantity: it.quantity,
      p_reason: 'cancelacion',
      p_reference: orderNumber,
      p_actor: user.id,
    });
  }

  revalidatePath('/account/pedidos');
  revalidatePath(`/pedido/${orderNumber}`);
  return { ok: true };
}
