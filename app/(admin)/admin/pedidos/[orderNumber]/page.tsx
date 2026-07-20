import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import { getAdminOrder } from '@/features/admin/lists';
import { OrderStatusSelect } from '@/features/admin/components/order-status-select';
import { Separator } from '@/components/ui/separator';
import { formatPrice, paymentStatusLabel } from '@/lib/utils';

export const metadata: Metadata = { title: 'Detalle de pedido' };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getAdminOrder(orderNumber);
  if (!order) notFound();

  const addr = (order.shippingAddress ?? {}) as Record<string, string | undefined>;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/pedidos"
          className="mb-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Pedidos
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl md:text-5xl">{order.orderNumber}</h1>
          <div className="flex items-center gap-3">
            <span className="border-2 border-border px-2 py-1 text-xs font-bold uppercase text-muted-foreground">
              {paymentStatusLabel(order.paymentStatus)}
            </span>
            <OrderStatusSelect orderNumber={order.orderNumber} status={order.status} />
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {order.placedAt
            ? format(new Date(order.placedAt), "d 'de' MMMM yyyy, HH:mm", { locale: es })
            : format(new Date(order.createdAt), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Artículos */}
        <div className="border-2 border-foreground p-6">
          <h2 className="text-2xl">Artículos</h2>
          <Separator className="my-4" />
          <ul className="space-y-3">
            {order.items.map((it, i) => (
              <li key={i} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="font-medium uppercase">{it.productName}</span>{' '}
                  <span className="text-muted-foreground">
                    {[it.label, it.sku].filter(Boolean).join(' · ')} × {it.quantity}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">{formatPrice(it.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <dl className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatPrice(order.subtotal)} />
            {order.discountTotal > 0 && <Row label="Descuento" value={`− ${formatPrice(order.discountTotal)}`} />}
            <Row label="Envío" value={order.shippingTotal === 0 ? 'Gratis' : formatPrice(order.shippingTotal)} />
            {order.taxTotal > 0 && <Row label="Impuestos" value={formatPrice(order.taxTotal)} />}
          </dl>
          <Separator className="my-4" />
          <div className="flex justify-between">
            <span className="font-bold uppercase">Total</span>
            <span className="font-display text-xl font-black tabular-nums">
              {formatPrice(order.grandTotal)}
            </span>
          </div>
        </div>

        {/* Cliente + envío */}
        <div className="space-y-6">
          <div className="border-2 border-foreground p-6">
            <h2 className="text-xl">Cliente</h2>
            <Separator className="my-3" />
            <p className="text-sm font-medium">{order.customerName ?? '—'}</p>
            <p className="text-sm text-muted-foreground">{order.customerEmail ?? '—'}</p>
          </div>

          <div className="border-2 border-foreground p-6">
            <h2 className="text-xl">Envío</h2>
            <Separator className="my-3" />
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{addr.recipient ?? '—'}</p>
              {addr.phone && <p>Tel. {addr.phone}</p>}
              {addr.line1 && <p>{addr.line1}</p>}
              {addr.line2 && <p>{addr.line2}</p>}
              <p>{[addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}</p>
              {addr.country && <p>{addr.country}</p>}
            </div>
            {order.notes && (
              <>
                <Separator className="my-3" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Notas</p>
                <p className="mt-1 text-sm">{order.notes}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
