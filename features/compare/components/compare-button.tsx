'use client';

import { Scale } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCompareStore, MAX_COMPARE } from '@/store/compare';
import { useMounted } from '@/hooks/use-mounted';
import type { ProductSummary } from '@/types/product';

/**
 * Añade o quita un producto del comparador.
 * - `variant="icon"`: overlay de la tarjeta de producto.
 * - `variant="full"`: botón con texto para la ficha de producto.
 */
export function CompareButton({
  product,
  variant = 'icon',
  className,
}: {
  product: ProductSummary;
  variant?: 'icon' | 'full';
  className?: string;
}) {
  const mounted = useMounted();
  const items = useCompareStore((s) => s.items);
  const toggle = useCompareStore((s) => s.toggle);
  const active = mounted && items.some((i) => i.id === product.id);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    const ok = toggle(product);
    if (!ok) {
      toast.error(`Solo puedes comparar ${MAX_COMPARE} productos a la vez.`);
      return;
    }
    toast.success(active ? 'Quitado del comparador' : 'Añadido al comparador');
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          'inline-flex h-11 items-center justify-center gap-2 border-2 px-5 font-display text-xs font-bold tracking-[0.12em] uppercase transition-colors',
          active
            ? 'border-foreground bg-foreground text-background'
            : 'border-foreground hover:bg-foreground hover:text-background',
          className,
        )}
      >
        <Scale className="size-4" />
        {active ? 'En el comparador' : 'Comparar'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? 'Quitar del comparador' : 'Añadir al comparador'}
      aria-pressed={active}
      className={cn(
        'grid size-9 place-items-center rounded-full shadow-sm backdrop-blur transition-colors',
        active
          ? 'bg-foreground text-background'
          : 'bg-background/80 text-foreground hover:bg-background',
        className,
      )}
    >
      <Scale className="size-4" />
    </button>
  );
}
