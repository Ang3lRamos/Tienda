import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { getOrderByNumber } from '@/features/checkout/queries';
import { ClearCart } from '@/features/checkout/components/clear-cart';
import { CancelOrderButton } from '@/features/checkout/components/cancel-order-button';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  formatPrice,
  orderStatusLabel,
  paymentStatusLabel,
  isCancellableStatus,
} from '@/lib/utils';

export const metadata: Metadata = { title: 'Pedido confirmado', robots: { index: false } };

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ addi?: string }>;
}) {
  const { orderNumber } = await params;
  const { addi } = await searchParams;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/pedido/${orderNumber}`);

  const order = await getOrderByNumber(orderNumber);
  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-4xl">Pedido no encontrado</h1>
        <Button asChild size="lg" className="mt-8">
          <Link href="/account/pedidos">Ver mis pedidos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <ClearCart />

      <div className="text-center">
        <CheckCircle2 className="mx-auto size-14" />
        <h1 className="mt-6 text-4xl md:text-5xl">¡Pedido confirmado!</h1>
        <p className="mt-2 text-muted-foreground">
          Gracias por tu compra. Tu número de pedido es{' '}
          <span className="font-bold text-foreground">{order.orderNumber}</span>.
        </p>
      </div>

      {addi === 'approved' && (
        <div className="mt-6 border-2 border-foreground p-4 text-center text-sm">
          Tu crédito con <span className="font-bold">Addi</span> se está confirmando. Actualizaremos
          el estado del pedido en cuanto Addi complete la aprobación.
        </div>
      )}
      {addi === 'rejected' && (
        <div className="mt-6 border-2 border-destructive p-4 text-center text-sm text-destructive">
          Tu solicitud con <span className="font-bold">Addi</span> no se completó. Puedes intentar
          otro método de pago desde el carrito.
        </div>
      )}

      <div className="mt-10 border-2 border-foreground p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-2xl">Resumen</h2>
          <div className="flex flex-wrap justify-end gap-2">
            <span className="border-2 border-foreground px-2 py-1 text-xs font-bold uppercase">
              {orderStatusLabel(order.status)}
            </span>
            <span className="border-2 border-border px-2 py-1 text-xs font-bold uppercase text-muted-foreground">
              {paymentStatusLabel(order.paymentStatus)}
            </span>
          </div>
        </div>
        <Separator className="my-4" />
        <ul className="space-y-3">
          {order.items.map((it, i) => (
            <li key={i} className="flex justify-between gap-3 text-sm">
              <span>
                <span className="font-medium uppercase">{it.productName}</span>{' '}
                <span className="text-muted-foreground">
                  {it.label ? `${it.label} · ` : ''}× {it.quantity}
                </span>
              </span>
              <span className="tabular-nums">{formatPrice(it.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <Separator className="my-4" />
        <div className="space-y-1.5 text-sm">
          <Row label="Subtotal" value={formatPrice(order.subtotal)} />
          {order.discountTotal > 0 && (
            <Row label="Descuento" value={`− ${formatPrice(order.discountTotal)}`} />
          )}
          <Row
            label="Envío"
            value={order.shippingTotal === 0 ? 'Gratis' : formatPrice(order.shippingTotal)}
          />
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between">
          <span className="font-bold uppercase">Total</span>
          <span className="font-display text-xl font-black tabular-nums">
            {formatPrice(order.grandTotal)}
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="flex-1">
          <Link href="/account/pedidos">Ver mis pedidos</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="flex-1">
          <Link href="/catalogo">Seguir comprando</Link>
        </Button>
      </div>

      {isCancellableStatus(order.status) && (
        <div className="mt-3 flex">
          <CancelOrderButton orderNumber={order.orderNumber} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
