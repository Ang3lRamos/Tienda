'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Botón de favoritos. En la Fase 4 se conecta al store de wishlist + Supabase;
 * por ahora alterna el estado visual y avisa.
 */
export function FavoriteButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      aria-label={active ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      aria-pressed={active}
      data-product-id={productId}
      onClick={(e) => {
        e.preventDefault();
        setActive((v) => !v);
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
