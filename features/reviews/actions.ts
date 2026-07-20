'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { reviewSchema } from '@/schemas/review';

export interface ReviewActionResult {
  error?: string;
  ok?: boolean;
}

/** Publica (o actualiza) la reseña del usuario para un producto que ha comprado. */
export async function createReviewAction(
  input: unknown,
  productSlug: string,
): Promise<ReviewActionResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Revisa tu reseña.' };
  }
  const { productId, rating, title, comment } = parsed.data;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Debes iniciar sesión para opinar.' };

  // Verificar compra: alguna variante del producto en un pedido del usuario.
  const { data: variantRows } = await supabase
    .from('product_variants')
    .select('id')
    .match({ product_id: productId });
  const variantIds = ((variantRows as { id: string }[] | null) ?? []).map((v) => v.id);
  if (variantIds.length === 0) return { error: 'Producto no válido.' };

  const { data: purchased } = await supabase
    .from('order_items')
    .select('id, orders!inner(user_id)')
    .in('variant_id', variantIds)
    .eq('orders.user_id', user.id)
    .limit(1);
  if ((((purchased as unknown as unknown[]) ?? []).length) === 0) {
    return { error: 'Solo puedes opinar sobre productos que has comprado.' };
  }

  // Insertar o actualizar (unique product_id + user_id). Queda pendiente de aprobación.
  const { error } = await supabase.from('reviews').upsert(
    {
      product_id: productId,
      user_id: user.id,
      rating,
      title: title ?? null,
      comment: comment ?? null,
      is_approved: false,
    } as never,
    { onConflict: 'product_id,user_id' },
  );

  if (error) return { error: 'No fue posible publicar tu reseña.' };
  revalidatePath(`/producto/${productSlug}`);
  return { ok: true };
}
