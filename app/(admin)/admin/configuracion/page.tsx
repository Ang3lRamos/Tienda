import type { Metadata } from 'next';
import { getStoreSettings } from '@/features/settings/queries';
import { SettingsForm } from '@/features/admin/components/settings-form';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = { title: 'Configuración' };

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl md:text-5xl">Configuración</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Estos valores se aplican en toda la tienda al guardarlos, sin necesidad de
          volver a desplegar.
        </p>
      </div>

      <SettingsForm
        defaultValues={{
          shippingCost: settings.shippingCost,
          freeShippingThreshold: settings.freeShippingThreshold,
          taxRate: settings.taxRate,
          storeName: settings.storeName,
          contactEmail: settings.contactEmail ?? undefined,
          contactPhone: settings.contactPhone ?? undefined,
          announcement: settings.announcement ?? undefined,
        }}
      />

      <dl className="divide-y-2 divide-border border-2 border-border">
        {[
          { label: 'Moneda', value: siteConfig.currency },
          { label: 'Localización', value: siteConfig.locale },
        ].map((r) => (
          <div key={r.label} className="grid grid-cols-3 gap-4 px-5 py-3">
            <dt className="font-display text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
              {r.label}
            </dt>
            <dd className="col-span-2 text-sm text-muted-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">
        La moneda y la localización se definen en el código (`config/site.ts`) porque
        afectan al formateo de precios en toda la aplicación.
      </p>
    </div>
  );
}
