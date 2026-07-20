'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Truck, CreditCard, Lock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Field } from '@/features/auth/components/field';
import { createOrderAction } from '@/features/checkout/actions';
import { shippingAddressSchema, type ShippingAddressInput } from '@/schemas/checkout';
import { useCartStore, cartSubtotal } from '@/store/cart';
import { useMounted } from '@/hooks/use-mounted';
import { formatPrice, cn } from '@/lib/utils';
import type { AddressRow } from '@/types/database.types';

function addressToForm(a: AddressRow): ShippingAddressInput {
  return {
    recipient: a.recipient,
    phone: a.phone ?? '',
    line1: a.line1,
    line2: a.line2 ?? undefined,
    city: a.city,
    state: a.state ?? undefined,
    postalCode: a.postal_code ?? undefined,
    country: a.country || 'CO',
    notes: undefined,
  };
}

export function CheckoutForm({
  addresses,
  shippingCost,
  freeShippingThreshold,
  taxRate,
}: {
  addresses: AddressRow[];
  shippingCost: number;
  freeShippingThreshold: number;
  taxRate: number;
}) {
  const mounted = useMounted();
  const items = useCartStore((s) => s.items);
  const [pending, startTransition] = useTransition();
  const [coupon, setCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'addi'>('cod');

  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0];
  const [selectedId, setSelectedId] = useState<string | null>(defaultAddress?.id ?? null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: defaultAddress ? addressToForm(defaultAddress) : { country: 'CO' },
  });

  // Estimación en cliente; el servidor recalcula con la configuración vigente
  // (incluidos los descuentos por cupón) antes de crear el pedido.
  const subtotal = cartSubtotal(items);
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const tax = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + shipping + tax;

  function selectAddress(a: AddressRow | null) {
    if (a) {
      setSelectedId(a.id);
      reset(addressToForm(a));
    } else {
      setSelectedId(null);
      reset({ country: 'CO', recipient: '', phone: '', line1: '', city: '' });
    }
  }

  if (mounted && items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-4xl">Tu carrito está vacío</h1>
        <Button asChild size="lg" className="mt-8">
          <Link href="/catalogo">Explorar catálogo</Link>
        </Button>
      </div>
    );
  }

  function onSubmit(address: ShippingAddressInput) {
    const orderItems = items
      .filter((i) => i.variantId)
      .map((i) => ({ variantId: i.variantId as string, quantity: i.quantity }));
    if (orderItems.length === 0) {
      toast.error('Tu carrito no tiene productos válidos.');
      return;
    }
    startTransition(async () => {
      const res = await createOrderAction({
        address,
        items: orderItems,
        couponCode: coupon || undefined,
        paymentMethod,
      });
      // Si tiene éxito, la acción redirige; sólo llega aquí en caso de error.
      if (res?.error) toast.error(res.error);
    });
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6">
      <h1 className="mb-10 text-5xl md:text-6xl">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-12 lg:grid-cols-[1fr_400px]">
        {/* Datos de envío + pago */}
        <div className="space-y-10">
          <section>
            <h2 className="mb-5 flex items-center gap-2 text-2xl">
              <Truck className="size-5" /> Envío
            </h2>

            {addresses.length > 0 && (
              <div className="mb-6 space-y-2">
                <p className="kicker">Direcciones guardadas</p>
                <div className="flex flex-wrap gap-2">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => selectAddress(a)}
                      className={cn(
                        'flex items-center gap-2 border-2 px-3 py-2 text-left text-xs transition-colors',
                        selectedId === a.id
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground',
                      )}
                    >
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="font-bold uppercase">{a.label || a.city}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => selectAddress(null)}
                    className={cn(
                      'border-2 px-3 py-2 text-xs font-bold uppercase transition-colors',
                      selectedId === null
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground',
                    )}
                  >
                    Nueva dirección
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="recipient" label="Destinatario" error={errors.recipient?.message} {...register('recipient')} />
              <Field id="phone" label="Teléfono" type="tel" error={errors.phone?.message} {...register('phone')} />
              <div className="sm:col-span-2">
                <Field id="line1" label="Dirección" error={errors.line1?.message} {...register('line1')} />
              </div>
              <div className="sm:col-span-2">
                <Field id="line2" label="Apto / referencia (opcional)" error={errors.line2?.message} {...register('line2')} />
              </div>
              <Field id="city" label="Ciudad" error={errors.city?.message} {...register('city')} />
              <Field id="state" label="Departamento (opcional)" error={errors.state?.message} {...register('state')} />
              <Field id="postalCode" label="Código postal (opcional)" error={errors.postalCode?.message} {...register('postalCode')} />
              <div className="sm:col-span-2">
                <Field id="notes" label="Notas (opcional)" error={errors.notes?.message} {...register('notes')} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-5 flex items-center gap-2 text-2xl">
              <CreditCard className="size-5" /> Pago
            </h2>
            <div className="space-y-3">
              <label
                className={cn(
                  'flex items-center gap-3 border-2 p-4 transition-colors',
                  paymentMethod === 'cod' ? 'border-foreground' : 'border-border',
                )}
              >
                <input
                  type="radio"
                  name="pay"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-foreground"
                />
                <span className="font-bold uppercase">Pago contra entrega</span>
              </label>

              <label
                className={cn(
                  'flex items-start gap-3 border-2 p-4 transition-colors',
                  paymentMethod === 'addi' ? 'border-foreground' : 'border-border',
                )}
              >
                <input
                  type="radio"
                  name="pay"
                  checked={paymentMethod === 'addi'}
                  onChange={() => setPaymentMethod('addi')}
                  className="mt-1 accent-foreground"
                />
                <span>
                  <span className="font-bold uppercase">Paga con Addi</span>
                  <span className="block text-sm text-muted-foreground">
                    Difiere tu compra a cuotas. Te llevamos al portal de Addi para aprobar tu crédito.
                  </span>
                </span>
              </label>

              <div className="flex items-center gap-3 border-2 border-dashed border-border p-4 text-muted-foreground">
                <Lock className="size-4" />
                <span className="text-sm">Tarjeta / PSE — próximamente</span>
              </div>
            </div>
          </section>
        </div>

        {/* Resumen */}
        <aside className="h-fit border-2 border-foreground p-6 lg:sticky lg:top-24">
          <h2 className="text-2xl">Tu pedido</h2>
          <Separator className="my-4" />
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.key} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="line-clamp-1 font-medium uppercase">{item.name}</span>
                  <span className="text-muted-foreground">
                    {[item.color, item.size].filter(Boolean).join(' · ')} × {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />

          <div className="space-y-2">
            <label htmlFor="coupon" className="kicker">Cupón</label>
            <input
              id="coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="p. ej. BIENVENIDO10"
              className="h-10 w-full border-2 border-border bg-transparent px-3 text-sm uppercase outline-none focus:border-foreground"
            />
            <p className="text-xs text-muted-foreground">El descuento se aplica al confirmar.</p>
          </div>

          <Separator className="my-4" />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className="tabular-nums">{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impuestos ({taxRate}%)</span>
                <span className="tabular-nums">{formatPrice(tax)}</span>
              </div>
            )}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between">
            <span className="font-bold uppercase">Total</span>
            <span className="font-display text-xl font-black tabular-nums">{formatPrice(total)}</span>
          </div>

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending}>
            {pending
              ? 'Procesando…'
              : paymentMethod === 'addi'
                ? 'Continuar con Addi'
                : 'Realizar pedido'}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3" /> Compra segura
          </p>
        </aside>
      </form>
    </div>
  );
}
