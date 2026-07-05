import Link from 'next/link';
import { ArrowRight, Sparkles, Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/shared/product-card';
import { siteConfig } from '@/config/site';
import type { ProductSummary } from '@/types/product';

/**
 * Landing (Fase 1). Muestra el sistema de diseño y los componentes de tienda.
 * Datos de muestra abajo — en la Fase 3 se reemplazan por consultas reales a
 * Supabase (`products_with_stock`). Secciones completas en la Fase 5.
 */
const demoProducts: ProductSummary[] = [
  {
    id: '1',
    name: 'Camiseta Oversize Essential',
    slug: 'camiseta-oversize-essential',
    price: 89900,
    compareAtPrice: 119900,
    imageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    imageAlt: 'Camiseta oversize',
    categoryName: 'Camisetas',
    brandName: 'Urbano',
    gender: 'unisex',
    isFeatured: true,
    ratingAvg: 4.6,
    ratingCount: 128,
    stockStatus: 'disponible',
    availableColors: ['Negro', 'Blanco'],
    availableSizes: ['S', 'M', 'L'],
  },
  {
    id: '2',
    name: 'Chaqueta Impermeable Nordik',
    slug: 'chaqueta-impermeable-nordik',
    price: 329900,
    compareAtPrice: 399900,
    imageUrl:
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800',
    imageAlt: 'Chaqueta impermeable',
    categoryName: 'Chaquetas',
    brandName: 'Nordik',
    gender: 'unisex',
    isFeatured: true,
    ratingAvg: 4.8,
    ratingCount: 64,
    stockStatus: 'disponible',
    availableColors: ['Verde', 'Negro'],
    availableSizes: ['M', 'L'],
  },
  {
    id: '3',
    name: 'Vestido Midi Rojo Solene',
    slug: 'vestido-midi-rojo-solene',
    price: 219900,
    compareAtPrice: null,
    imageUrl:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    imageAlt: 'Vestido rojo midi',
    categoryName: 'Vestidos',
    brandName: 'Solene',
    gender: 'women',
    isFeatured: true,
    ratingAvg: 4.7,
    ratingCount: 92,
    stockStatus: 'ultimas_unidades',
    availableColors: ['Rojo'],
    availableSizes: ['S', 'M'],
  },
  {
    id: '4',
    name: 'Tenis Urbanos Classic',
    slug: 'tenis-urbanos-classic',
    price: 249900,
    compareAtPrice: null,
    imageUrl:
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
    imageAlt: 'Tenis urbanos blancos',
    categoryName: 'Calzado',
    brandName: 'Urbano',
    gender: 'unisex',
    isFeatured: true,
    ratingAvg: 4.9,
    ratingCount: 210,
    stockStatus: 'disponible',
    availableColors: ['Blanco'],
    availableSizes: ['40', '42'],
  },
];

const perks = [
  { icon: Truck, title: 'Envío rápido', desc: 'Gratis desde $200.000' },
  { icon: RefreshCw, title: 'Devoluciones', desc: '30 días para cambios' },
  { icon: ShieldCheck, title: 'Pago seguro', desc: 'Compra protegida' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center md:py-28">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-3.5" /> Nueva colección · Otoño 2026
            </span>
            <h1 className="font-serif text-5xl leading-[1.05] md:text-6xl">
              {siteConfig.tagline}
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/catalogo">
                  Explorar catálogo <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/catalogo?ofertas=1">Ver ofertas</Link>
              </Button>
            </div>
          </div>

          <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-linear-to-br from-secondary to-muted">
            <div className="absolute inset-0 grid place-items-center text-muted-foreground">
              <span className="font-serif text-2xl">Editorial</span>
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="border-y border-border/60 bg-muted/20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
          {perks.map((perk) => (
            <div key={perk.title} className="flex items-center gap-3">
              <perk.icon className="size-6 text-accent" />
              <div>
                <p className="text-sm font-medium">{perk.title}</p>
                <p className="text-sm text-muted-foreground">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Productos destacados */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl">Productos destacados</h2>
            <p className="mt-1 text-muted-foreground">
              Nuestra selección de la temporada.
            </p>
          </div>
          <Button asChild variant="link" className="hidden sm:inline-flex">
            <Link href="/catalogo">
              Ver todo <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {demoProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 2} />
          ))}
        </div>
      </section>
    </>
  );
}
