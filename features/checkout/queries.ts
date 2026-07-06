import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import type { DiscountType } from '@/types/database.types';

export interface CheckoutLine {
  variantId: string;
  productId: string;
  productName: string;
  slug: string;
  sku: string | null;
  color: string | null;
  size: string | null;
  unitPrice: number;
  available: number;
  published: boolean;
}

/** Trae la info REAL de las variantes del carrito (precio y stock desde la BD). */
export async function getVariantsForCheckout(
  variantIds: string[],
): Promise<CheckoutLine[]> {
  if (variantIds.length === 0) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('product_variants')
    .select(
      'id, sku, color, size, price, product_id, products(name, slug, base_price, status), inventory(quantity, reserved)',
    )
    .in('id', variantIds);

  const rows =
    (data as unknown as {
      id: string;
      sku: string | null;
      color: string | null;
      size: string | null;
      price: number | null;
      product_id: string;
      products: { name: string; slug: string; base_price: number; status: string } | null;
      inventory: { quantity: number; reserved: number } | { quantity: number; reserved: number }[] | null;
    }[]) ?? [];

  return rows.map((r) => {
    const inv = Array.isArray(r.inventory) ? r.inventory[0] : r.inventory;
    return {
      variantId: r.id,
      productId: r.product_id,
      productName: r.products?.name ?? 'Producto',
      slug: r.products?.slug ?? '',
      sku: r.sku,
      color: r.color,
      size: r.size,
      unitPrice: r.price ?? r.products?.base_price ?? 0,
      available: inv ? Math.max(0, inv.quantity - inv.reserved) : 0,
      published: r.products?.status === 'published',
    };
  });
}

export interface OrderItemView {
  productName: string;
  label: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}
export interface OrderDetail {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  grandTotal: number;
  placedAt: string | null;
  shippingAddress: Record<string, unknown> | null;
  items: OrderItemView[];
}

/** Pedido por número (RLS: solo el dueño o admin pueden verlo). */
export async function getOrderByNumber(orderNumber: string): Promise<OrderDetail | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('orders')
    .select(
      'order_number, status, payment_status, subtotal, discount_total, shipping_total, grand_total, placed_at, shipping_address, order_items(product_name, variant_label, quantity, unit_price, line_total)',
    )
    .eq('order_number', orderNumber)
    .maybeSingle();

  const o = data as unknown as {
    order_number: string;
    status: string;
    payment_status: string;
    subtotal: number;
    discount_total: number;
    shipping_total: number;
    grand_total: number;
    placed_at: string | null;
    shipping_address: Record<string, unknown> | null;
    order_items: {
      product_name: string;
      variant_label: string | null;
      quantity: number;
      unit_price: number;
      line_total: number;
    }[];
  } | null;
  if (!o) return null;

  return {
    orderNumber: o.order_number,
    status: o.status,
    paymentStatus: o.payment_status,
    subtotal: o.subtotal,
    discountTotal: o.discount_total,
    shippingTotal: o.shipping_total,
    grandTotal: o.grand_total,
    placedAt: o.placed_at,
    shippingAddress: o.shipping_address,
    items: (o.order_items ?? []).map((it) => ({
      productName: it.product_name,
      label: it.variant_label,
      quantity: it.quantity,
      unitPrice: it.unit_price,
      lineTotal: it.line_total,
    })),
  };
}

export interface ValidCoupon {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minPurchase: number;
}

/** Valida un cupón por código (activo y dentro de su ventana de fechas). */
export async function validateCoupon(code: string): Promise<ValidCoupon | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('coupons')
    .select('id, code, type, value, min_purchase, max_uses, used_count, starts_at, ends_at, is_active')
    .eq('code', code.toUpperCase())
    .maybeSingle();

  const c = data as unknown as {
    id: string;
    code: string;
    type: DiscountType;
    value: number;
    min_purchase: number;
    max_uses: number | null;
    used_count: number;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
  } | null;

  if (!c || !c.is_active) return null;
  const now = Date.now();
  if (c.starts_at && new Date(c.starts_at).getTime() > now) return null;
  if (c.ends_at && new Date(c.ends_at).getTime() < now) return null;
  if (c.max_uses != null && c.used_count >= c.max_uses) return null;

  return { id: c.id, code: c.code, type: c.type, value: c.value, minPurchase: c.min_purchase };
}
