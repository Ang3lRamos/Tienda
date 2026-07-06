import type { Metadata } from 'next';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { listOrders } from '@/features/admin/lists';
import { OrderStatusSelect } from '@/features/admin/components/order-status-select';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Pedidos' };

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl md:text-5xl">Pedidos</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no hay pedidos.</p>
      ) : (
        <div className="overflow-x-auto border-2 border-foreground">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-foreground bg-secondary/40 text-left">
              <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-display [&>th]:text-xs [&>th]:font-bold [&>th]:uppercase [&>th]:tracking-wider">
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.orderNumber} className="[&>td]:px-4 [&>td]:py-3">
                  <td className="font-bold">{o.orderNumber}</td>
                  <td className="text-muted-foreground">{o.customer ?? '—'}</td>
                  <td className="text-muted-foreground">
                    {format(new Date(o.createdAt), 'd MMM yyyy', { locale: es })}
                  </td>
                  <td className="font-medium tabular-nums">{formatPrice(o.grandTotal)}</td>
                  <td className="text-xs uppercase text-muted-foreground">{o.paymentStatus}</td>
                  <td>
                    <OrderStatusSelect orderNumber={o.orderNumber} status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
