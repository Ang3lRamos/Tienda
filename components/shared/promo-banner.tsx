import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { ActivePromotion } from '@/features/promotions/queries';

/** Banner promocional full-width con la promoción activa. */
export function PromoBanner({ promo }: { promo: ActivePromotion }) {
  const value =
    promo.type === 'percentage' ? `${promo.value}%` : formatPrice(promo.value);

  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      {promo.bannerImageUrl && (
        <Image
          src={promo.bannerImageUrl}
          alt={promo.name}
          fill
          sizes="100vw"
          className="object-cover opacity-30 grayscale"
        />
      )}
      <div className="relative mx-auto flex max-w-[1600px] flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between md:py-20">
        <div>
          <p className="kicker text-background/60">Promoción</p>
          <h2 className="mt-3 text-4xl leading-none md:text-7xl">
            {promo.name}
          </h2>
          {promo.description && (
            <p className="mt-3 max-w-md text-sm text-background/70">{promo.description}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-start gap-4 md:items-end">
          <span className="font-display text-6xl leading-none font-black md:text-8xl">
            −{value}
          </span>
          <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/85">
            <Link href="/catalogo?ofertas=1">
              Comprar ofertas <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
