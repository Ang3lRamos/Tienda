'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/shared/product-card';
import { useWishlistStore } from '@/store/wishlist';
import { useMounted } from '@/hooks/use-mounted';

export function WishlistGrid() {
  const mounted = useMounted();
  const items = useWishlistStore((s) => s.items);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 border-2 border-dashed border-border px-6 py-20 text-center">
        <Heart className="size-10 text-muted-foreground" />
        <p className="max-w-sm text-sm text-muted-foreground">
          Aún no tienes favoritos. Toca el corazón en cualquier producto para
          guardarlo aquí.
        </p>
        <Button asChild variant="outline">
          <Link href="/catalogo">Descubrir productos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
