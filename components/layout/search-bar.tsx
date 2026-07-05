'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/** Buscador inteligente: envía la consulta al catálogo (búsqueda full-text). */
export function SearchBar({
  className,
  autoFocus,
  onSubmitted,
}: {
  className?: string;
  autoFocus?: boolean;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        router.push(`/catalogo?q=${encodeURIComponent(q)}`);
        onSubmitted?.();
      }}
      className={cn('relative w-full', className)}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar prendas, marcas, colores…"
        className="pl-9"
        aria-label="Buscar productos"
      />
    </form>
  );
}
