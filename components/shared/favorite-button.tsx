'use client';

import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/store/wishlist';
import { useMounted } from '@/hooks/use-mounted';
import type { ProductSummary } from '@/types/product';

/** Botón de favoritos conectado al store de wishlist (persistido). */
export function FavoriteButton({
  product,
  className,
}: {
  product: ProductSummary;
  className?: string;
}) {
  const mounted = useMounted();
  const items = useWishlistStore((s) => s.items);
  const toggle = useWishlistStore((s) => s.toggle);
  const active = mounted && items.some((i) => i.id === product.id);

  return (
    <button
      type="button"
      aria-label={active ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        toggle(product);
        toast.success(active ? 'Quitado de favoritos' : 'Añadido a favoritos');
      }}
      className={cn(
        'grid size-9 place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background',
        className,
      )}
    >
      <Heart className={cn('size-4', active && 'fill-destructive text-destructive')} />
    </button>
  );
}
