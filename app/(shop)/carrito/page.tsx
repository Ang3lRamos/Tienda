'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore, cartSubtotal } from '@/store/cart';
import { useMounted } from '@/hooks/use-mounted';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const mounted = useMounted();
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const remove = useCartStore((s) => s.remove);

  const subtotal = cartSubtotal(items);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  if (mounted && items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-6 text-4xl">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted-foreground">Descubre la nueva colección.</p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/catalogo">Explorar catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6">
      <h1 className="mb-10 text-5xl md:text-6xl">Carrito</h1>

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div className="divide-y-2 divide-border border-y-2 border-foreground">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 py-6 sm:gap-6">
              <Link
                href={`/producto/${item.slug}`}
                className="relative aspect-3/4 w-24 shrink-0 overflow-hidden bg-muted sm:w-32"
              >
                {item.image && (
                  <Image src={item.image} alt={item.name} fill sizes="128px" className="object-cover" />
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/producto/${item.slug}`}
                      className="font-display text-base font-bold uppercase hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[item.color, item.size].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(item.key)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>

                <div className="mt-auto flex items-end justify-between pt-4">
                  <div className="flex items-center border-2 border-foreground">
                    <button
                      onClick={() => updateQty(item.key, item.quantity - 1)}
                      className="grid size-9 place-items-center hover:bg-secondary"
                      aria-label="Menos"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.key, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="grid size-9 place-items-center hover:bg-secondary disabled:opacity-40"
                      aria-label="Más"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <span className="font-display text-lg font-black tabular-nums">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <aside className="h-fit border-2 border-foreground p-6 lg:sticky lg:top-24">
          <h2 className="text-2xl">Resumen</h2>
          <Separator className="my-4" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({count})</span>
            <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Envío</span>
            <span className="text-muted-foreground">Calculado en el checkout</span>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between">
            <span className="font-bold tracking-wide uppercase">Total</span>
            <span className="font-display text-xl font-black tabular-nums">
              {formatPrice(subtotal)}
            </span>
          </div>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">Finalizar compra</Link>
          </Button>
          <Button asChild variant="link" className="mt-2 w-full">
            <Link href="/catalogo">Seguir comprando</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
