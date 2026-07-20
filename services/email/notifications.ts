import 'server-only';

import { createAdminSupabase } from '@/lib/supabase/server';
import { siteConfig } from '@/config/site';
import { getStoreSettings } from '@/features/settings/queries';
import { sendEmail, type EmailResult } from './index';
import {
  orderConfirmationEmail,
  orderStatusEmail,
  NOTIFIABLE_STATUSES,
  type NotifiableStatus,
  type OrderEmailItem,
} from './templates';

/**
 * Notificaciones de pedido. Todo lo de aquí es **best-effort**: si el correo
 * falla, se registra y la operación de negocio (crear el pedido, cambiar su
 * estado) sigue adelante como si nada.
 */

const paymentMethodLabels: Record<string, string> = {
  cod: 'Contra entrega',
  addi: 'Addi (paga después)',
  card: 'Tarjeta',
  pse: 'PSE',
};

export function paymentMethodLabel(method: string): string {
  return paymentMethodLabels[method] ?? method;
}

export interface OrderConfirmationParams {
  to: string;
  orderNumber: string;
  recipientName: string;
  items: OrderEmailItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  shippingAddress: { line1: string; line2?: string | null; city: string; state?: string | null };
}

/** Envía la confirmación de compra. Nunca lanza. */
export async function sendOrderConfirmation(
  params: OrderConfirmationParams,
): Promise<EmailResult> {
  try {
    const settings = await getStoreSettings();
    const message = orderConfirmationEmail({
      storeName: settings.storeName || siteConfig.name,
      siteUrl: siteConfig.url,
      orderNumber: params.orderNumber,
      recipientName: params.recipientName,
      items: params.items,
      subtotal: params.subtotal,
      discount: params.discount,
      shipping: params.shipping,
      tax: params.tax,
      grandTotal: params.grandTotal,
      paymentMethodLabel: paymentMethodLabel(params.paymentMethod),
      shippingAddress: params.shippingAddress,
    });
    return await sendEmail({ to: params.to, ...message });
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`[email] no se pudo componer la confirmación de ${params.orderNumber}: ${reason}`);
    return { ok: false, skipped: false, reason };
  }
}

/**
 * Igual que `sendOrderConfirmation`, pero reconstruyendo el pedido desde la BD
 * a partir de su número. Lo usan los webhooks de pago, que solo reciben la
 * referencia y no tienen a mano el carrito original.
 */
export async function sendOrderConfirmationByNumber(orderNumber: string): Promise<EmailResult> {
  try {
    const admin = createAdminSupabase();
    const { data } = await admin
      .from('orders')
      .select(
        'order_number, subtotal, discount_total, shipping_total, tax_total, grand_total, payment_method, shipping_address, profiles(email, full_name), order_items(product_name, variant_label, quantity, unit_price, line_total)',
      )
      .eq('order_number', orderNumber)
      .maybeSingle();

    const order = data as unknown as {
      subtotal: number;
      discount_total: number;
      shipping_total: number;
      tax_total: number;
      grand_total: number;
      payment_method: string | null;
      shipping_address: {
        recipient?: string | null;
        line1?: string | null;
        line2?: string | null;
        city?: string | null;
        state?: string | null;
      } | null;
      profiles: { email: string | null; full_name: string | null } | null;
      order_items: {
        product_name: string;
        variant_label: string | null;
        quantity: number;
        unit_price: number;
        line_total: number;
      }[];
    } | null;

    const to = order?.profiles?.email;
    if (!order || !to) {
      return { ok: false, skipped: true, reason: `Sin correo para el pedido ${orderNumber}` };
    }

    const addr = order.shipping_address ?? {};
    return await sendOrderConfirmation({
      to,
      orderNumber,
      recipientName: addr.recipient ?? order.profiles?.full_name ?? 'hola',
      items: (order.order_items ?? []).map((it) => ({
        productName: it.product_name,
        label: it.variant_label,
        quantity: it.quantity,
        unitPrice: Number(it.unit_price),
        lineTotal: Number(it.line_total),
      })),
      subtotal: Number(order.subtotal),
      discount: Number(order.discount_total),
      shipping: Number(order.shipping_total),
      tax: Number(order.tax_total),
      grandTotal: Number(order.grand_total),
      paymentMethod: order.payment_method ?? 'cod',
      shippingAddress: {
        line1: addr.line1 ?? '',
        line2: addr.line2 ?? null,
        city: addr.city ?? '',
        state: addr.state ?? null,
      },
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`[email] no se pudo reconstruir el pedido ${orderNumber}: ${reason}`);
    return { ok: false, skipped: false, reason };
  }
}

/** true si el estado merece avisar al comprador. */
export function isNotifiableStatus(status: string): status is NotifiableStatus {
  return NOTIFIABLE_STATUSES.includes(status as NotifiableStatus);
}

/**
 * Avisa del cambio de estado de un pedido. Busca el destinatario a partir del
 * pedido, así que sirve tanto para el panel como para los webhooks de pago.
 */
export async function notifyOrderStatusChange(
  orderNumber: string,
  status: string,
): Promise<EmailResult> {
  if (!isNotifiableStatus(status)) {
    return { ok: false, skipped: true, reason: `Estado sin notificación: ${status}` };
  }

  try {
    const admin = createAdminSupabase();
    const { data } = await admin
      .from('orders')
      .select('order_number, shipping_address, profiles(email, full_name)')
      .eq('order_number', orderNumber)
      .maybeSingle();

    const order = data as unknown as {
      order_number: string;
      shipping_address: { recipient?: string | null } | null;
      profiles: { email: string | null; full_name: string | null } | null;
    } | null;

    const to = order?.profiles?.email;
    if (!to) {
      return { ok: false, skipped: true, reason: `Sin correo para el pedido ${orderNumber}` };
    }

    const settings = await getStoreSettings();
    const recipientName =
      order?.shipping_address?.recipient ?? order?.profiles?.full_name ?? 'hola';

    const message = orderStatusEmail({
      storeName: settings.storeName || siteConfig.name,
      siteUrl: siteConfig.url,
      orderNumber,
      recipientName,
      status,
    });
    return await sendEmail({ to, ...message });
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`[email] no se pudo notificar el estado de ${orderNumber}: ${reason}`);
    return { ok: false, skipped: false, reason };
  }
}
