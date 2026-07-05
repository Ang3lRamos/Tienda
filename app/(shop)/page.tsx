import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/shared/product-card';
import { Marquee } from '@/components/shared/marquee';
import type { ProductSummary } from '@/types/product';

/**
 * Landing brutalista (Mono B&N). Datos de muestra — en la Fase 3 se reemplazan
 * por consultas reales a Supabase (`products_with_stock`).
 */
const demoProducts: ProductSummary[] = [
  {
    id: '1', name: 'Camiseta Oversize Essential', slug: 'camiseta-oversize-essential',
    price: 89900, compareAtPrice: 119900,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    imageAlt: 'Camiseta oversize', categoryName: 'Camisetas', brandName: 'Urbano',
    gender: 'unisex', isFeatured: true, ratingAvg: 4.6, ratingCount: 128,
    stockStatus: 'disponible', availableColors: ['Negro', 'Blanco'], availableSizes: ['S', 'M', 'L'],
  },
  {
    id: '2', name: 'Chaqueta Impermeable Nordik', slug: 'chaqueta-impermeable-nordik',
    price: 329900, compareAtPrice: 399900,
    imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800',
    imageAlt: 'Chaqueta impermeable', categoryName: 'Chaquetas', brandName: 'Nordik',
    gender: 'unisex', isFeatured: true, ratingAvg: 4.8, ratingCount: 64,
    stockStatus: 'disponible', availableColors: ['Verde', 'Negro'], availableSizes: ['M', 'L'],
  },
  {
    id: '3', name: 'Vestido Midi Rojo Solene', slug: 'vestido-midi-rojo-solene',
    price: 219900, compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    imageAlt: 'Vestido midi', categoryName: 'Vestidos', brandName: 'Solene',
    gender: 'women', isFeatured: true, ratingAvg: 4.7, ratingCount: 92,
    stockStatus: 'ultimas_unidades', availableColors: ['Rojo'], availableSizes: ['S', 'M'],
  },
  {
    id: '4', name: 'Tenis Urbanos Classic', slug: 'tenis-urbanos-classic',
    price: 249900, compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
    imageAlt: 'Tenis urbanos', categoryName: 'Calzado', brandName: 'Urbano',
    gender: 'unisex', isFeatured: true, ratingAvg: 4.9, ratingCount: 210,
    stockStatus: 'disponible', availableColors: ['Blanco'], availableSizes: ['40', '42'],
  },
  {
    id: '5', name: 'Jeans Slim Fit Indigo', slug: 'jeans-slim-fit-indigo',
    price: 159900, compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
    imageAlt: 'Jeans slim', categoryName: 'Pantalones', brandName: 'Aurora',
    gender: 'men', isFeatured: true, ratingAvg: 4.5, ratingCount: 180,
    stockStatus: 'disponible', availableColors: ['Indigo'], availableSizes: ['30', '32', '34'],
  },
  {
    id: '6', name: 'Abrigo Lana Editorial', slug: 'abrigo-lana-editorial',
    price: 459900, compareAtPrice: 559900,
    imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
    imageAlt: 'Abrigo de lana', categoryName: 'Chaquetas', brandName: 'Aurora',
    gender: 'women', isFeatured: true, ratingAvg: 4.8, ratingCount: 47,
    stockStatus: 'disponible', availableColors: ['Camel', 'Negro'], availableSizes: ['S', 'M', 'L'],
  },
  {
    id: '7', name: 'Camisa Popelín Blanca', slug: 'camisa-popelin-blanca',
    price: 129900, compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    imageAlt: 'Camisa blanca', categoryName: 'Camisetas', brandName: 'Solene',
    gender: 'women', isFeatured: true, ratingAvg: 4.4, ratingCount: 73,
    stockStatus: 'disponible', availableColors: ['Blanco'], availableSizes: ['S', 'M', 'L'],
  },
  {
    id: '8', name: 'Botas Chelsea Cuero', slug: 'botas-chelsea-cuero',
    price: 389900, compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800',
    imageAlt: 'Botas chelsea', categoryName: 'Calzado', brandName: 'Nordik',
    gender: 'men', isFeatured: true, ratingAvg: 4.9, ratingCount: 156,
    stockStatus: 'ultimas_unidades', availableColors: ['Negro'], availableSizes: ['40', '41', '42'],
  },
];

const categories = [
  { name: 'Mujer', href: '/catalogo?gender=women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000' },
  { name: 'Hombre', href: '/catalogo?gender=men', image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=1000' },
  { name: 'Calzado', href: '/catalogo?categoria=calzado', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000' },
];

export default function HomePage() {
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
          {demoProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 2} />
          ))}
        </div>
      </section>

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
