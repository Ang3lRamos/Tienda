'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingBag, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Price } from '@/components/shared/price';
import { StockBadge } from '@/components/shared/stock-badge';
import { FavoriteButton } from '@/components/shared/favorite-button';
import { cn } from '@/lib/utils';
import type { ProductDetail } from '@/types/product';

export function ProductPurchase({ product }: { product: ProductDetail }) {
  const hasColors = product.availableColors.length > 0;
  const hasSizes = product.availableSizes.length > 0;

  const [color, setColor] = useState<string | null>(
    hasColors ? product.availableColors[0].name : null,
  );
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  // Variante seleccionada según color/talla.
  const variant = product.variants.find(
    (v) => (!hasColors || v.color === color) && (!hasSizes || v.size === size),
  );

  // Tallas con stock para el color elegido.
  const sizeAvailable = (s: string) =>
    product.variants.some(
      (v) => v.size === s && (!hasColors || v.color === color) && v.available > 0,
    );

  const needsSelection = (hasColors && !color) || (hasSizes && !size);
  const soldOut = variant ? variant.available <= 0 : product.stockStatus === 'agotado';
  const unitPrice = variant?.price ?? product.price;

  function addToCart() {
    if (needsSelection) {
      toast.error('Selecciona una talla');
      return;
    }
    if (soldOut) return;
    // TODO(Fase 4): conectar al store del carrito + Supabase.
    toast.success('Añadido al carrito', {
      description: `${product.name}${size ? ` · Talla ${size}` : ''}${color ? ` · ${color}` : ''} × ${qty}`,
    });
  }

  return (
    <div className="space-y-6">
      <Price value={unitPrice} compareAt={product.compareAtPrice} size="lg" />

      <div className="flex items-center gap-3">
        <StockBadge status={variant?.stockStatus ?? product.stockStatus} />
        {variant && variant.available > 0 && variant.available <= 5 && (
          <span className="text-xs text-muted-foreground">
            Quedan {variant.available}
          </span>
        )}
      </div>

      {/* Color */}
      {hasColors && (
        <div className="space-y-2">
          <p className="kicker">Color: <span className="text-muted-foreground">{color}</span></p>
          <div className="flex flex-wrap gap-2">
            {product.availableColors.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c.name)}
                aria-label={c.name}
                title={c.name}
                className={cn(
                  'size-9 border-2 transition-transform',
                  color === c.name ? 'border-foreground scale-110' : 'border-border',
                )}
                style={{ backgroundColor: c.hex ?? 'transparent' }}
              >
                {!c.hex && <span className="text-[0.6rem]">{c.name.slice(0, 2)}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Talla */}
      {hasSizes && (
        <div className="space-y-2">
          <p className="kicker">Talla</p>
          <div className="flex flex-wrap gap-2">
            {product.availableSizes.map((s) => {
              const avail = sizeAvailable(s);
              return (
                <button
                  key={s}
                  disabled={!avail}
                  onClick={() => setSize(s)}
                  className={cn(
                    'grid h-11 min-w-11 place-items-center border-2 px-2 text-sm font-bold transition-colors',
                    size === s
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground',
                    !avail && 'cursor-not-allowed text-muted-foreground line-through opacity-40 hover:border-border',
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cantidad */}
      <div className="space-y-2">
        <p className="kicker">Cantidad</p>
        <div className="flex w-fit items-center border-2 border-foreground">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid size-11 place-items-center hover:bg-secondary"
            aria-label="Menos"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-12 text-center text-sm font-bold tabular-nums">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="grid size-11 place-items-center hover:bg-secondary"
            aria-label="Más"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex gap-3">
          <Button size="lg" className="flex-1" onClick={addToCart} disabled={soldOut}>
            <ShoppingBag className="size-4" />
            {soldOut ? 'Agotado' : 'Añadir al carrito'}
          </Button>
          <div className="grid size-14 shrink-0 place-items-center border-2 border-foreground">
            <FavoriteButton productId={product.id} className="bg-transparent shadow-none" />
          </div>
        </div>
        <Button size="lg" variant="outline" onClick={addToCart} disabled={soldOut}>
          Comprar ahora
        </Button>
        <button className="mt-1 inline-flex items-center justify-center gap-2 text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase hover:text-foreground">
          <MessageCircle className="size-4" /> Consultar al asistente
        </button>
      </div>
    </div>
  );
}
