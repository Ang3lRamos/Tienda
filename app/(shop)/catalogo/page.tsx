import type { Metadata } from 'next';
import { getProducts, getFilterOptions } from '@/features/catalog/queries';
import { PAGE_SIZE, type CatalogFilters, type SortOption } from '@/features/catalog/types';
import { CatalogControls } from '@/features/catalog/components/catalog-controls';
import { CatalogToolbar } from '@/features/catalog/components/catalog-toolbar';
import { Pagination } from '@/features/catalog/components/pagination';
import { ProductCard } from '@/components/shared/product-card';
import type { ProductGender } from '@/types/database.types';

export const metadata: Metadata = {
  title: 'Catálogo',
  description: 'Explora toda la colección de Átelier.',
};

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const num = (v: string | string[] | undefined) => {
  const s = str(v);
  const n = s ? Number(s) : NaN;
  return Number.isFinite(n) ? n : undefined;
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  const filters: CatalogFilters = {
    q: str(sp.q),
    categoria: str(sp.categoria),
    marca: str(sp.marca),
    gender: str(sp.gender) as ProductGender | undefined,
    color: str(sp.color),
    talla: str(sp.talla),
    precioMin: num(sp.precioMin),
    precioMax: num(sp.precioMax),
    ofertas: str(sp.ofertas) === '1',
    sort: str(sp.sort) as SortOption | undefined,
    page: num(sp.page) ?? 1,
  };

  const [{ products, total }, options] = await Promise.all([
    getProducts(filters),
    getFilterOptions(),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const page = filters.page ?? 1;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="kicker text-muted-foreground">
          {filters.q ? `Resultados para "${filters.q}"` : 'Colección'}
        </p>
        <h1 className="mt-2 text-5xl md:text-7xl">
          {filters.q ? 'Búsqueda' : 'Catálogo'}
        </h1>
      </header>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        {/* Sidebar de filtros (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <CatalogControls options={options} />
          </div>
        </aside>

        {/* Resultados */}
        <div>
          <CatalogToolbar total={total} options={options} />

          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <h2 className="text-2xl">Sin resultados</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                No encontramos productos con esos filtros. Prueba ajustarlos o
                limpiar la búsqueda.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 4} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
