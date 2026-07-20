import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';

export interface ReviewEligibility {
  isLoggedIn: boolean;
  hasPurchased: boolean;
  /** Reseña existente del usuario (para editar), si la hay. */
  own: { rating: number; title: string | null; comment: string | null; isApproved: boolean } | null;
}

/**
 * Determina si el usuario actual puede opinar sobre un producto:
 * debe haber iniciado sesión y haberlo comprado. Devuelve además su
 * reseña previa (aunque esté pendiente de aprobación) para poder editarla.
 */
export async function getReviewEligibility(productId: string): Promise<ReviewEligibility> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isLoggedIn: false, hasPurchased: false, own: null };

  // Variantes del producto.
  const { data: variantRows } = await supabase
    .from('product_variants')
    .select('id')
    .match({ product_id: productId });
  const variantIds = ((variantRows as { id: string }[] | null) ?? []).map((v) => v.id);

  // ¿Algún pedido del usuario contiene una variante del producto?
  let hasPurchased = false;
  if (variantIds.length > 0) {
    const { data: purchased } = await supabase
      .from('order_items')
      .select('id, orders!inner(user_id)')
      .in('variant_id', variantIds)
      .eq('orders.user_id', user.id)
      .limit(1);
    hasPurchased = (((purchased as unknown as unknown[]) ?? []).length) > 0;
  }

  // Reseña previa del usuario.
  const { data: ownRow } = await supabase
    .from('reviews')
    .select('rating, title, comment, is_approved')
    .match({ product_id: productId, user_id: user.id })
    .maybeSingle();

  const own = ownRow as { rating: number; title: string | null; comment: string | null; is_approved: boolean } | null;

  return {
    isLoggedIn: true,
    hasPurchased,
    own: own
      ? { rating: own.rating, title: own.title, comment: own.comment, isApproved: own.is_approved }
      : null,
  };
}
