'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Truck, Receipt, Store, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/features/auth/components/field';
import { updateStoreSettings } from '../actions';
import { storeSettingsSchema, type StoreSettingsInput } from '@/schemas/settings';
import { formatPrice } from '@/lib/utils';

export function SettingsForm({ defaultValues }: { defaultValues: StoreSettingsInput }) {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<StoreSettingsInput>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues,
  });

  const shippingCost = Number(watch('shippingCost')) || 0;
  const threshold = Number(watch('freeShippingThreshold')) || 0;
  const taxRate = Number(watch('taxRate')) || 0;

  function onSubmit(values: StoreSettingsInput) {
    startTransition(async () => {
      const res = await updateStoreSettings(values);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Configuración guardada');
      reset(values); // limpia el estado "sin guardar"
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Envío */}
      <section className="border-2 border-foreground p-5 sm:p-6">
        <h2 className="mb-1 flex items-center gap-2 text-2xl">
          <Truck className="size-5" /> Envío
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Se aplica en el checkout al calcular el total del pedido.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="shippingCost"
            label="Costo de envío (COP)"
            type="number"
            inputMode="numeric"
            error={errors.shippingCost?.message}
            {...register('shippingCost')}
          />
          <Field
            id="freeShippingThreshold"
            label="Envío gratis desde (COP)"
            type="number"
            inputMode="numeric"
            error={errors.freeShippingThreshold?.message}
            {...register('freeShippingThreshold')}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Una compra de {formatPrice(threshold)} o más paga{' '}
          <strong className="text-foreground">envío gratis</strong>; por debajo,{' '}
          <strong className="text-foreground">{formatPrice(shippingCost)}</strong>.
        </p>
      </section>

      {/* Impuestos */}
      <section className="border-2 border-foreground p-5 sm:p-6">
        <h2 className="mb-1 flex items-center gap-2 text-2xl">
          <Receipt className="size-5" /> Impuestos
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Porcentaje aplicado al subtotal después de descuentos. Déjalo en 0 si no aplicas impuestos.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="taxRate"
            label="Tasa de impuesto (%)"
            type="number"
            step="0.01"
            inputMode="decimal"
            error={errors.taxRate?.message}
            {...register('taxRate')}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {taxRate > 0
            ? `Un subtotal de ${formatPrice(100000)} sumaría ${formatPrice(Math.round((100000 * taxRate) / 100))} de impuestos.`
            : 'Sin impuestos: el total es subtotal − descuentos + envío.'}
        </p>
      </section>

      {/* Tienda */}
      <section className="border-2 border-foreground p-5 sm:p-6">
        <h2 className="mb-1 flex items-center gap-2 text-2xl">
          <Store className="size-5" /> Tienda
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Datos de contacto y el mensaje destacado de la barra superior.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="storeName"
            label="Nombre de la tienda"
            error={errors.storeName?.message}
            {...register('storeName')}
          />
          <Field
            id="contactEmail"
            label="Correo de contacto"
            type="email"
            error={errors.contactEmail?.message}
            {...register('contactEmail')}
          />
          <Field
            id="contactPhone"
            label="Teléfono de contacto"
            type="tel"
            error={errors.contactPhone?.message}
            {...register('contactPhone')}
          />
          <div className="sm:col-span-2">
            <Field
              id="announcement"
              label="Anuncio de la barra superior"
              placeholder="p. ej. Envío gratis desde $200.000"
              error={errors.announcement?.message}
              {...register('announcement')}
            />
          </div>
        </div>
      </section>

      {/* Datos legales */}
      <section className="border-2 border-foreground p-5 sm:p-6">
        <h2 className="mb-1 flex items-center gap-2 text-2xl">
          <Scale className="size-5" /> Datos legales
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Aparecen en los términos, la política de privacidad y la de tratamiento de datos.
          Mientras falten, esas páginas muestran un aviso de &quot;documento sin finalizar&quot;.
          Aun así, revisa los textos con un abogado antes de abrir la tienda.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="legalName"
            label="Razón social"
            placeholder="p. ej. Átelier Moda S.A.S."
            error={errors.legalName?.message}
            {...register('legalName')}
          />
          <Field
            id="taxId"
            label="NIT"
            placeholder="p. ej. 901.234.567-8"
            error={errors.taxId?.message}
            {...register('taxId')}
          />
          <Field
            id="legalAddress"
            label="Domicilio"
            placeholder="p. ej. Calle 10 #20-30"
            error={errors.legalAddress?.message}
            {...register('legalAddress')}
          />
          <Field
            id="legalCity"
            label="Ciudad"
            placeholder="p. ej. Medellín"
            error={errors.legalCity?.message}
            {...register('legalCity')}
          />
          <div className="sm:col-span-2">
            <Field
              id="privacyEmail"
              label="Correo de habeas data (opcional)"
              type="email"
              placeholder="Si lo dejas vacío, se usa el correo de contacto"
              error={errors.privacyEmail?.message}
              {...register('privacyEmail')}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={pending || !isDirty}>
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
        {isDirty && !pending && (
          <span className="text-xs text-muted-foreground">Tienes cambios sin guardar.</span>
        )}
      </div>
    </form>
  );
}
