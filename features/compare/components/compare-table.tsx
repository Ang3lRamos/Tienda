'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, ImageIcon, Scale, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompareStore } from '@/store/compare';
import { useMounted } from '@/hooks/use-mounted';
import { formatPrice, stockStatusLabel, discountPercent, cn } from '@/lib/utils';
import type { ProductSummary } from '@/types/product';

const GENDER_LABEL: Record<string, string> = {
  men: 'Hombre',
  women: 'Mujer',
  unisex: 'Unisex',
  kids: 'Niños',
};

export function CompareTable() {
  const mounted = useMounted();
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);

  // Evita parpadeo antes de leer localStorage.
  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 border-2 border-dashed border-border px-6 py-20 text-center">
        <Scale className="size-8 text-muted-foreground" />
        <p className="max-w-sm text-sm text-muted-foreground">
          Aún no has añadido productos al comparador. Busca el icono de balanza en
          las tarjetas de producto para compararlos lado a lado.
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/catalogo">Explorar catálogo</Link>
        </Button>
      </div>
    );
  }

  const cheapest = Math.min(...items.map((p) => p.price));
  const bestRating = Math.max(...items.map((p) => p.ratingAvg));

  const rows: { label: string; render: (p: ProductSummary) => React.ReactNode }[] = [
    {
      label: 'Precio',
      render: (p) => (
        <div className="space-y-1">
          <span
            className={cn(
              'font-display text-lg font-black tabular-nums',
              p.price === cheapest && items.length > 1 && 'text-foreground',
            )}
          >
            {formatPrice(p.price)}
          </span>
          {p.compareAtPrice && p.compareAtPrice > p.price && (
            <span className="block text-xs text-muted-foreground line-through tabular-nums">
              {formatPrice(p.compareAtPrice)}
            </span>
          )}
          {p.price === cheapest && items.length > 1 && (
            <span className="inline-flex items-center gap-1 border-2 border-foreground px-1.5 py-0.5 text-[0.6rem] font-bold uppercase">
              <Check className="size-3" /> Más barato
            </span>
          )}
        </div>
      ),
    },
    {
      label: 'Descuento',
      render: (p) => {
        const pct = discountPercent(p.price, p.compareAtPrice);
        return pct > 0 ? (
          <span className="bg-foreground px-2 py-1 text-[0.65rem] font-bold tracking-wider text-background">
            −{pct}%
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    { label: 'Marca', render: (p) => p.brandName ?? <span className="text-muted-foreground">—</span> },
    { label: 'Categoría', render: (p) => p.categoryName ?? <span className="text-muted-foreground">—</span> },
    { label: 'Género', render: (p) => GENDER_LABEL[p.gender] ?? p.gender },
    {
      label: 'Valoración',
      render: (p) =>
        p.ratingCount > 0 ? (
          <div className="space-y-1">
            <span className="font-display text-base font-black tabular-nums">
              {p.ratingAvg.toFixed(1)}
            </span>
            <span className="block text-xs text-muted-foreground">
              {p.ratingCount} {p.ratingCount === 1 ? 'opinión' : 'opiniones'}
            </span>
            {p.ratingAvg === bestRating && bestRating > 0 && items.length > 1 && (
              <span className="inline-flex items-center gap-1 border-2 border-foreground px-1.5 py-0.5 text-[0.6rem] font-bold uppercase">
                <Check className="size-3" /> Mejor valorado
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">Sin opiniones</span>
        ),
    },
    {
      label: 'Disponibilidad',
      render: (p) => (
        <span
          className={cn(
            'border-2 border-foreground px-2 py-0.5 text-[0.65rem] font-bold uppercase',
            p.stockStatus === 'agotado' && 'bg-foreground text-background',
          )}
        >
          {stockStatusLabel(p.stockStatus)}
        </span>
      ),
    },
    {
      label: 'Colores',
      render: (p) =>
        p.availableColors.length > 0 ? (
          <span className="text-xs">{p.availableColors.join(', ')}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      label: 'Tallas',
      render: (p) =>
        p.availableSizes.length > 0 ? (
          <span className="text-xs">{p.availableSizes.join(' · ')}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Comparando {items.length} {items.length === 1 ? 'producto' : 'productos'}.
          {items.length > 1 && ' Desliza para ver todos.'}
        </p>
        <Button variant="ghost" size="sm" onClick={clear}>
          Limpiar todo
        </Button>
      </div>

      <div className="overflow-x-auto border-2 border-foreground">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {/* Columna fija de etiquetas */}
              <th className="sticky left-0 z-10 w-24 min-w-24 border-r-2 border-b-2 border-foreground bg-background p-3 text-left align-bottom sm:w-32 sm:min-w-32">
                <span className="kicker text-muted-foreground">Producto</span>
              </th>
              {items.map((p) => (
                <th
                  key={p.id}
                  className="min-w-[9.5rem] border-b-2 border-foreground p-3 text-left align-top font-normal sm:min-w-[13rem]"
                >
                  <div className="space-y-2">
                    <div className="relative">
                      <Link
                        href={`/producto/${p.slug}`}
                        className="relative block aspect-3/4 overflow-hidden bg-muted"
                      >
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.imageAlt ?? p.name}
                            fill
                            sizes="(max-width: 640px) 40vw, 208px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-muted-foreground">
                            <ImageIcon className="size-6" />
                          </div>
                        )}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        aria-label={`Quitar ${p.name}`}
                        className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-background/90 text-foreground backdrop-blur transition-colors hover:bg-foreground hover:text-background"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                    <Link
                      href={`/producto/${p.slug}`}
                      className="block font-display text-xs font-bold uppercase decoration-1 underline-offset-4 hover:underline"
                    >
                      {p.name}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.label}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r-2 border-foreground bg-background p-3 text-left align-top font-display text-[0.65rem] font-bold tracking-[0.1em] text-muted-foreground uppercase"
                >
                  {row.label}
                </th>
                {items.map((p) => (
                  <td key={p.id} className="p-3 align-top">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th
                scope="row"
                className="sticky left-0 z-10 border-r-2 border-foreground bg-background p-3"
              >
                <span className="sr-only">Acciones</span>
              </th>
              {items.map((p) => (
                <td key={p.id} className="p-3 align-top">
                  <Button asChild size="sm" className="w-full">
                    <Link href={`/producto/${p.slug}`}>Ver</Link>
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
