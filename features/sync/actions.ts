'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { hydrateCartItems } from './queries';
import { getProductSummariesByIds } from '@/features/catalog/queries';
import type { CartItem } from '@/store/cart';
import type { ProductSummary } from '@/types/product';

type Pair = { variantId: string; quantity: number };

async function currentUserId(): Promise<string | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function getOrCreateCartId(): Promise<string | null> {
  const supabase = await createServerSupabase();
  const userId = await currentUserId();
  if (!userId) return null;
  const { data: existing } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) return (existing as { id: string }).id;
  const { data: created } = await supabase
    .from('carts')
    .insert({ user_id: userId } as never)
    .select('id')
    .single();
  return (created as { id: string } | null)?.id ?? null;
}

/** Guarda (reemplaza) el carrito del usuario en la BD. */
export async function saveCart(pairs: Pair[]): Promise<void> {
  const cartId = await getOrCreateCartId();
  if (!cartId) return;
  const supabase = await createServerSupabase();
  await supabase.from('cart_items').delete().eq('cart_id', cartId);
  const clean = pairs.filter((p) => p.variantId && p.quantity > 0);
  if (clean.length) {
    await supabase
      .from('cart_items')
      .insert(clean.map((p) => ({ cart_id: cartId, variant_id: p.variantId, quantity: p.quantity })) as never);
  }
}

/** Fusiona el carrito local con el del servidor (máximo por variante) y lo devuelve. */
export async function mergeCart(local: Pair[]): Promise<CartItem[]> {
  const cartId = await getOrCreateCartId();
  if (!cartId) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('cart_items')
    .select('variant_id, quantity')
    .eq('cart_id', cartId);
  const server = (data as unknown as { variant_id: string; quantity: number }[]) ?? [];

  const merged = new Map<string, number>();
  for (const p of server) merged.set(p.variant_id, p.quantity);
  for (const p of local) {
    if (!p.variantId) continue;
    merged.set(p.variantId, Math.max(merged.get(p.variantId) ?? 0, p.quantity));
  }
  const pairs = [...merged.entries()].map(([variantId, quantity]) => ({ variantId, quantity }));
  await saveCart(pairs);
  return hydrateCartItems(pairs);
}

/** Guarda (reemplaza) la wishlist del usuario en la BD. */
export async function saveWishlist(productIds: string[]): Promise<void> {
  const supabase = await createServerSupabase();
  const userId = await currentUserId();
  if (!userId) return;
  await supabase.from('wishlist').delete().eq('user_id', userId);
  const ids = [...new Set(productIds)];
  if (ids.length) {
    await supabase
      .from('wishlist')
      .insert(ids.map((product_id) => ({ user_id: userId, product_id })) as never);
  }
}

/** Fusiona la wishlist local con la del servidor (unión) y la devuelve. */
export async function mergeWishlist(localIds: string[]): Promise<ProductSummary[]> {
  const supabase = await createServerSupabase();
  const userId = await currentUserId();
  if (!userId) return [];
  const { data } = await supabase.from('wishlist').select('product_id').eq('user_id', userId);
  const server = (data as unknown as { product_id: string }[]) ?? [];
  const union = [...new Set([...server.map((r) => r.product_id), ...localIds])];
  await saveWishlist(union);
  return getProductSummariesByIds(union);
}
