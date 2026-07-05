import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export const metadata: Metadata = { title: 'Mis pedidos' };

export default function PedidosPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl">Mis pedidos</h2>
      <div className="flex flex-col items-center gap-4 border-2 border-dashed border-border px-6 py-16 text-center">
        <ShoppingBag className="size-8 text-muted-foreground" />
        <p className="max-w-sm text-sm text-muted-foreground">
          Aún no tienes pedidos. Cuando compres, aparecerán aquí con su estado y
          seguimiento.
        </p>
        <Link
          href="/catalogo"
          className="border-2 border-foreground px-6 py-3 font-display text-xs font-bold tracking-[0.12em] uppercase transition-colors hover:bg-foreground hover:text-background"
        >
          Explorar catálogo
        </Link>
      </div>
    </div>
  );
}
