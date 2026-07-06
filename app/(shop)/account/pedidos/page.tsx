import type { Metadata } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShoppingBag } from 'lucide-react';
import { getUserOrders } from '@/features/account/queries';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Mis pedidos' };

export default async function PedidosPage() {
  const orders = await getUserOrders();

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl">Mis pedidos</h2>
        <div className="flex flex-col items-center gap-4 border-2 border-dashed border-border px-6 py-16 text-center">
          <ShoppingBag className="size-8 text-muted-foreground" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Aún no tienes pedidos. Cuando compres, aparecerán aquí con su estado.
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl">Mis pedidos</h2>
      <ul className="divide-y-2 divide-border border-y-2 border-foreground">
        {orders.map((o) => (
          <li key={o.orderNumber}>
            <Link
              href={`/pedido/${o.orderNumber}`}
              className="flex flex-wrap items-center justify-between gap-4 py-5 transition-colors hover:bg-secondary/40"
            >
              <div>
                <p className="font-display text-sm font-bold uppercase">{o.orderNumber}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {o.placedAt
                    ? format(new Date(o.placedAt), "d 'de' MMM yyyy", { locale: es })
                    : '—'}{' '}
                  · {o.itemCount} {o.itemCount === 1 ? 'artículo' : 'artículos'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="border-2 border-foreground px-2 py-1 text-[0.65rem] font-bold uppercase">
                  {o.status}
                </span>
                <span className="font-display text-base font-black tabular-nums">
                  {formatPrice(o.grandTotal)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
