import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import type { DiscountType } from '@/types/database.types';

export interface ActivePromotion {
  name: string;
  description: string | null;
  type: DiscountType;
  value: number;
  bannerImageUrl: string | null;
}

/** Devuelve la primera promoción activa dentro de su ventana de fechas. */
export async function getActivePromotion(): Promise<ActivePromotion | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('promotions')
    .select('name, description, type, value, banner_image_url, starts_at, ends_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10);

  const rows =
    (data as unknown as {
      name: string;
      description: string | null;
      type: DiscountType;
      value: number;
      banner_image_url: string | null;
      starts_at: string | null;
      ends_at: string | null;
    }[]) ?? [];

  const now = Date.now();
  const active = rows.find(
    (p) =>
      (!p.starts_at || new Date(p.starts_at).getTime() <= now) &&
      (!p.ends_at || new Date(p.ends_at).getTime() >= now),
  );
  if (!active) return null;

  return {
    name: active.name,
    description: active.description,
    type: active.type,
    value: active.value,
    bannerImageUrl: active.banner_image_url,
  };
}
