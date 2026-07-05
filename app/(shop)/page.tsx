import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/shared/product-card';
import { Marquee } from '@/components/shared/marquee';
import { getProducts } from '@/features/catalog/queries';

const categories = [
  { name: 'Mujer', href: '/catalogo?gender=women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000' },
  { name: 'Hombre', href: '/catalogo?gender=men', image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=1000' },
  { name: 'Calzado', href: '/catalogo?categoria=calzado', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000' },
];

export default async function HomePage() {
  const { products } = await getProducts({ sort: 'destacados' });
  const featured = products.slice(0, 8);

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden bg-foreground">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600"
          alt="Editorial de moda Otoño/Invierno 2026"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-80 grayscale"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/30" />

        <div className="absolute inset-0 mx-auto flex max-w-[1600px] flex-col justify-end px-4 pb-14 sm:px-6">
          <p className="kicker mb-4 text-white/80 duration-700 animate-in fade-in slide-in-from-bottom-4">
            01 / Nueva colección
          </p>
          <h1 className="display-xxl max-w-[15ch] text-white duration-1000 animate-in fade-in slide-in-from-bottom-6">
            The New Era
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-4 duration-1000 animate-in fade-in slide-in-from-bottom-8">
            <Button asChild size="lg" className="bg-white text-black hover:bg-white/85">
              <Link href="/catalogo">
                Explorar <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black"
            >
              <Link href="/catalogo?ofertas=1">Ver ofertas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========================== MARQUEE ========================== */}
      <div className="border-y-2 border-foreground bg-background py-3">
        <Marquee
          items={['Átelier', 'Otoño / Invierno 2026', 'Envío gratis', 'Nueva colección']}
          speed="fast"
        />
      </div>

      {/* ========================= CATEGORÍAS ======================== */}
      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-4xl md:text-6xl">Compra por categoría</h2>
        </div>
        <div className="grid gap-1 md:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative aspect-4/5 overflow-hidden bg-muted md:aspect-3/4"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/40" />
              <div className="absolute inset-0 flex items-end justify-between p-6">
                <h3 className="text-3xl text-white md:text-4xl">{cat.name}</h3>
                <span className="grid size-11 place-items-center border-2 border-white text-white transition-colors group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight className="size-5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== PRODUCTOS DESTACADOS ==================== */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-4 pb-20 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
            <h2 className="text-4xl md:text-6xl">Lo más deseado</h2>
            <Button asChild variant="link" className="text-sm">
              <Link href="/catalogo">
                Ver todo <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
        </section>
      )}

      {/* ===================== BANNER EDITORIAL ====================== */}
      <section className="grid md:grid-cols-2">
        <div className="relative aspect-square md:aspect-auto">
          <Image
            src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200"
            alt="Editorial de temporada"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover grayscale"
          />
        </div>
        <div className="flex flex-col justify-center gap-6 bg-foreground p-10 text-background md:p-20">
          <p className="kicker text-background/70">Manifiesto</p>
          <h2 className="text-4xl leading-none md:text-6xl">
            Diseñado para durar. Pensado para destacar.
          </h2>
          <p className="max-w-md text-sm text-background/70">
            Prendas atemporales, materiales nobles y una silueta que habla por sí
            sola. Menos, pero mejor.
          </p>
          <div>
            <Button
              asChild
              size="lg"
              className="bg-background text-foreground hover:bg-background/85"
            >
              <Link href="/catalogo?sort=nuevos">
                Ver colección <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
