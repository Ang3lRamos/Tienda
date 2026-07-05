import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { getCategories } from '@/features/catalog/queries';

export const metadata: Metadata = {
  title: 'Categorías',
  description: 'Explora las categorías de Átelier.',
};

// Imágenes editoriales de respaldo por categoría (cuando no hay image_url).
const fallback: Record<string, string> = {
  camisetas: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000',
  pantalones: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1000',
  chaquetas: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=1000',
  vestidos: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000',
  calzado: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000',
  accesorios: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1000',
};

export default async function CategoriasPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6">
      <header className="mb-10">
        <p className="kicker text-muted-foreground">Explora</p>
        <h1 className="mt-2 text-5xl md:text-7xl">Categorías</h1>
      </header>

      <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const image = cat.imageUrl ?? fallback[cat.slug];
          return (
            <Link
              key={cat.slug}
              href={`/catalogo?categoria=${cat.slug}`}
              className="group relative aspect-4/3 overflow-hidden bg-muted"
            >
              {image && (
                <Image
                  src={image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/45" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl md:text-4xl">{cat.name}</h2>
                  <ArrowUpRight className="size-6" />
                </div>
                {cat.description && (
                  <p className="mt-1 max-w-xs text-sm text-white/80">{cat.description}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
