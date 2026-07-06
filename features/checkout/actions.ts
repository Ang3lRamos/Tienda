'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server';
import {
  checkoutSchema,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
} from '@/schemas/checkout';
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

  // 3) Totales
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const grandTotal = Math.max(0, subtotal - discount) + shipping;
  const orderNumber = `ORD-${new Date().getFullYear()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

  // 4) Pago (proveedor desacoplado)
  const payment = await getPaymentProvider(paymentMethod).createPayment({
    orderNumber,
    amount: grandTotal,
    currency: siteConfig.currency,
    customerEmail: user.email,
  });

  // 5) Escrituras de servidor (admin: operación controlada tras autenticar)
  const admin = createAdminSupabase();

  const { data: order, error: orderErr } = await admin
    .from('orders')
    .insert({
      user_id: user.id,
      order_number: orderNumber,
      status: 'pending',
      payment_status: payment.status,
      subtotal,
      discount_total: discount,
      shipping_total: shipping,
      tax_total: 0,
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

  // 6) Descontar stock de forma transaccional por variante
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

  revalidatePath('/account/pedidos');
  redirect(`/pedido/${orderNumber}`);
}
