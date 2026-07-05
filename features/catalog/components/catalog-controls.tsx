'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatPrice } from '@/lib/utils';
import type { FilterOptions } from '../types';

const genders = [
  { label: 'Mujer', value: 'women' },
  { label: 'Hombre', value: 'men' },
  { label: 'Unisex', value: 'unisex' },
];

export function CatalogControls({
  options,
  onNavigate,
}: {
  options: FilterOptions;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const base = searchParams.toString();

  const [min, setMin] = useState(searchParams.get('precioMin') ?? '');
  const [max, setMax] = useState(searchParams.get('precioMax') ?? '');

  function apply(mutate: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(base);
    mutate(p);
    p.delete('page');
    router.push(`/catalogo?${p.toString()}`);
    onNavigate?.();
  }

  function toggle(key: string, value: string) {
    apply((p) => (p.get(key) === value ? p.delete(key) : p.set(key, value)));
  }

  const isActive = (key: string, value: string) => searchParams.get(key) === value;

  return (
    <div className="space-y-8">
      <FilterGroup title="Género">
        <div className="flex flex-wrap gap-2">
          {genders.map((g) => (
            <Chip key={g.value} active={isActive('gender', g.value)} onClick={() => toggle('gender', g.value)}>
              {g.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      {options.categories.length > 0 && (
        <FilterGroup title="Categoría">
          <ul className="space-y-1.5">
            {options.categories.map((c) => (
              <li key={c.slug}>
                <OptionRow active={isActive('categoria', c.slug)} onClick={() => toggle('categoria', c.slug)}>
                  {c.name}
                </OptionRow>
              </li>
            ))}
          </ul>
        </FilterGroup>
      )}

      {options.brands.length > 0 && (
        <FilterGroup title="Marca">
          <ul className="space-y-1.5">
            {options.brands.map((b) => (
              <li key={b.slug}>
                <OptionRow active={isActive('marca', b.slug)} onClick={() => toggle('marca', b.slug)}>
                  {b.name}
                </OptionRow>
              </li>
            ))}
          </ul>
        </FilterGroup>
      )}

      {options.colors.length > 0 && (
        <FilterGroup title="Color">
          <div className="flex flex-wrap gap-2">
            {options.colors.map((color) => (
              <Chip key={color} active={isActive('color', color)} onClick={() => toggle('color', color)}>
                {color}
              </Chip>
            ))}
          </div>
        </FilterGroup>
      )}

      {options.sizes.length > 0 && (
        <FilterGroup title="Talla">
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((size) => (
              <button
                key={size}
                onClick={() => toggle('talla', size)}
                className={cn(
                  'grid h-10 min-w-10 place-items-center border-2 px-2 text-xs font-bold transition-colors',
                  isActive('talla', size)
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border hover:border-foreground',
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Precio">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Mín"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="h-10 rounded-none border-2"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Máx"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="h-10 rounded-none border-2"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Rango: {formatPrice(options.priceRange.min)} – {formatPrice(options.priceRange.max)}
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3 w-full"
          onClick={() =>
            apply((p) => {
              min ? p.set('precioMin', min) : p.delete('precioMin');
              max ? p.set('precioMax', max) : p.delete('precioMax');
            })
          }
        >
          Aplicar precio
        </Button>
      </FilterGroup>

      <FilterGroup title="Otros">
        <OptionRow active={isActive('ofertas', '1')} onClick={() => toggle('ofertas', '1')}>
          Solo ofertas
        </OptionRow>
      </FilterGroup>

      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => {
          const p = new URLSearchParams();
          const q = searchParams.get('q');
          if (q) p.set('q', q);
          router.push(`/catalogo?${p.toString()}`);
          onNavigate?.();
        }}
      >
        <X className="size-4" /> Limpiar filtros
      </Button>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-display text-xs font-bold tracking-[0.2em] uppercase">{title}</h3>
      {children}
    </div>
  );
}

function OptionRow({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 text-left text-sm transition-colors',
        active ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <span
        className={cn(
          'grid size-4 shrink-0 place-items-center border-2',
          active ? 'border-foreground bg-foreground' : 'border-border',
        )}
      >
        {active && <span className="size-1.5 bg-background" />}
      </span>
      {children}
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'border-2 px-3 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border hover:border-foreground',
      )}
    >
      {children}
    </button>
  );
}
