'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CatalogControls } from './catalog-controls';
import type { FilterOptions, SortOption } from '../types';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'nuevos', label: 'Novedades' },
  { value: 'destacados', label: 'Destacados' },
  { value: 'vendidos', label: 'Más vendidos' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
];

export function CatalogToolbar({
  total,
  options,
}: {
  total: number;
  options: FilterOptions;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  function setSort(value: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.set('sort', value);
    p.delete('page');
    router.push(`/catalogo?${p.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground py-4">
      <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
        {total} {total === 1 ? 'producto' : 'productos'}
      </p>

      <div className="flex min-w-0 items-center gap-2">
        {/* Filtros móviles */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <SlidersHorizontal className="size-4" /> Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto border-r-2 border-foreground">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-10">
              <CatalogControls options={options} onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <label className="sr-only" htmlFor="sort">
          Ordenar
        </label>
        <select
          id="sort"
          value={searchParams.get('sort') ?? 'nuevos'}
          onChange={(e) => setSort(e.target.value)}
          className="h-9 min-w-0 max-w-[9.5rem] border-2 border-foreground bg-background px-2 text-xs font-bold tracking-wide uppercase outline-none sm:max-w-none sm:px-3"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
