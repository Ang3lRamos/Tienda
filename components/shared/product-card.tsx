import Link from 'next/link';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { Price } from './price';
import { StockBadge } from './stock-badge';
import { Rating } from './rating';
import { FavoriteButton } from './favorite-button';
import { cn, discountPercent } from '@/lib/utils';
import type { ProductSummary } from '@/types/product';

/** Tarjeta de producto para listados y carruseles. */
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

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-muted">
        <Link href={href} aria-label={product.name}>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt ?? product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <ImageIcon className="size-8" />
            </div>
          )}
        </Link>

        {/* Overlays */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            {percent > 0 && (
              <span className="pointer-events-auto rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
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
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {product.brandName && (
          <span className="text-xs tracking-wide text-muted-foreground uppercase">
            {product.brandName}
          </span>
        )}
        <Link href={href} className="font-medium hover:underline">
          {product.name}
        </Link>
        {product.ratingCount > 0 && (
          <Rating value={product.ratingAvg} count={product.ratingCount} />
        )}
        <Price
          value={product.price}
          compareAt={product.compareAtPrice}
          className="mt-1"
        />
      </div>
    </article>
  );
}
