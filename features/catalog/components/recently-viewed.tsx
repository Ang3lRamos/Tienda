'use client';

import { ProductCard } from '@/components/shared/product-card';
import { useRecentlyViewedStore } from '@/store/recently-viewed';
import { useMounted } from '@/hooks/use-mounted';

/** Tira de productos vistos recientemente (excluye el actual). */
export function RecentlyViewed({ currentId }: { currentId?: string }) {
  const mounted = useMounted();
  const items = useRecentlyViewedStore((s) => s.items).filter((p) => p.id !== currentId);

  if (!mounted || items.length === 0) return null;

  return (
    <section className="mt-20">
      <h2 className="mb-8 text-3xl md:text-4xl">Vistos recientemente</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {items.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
