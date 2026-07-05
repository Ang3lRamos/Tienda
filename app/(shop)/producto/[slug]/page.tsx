import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getProductBySlug,
  getRelatedProducts,
  getProductReviews,
} from '@/features/catalog/queries';
import { ProductGallery } from '@/features/catalog/components/product-gallery';
import { ProductPurchase } from '@/features/catalog/components/product-purchase';
import { ProductCard } from '@/components/shared/product-card';
import { Rating } from '@/components/shared/rating';
import { Separator } from '@/components/ui/separator';

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Producto no encontrado' };
  return {
    title: product.name,
    description: product.description ?? `${product.name} en Átelier.`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product.categorySlug, product.id),
    getProductReviews(product.id),
  ]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
        <Link href="/" className="hover:text-foreground">Inicio</Link>
        <span>/</span>
        <Link href="/catalogo" className="hover:text-foreground">Catálogo</Link>
        {product.categorySlug && (
          <>
            <span>/</span>
            <Link href={`/catalogo?categoria=${product.categorySlug}`} className="hover:text-foreground">
              {product.categoryName}
            </Link>
          </>
        )}
      </nav>

      {/* Galería + compra */}
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:py-4">
          {product.brandName && (
            <Link
              href={`/catalogo?marca=${product.brandSlug}`}
              className="kicker text-muted-foreground hover:text-foreground"
            >
              {product.brandName}
            </Link>
          )}
          <h1 className="mt-2 text-4xl md:text-5xl">{product.name}</h1>

          {product.ratingCount > 0 && (
            <div className="mt-3">
              <Rating value={product.ratingAvg} count={product.ratingCount} size={16} />
            </div>
          )}

          <div className="mt-8">
            <ProductPurchase product={product} />
          </div>

          {/* Descripción y detalles */}
          <Separator className="my-8" />
          <div className="space-y-6">
            {product.description && (
              <div>
                <h2 className="mb-2 text-lg">Descripción</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {product.material && (
                <div>
                  <dt className="kicker text-muted-foreground">Material</dt>
                  <dd className="mt-1 text-sm">{product.material}</dd>
                </div>
              )}
              {product.careInstructions && (
                <div>
                  <dt className="kicker text-muted-foreground">Cuidados</dt>
                  <dd className="mt-1 text-sm">{product.careInstructions}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Reseñas */}
      <section className="mt-20">
        <div className="mb-8 flex items-end justify-between border-b-2 border-foreground pb-4">
          <h2 className="text-3xl md:text-4xl">Opiniones</h2>
          {product.ratingCount > 0 && (
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl font-black">
                {product.ratingAvg.toFixed(1)}
              </span>
              <Rating value={product.ratingAvg} count={product.ratingCount} />
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">
            Este producto aún no tiene opiniones. ¡Sé el primero en opinar!
          </p>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.id} className="border-2 border-border p-5">
                <div className="flex items-center justify-between">
                  <Rating value={r.rating} />
                  <span className="text-xs text-muted-foreground">{r.authorName}</span>
                </div>
                {r.title && <h3 className="mt-3 text-base">{r.title}</h3>}
                {r.comment && (
                  <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-3xl md:text-4xl">También te puede gustar</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
