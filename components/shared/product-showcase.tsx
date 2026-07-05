import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from './product-card';
import type { ProductSummary } from '@/types/product';

/** Sección reutilizable: título + grid de productos + enlace "ver todo". */
export function ProductShowcase({
  title,
  eyebrow,
  href,
  products,
  className,
}: {
  title: string;
  eyebrow?: string;
  href?: string;
  products: ProductSummary[];
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className={className}>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
        <div>
          {eyebrow && <p className="kicker text-muted-foreground">{eyebrow}</p>}
          <h2 className="mt-2 text-4xl md:text-6xl">{title}</h2>
        </div>
        {href && (
          <Button asChild variant="link" className="text-sm">
            <Link href={href}>
              Ver todo <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 2} />
        ))}
      </div>
    </section>
  );
}
