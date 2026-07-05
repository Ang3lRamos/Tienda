'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore, cartSubtotal } from '@/store/cart';
import { useUIStore } from '@/store/ui';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const open = useUIStore((s) => s.cartOpen);
  const setOpen = useUIStore((s) => s.setCartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const remove = useCartStore((s) => s.remove);

  const subtotal = cartSubtotal(items);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col border-l-2 border-foreground sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl">
            Carrito ({items.reduce((s, i) => s + i.quantity, 0)})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
            <Button asChild variant="outline" onClick={closeCart}>
              <Link href="/catalogo">Explorar catálogo</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6">
              {items.map((item) => (
                <div key={item.key} className="flex gap-4">
                  <Link
                    href={`/producto/${item.slug}`}
                    onClick={closeCart}
                    className="relative aspect-3/4 w-20 shrink-0 overflow-hidden bg-muted"
                  >
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/producto/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium uppercase hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {[item.color, item.size].filter(Boolean).join(' · ')}
                    </p>
                    <p className="mt-1 text-sm font-medium tabular-nums">
                      {formatPrice(item.unitPrice)}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border-2 border-foreground">
                        <button
                          onClick={() => updateQty(item.key, item.quantity - 1)}
                          className="grid size-8 place-items-center hover:bg-secondary"
                          aria-label="Menos"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.key, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="grid size-8 place-items-center hover:bg-secondary disabled:opacity-40"
                          aria-label="Más"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.key)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-foreground p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold tracking-wide uppercase">Subtotal</span>
                <span className="font-display text-lg font-black tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Envío e impuestos calculados en el checkout.
              </p>
              <Separator className="my-4" />
              <div className="grid gap-2">
                <Button asChild size="lg" onClick={closeCart}>
                  <Link href="/checkout">Finalizar compra</Link>
                </Button>
                <Button asChild variant="outline" onClick={closeCart}>
                  <Link href="/carrito">Ver carrito</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
