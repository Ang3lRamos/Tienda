import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export const metadata: Metadata = { title: 'Mis favoritos' };

export default function FavoritosPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl">Mis favoritos</h2>
      <div className="flex flex-col items-center gap-4 border-2 border-dashed border-border px-6 py-16 text-center">
        <Heart className="size-8 text-muted-foreground" />
        <p className="max-w-sm text-sm text-muted-foreground">
          Guarda tus prendas favoritas para encontrarlas fácilmente. La lista de
          deseos se activa en el módulo de carrito y favoritos.
        </p>
        <Link
          href="/catalogo"
          className="border-2 border-foreground px-6 py-3 font-display text-xs font-bold tracking-[0.12em] uppercase transition-colors hover:bg-foreground hover:text-background"
        >
          Descubrir productos
        </Link>
      </div>
    </div>
  );
}
