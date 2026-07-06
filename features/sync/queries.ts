import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import type { CartItem } from '@/store/cart';

type RawVariant = {
  id: string;
  color: string | null;
  size: string | null;
  price: number | null;
  product_id: string;
  products: {
    name: string;
    slug: string;
    base_price: number;
    status: string;
    product_images: { url: string; is_primary: boolean; position: number }[];
  } | null;
  inventory: { quantity: number; reserved: number } | { quantity: number; reserved: number }[] | null;
};

/** Reconstruye items de carrito (forma del store) a partir de variante+cantidad. */
export async function hydrateCartItems(
  pairs: { variantId: string; quantity: number }[],
): Promise<CartItem[]> {
  if (pairs.length === 0) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('product_variants')
    .select(
      'id, color, size, price, product_id, products(name, slug, base_price, status, product_images(url, is_primary, position)), inventory(quantity, reserved)',
    )
    .in('id', pairs.map((p) => p.variantId));

  const rows = (data as unknown as RawVariant[]) ?? [];
  const byId = new Map(rows.map((r) => [r.id, r]));

  const items: CartItem[] = [];
  for (const pair of pairs) {
    const r = byId.get(pair.variantId);
    if (!r || !r.products || r.products.status !== 'published') continue;
    const inv = Array.isArray(r.inventory) ? r.inventory[0] : r.inventory;
    const available = inv ? Math.max(0, inv.quantity - inv.reserved) : 0;
    const primary = [...(r.products.product_images ?? [])].sort(
      (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
    )[0];
    items.push({
      key: r.id,
      productId: r.product_id,
      variantId: r.id,
      name: r.products.name,
      slug: r.products.slug,
      image: primary?.url ?? null,
      color: r.color,
      size: r.size,
      unitPrice: r.price ?? r.products.base_price,
      maxStock: available || pair.quantity,
      quantity: Math.max(1, Math.min(pair.quantity, available || pair.quantity)),
    });
  }
  return items;
}
