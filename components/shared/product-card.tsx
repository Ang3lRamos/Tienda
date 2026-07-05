import Link from 'next/link';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { Price } from './price';
import { StockBadge } from './stock-badge';
import { FavoriteButton } from './favorite-button';
import { cn, discountPercent } from '@/lib/utils';
import type { ProductSummary } from '@/types/product';

/** Tarjeta de producto brutalista para listados y carruseles. */
export function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: ProductSummary;
  className?: string;
  priority?: boolean;
}) {
  const percent = discountPercent(product.price, product.compareAtPrice);
  const href = `/producto/${product.slug}`;
  const soldOut = product.stockStatus === 'agotado';

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <div className="relative aspect-3/4 overflow-hidden bg-muted">
        <Link href={href} aria-label={product.name}>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt ?? product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'object-cover transition-transform duration-700 ease-out group-hover:scale-105',
                soldOut && 'opacity-60 grayscale',
              )}
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <ImageIcon className="size-8" />
            </div>
          )}
        </Link>

        {/* Tags */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-col gap-1.5">
            {percent > 0 && (
              <span className="bg-foreground px-2 py-1 text-[0.65rem] font-bold tracking-[0.12em] text-background">
                −{percent}%
              </span>
            )}
            {product.stockStatus !== 'disponible' && (
              <span className="pointer-events-auto">
                <StockBadge status={product.stockStatus} />
              </span>
            )}
          </div>
          <div className="pointer-events-auto opacity-0 transition-opacity group-hover:opacity-100">
            <FavoriteButton productId={product.id} />
          </div>
        </div>

        {/* Barra de acción (hover) */}
        <Link
          href={href}
          className="absolute inset-x-0 bottom-0 translate-y-full bg-foreground py-3 text-center text-[0.7rem] font-bold tracking-[0.2em] text-background uppercase transition-transform duration-300 ease-out group-hover:translate-y-0"
        >
          Ver producto
        </Link>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {product.brandName && (
          <span className="kicker text-muted-foreground">{product.brandName}</span>
        )}
        <Link
          href={href}
          className="font-display text-sm font-bold tracking-tight uppercase decoration-1 underline-offset-4 hover:underline"
        >
          {product.name}
        </Link>
        <Price
          value={product.price}
          compareAt={product.compareAtPrice}
          className="mt-1"
        />
      </div>
    </article>
  );
}
