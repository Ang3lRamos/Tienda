'use client';

import { useEffect } from 'react';
import { useRecentlyViewedStore } from '@/store/recently-viewed';
import type { ProductSummary } from '@/types/product';

/** Registra el producto actual en "vistos recientemente" (no renderiza nada). */
export function TrackRecentlyViewed({ product }: { product: ProductSummary }) {
  const track = useRecentlyViewedStore((s) => s.track);
  useEffect(() => {
    track(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);
  return null;
}
