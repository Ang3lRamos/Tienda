import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = { title: 'Configuración' };

export default function AdminSettingsPage() {
  const rows = [
    { label: 'Tienda', value: siteConfig.name },
    { label: 'Eslogan', value: siteConfig.tagline },
    { label: 'Moneda', value: siteConfig.currency },
    { label: 'Localización', value: siteConfig.locale },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl md:text-5xl">Configuración</h1>
      <dl className="divide-y-2 divide-border border-2 border-foreground">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-3 gap-4 px-5 py-4">
            <dt className="font-display text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
              {r.label}
            </dt>
            <dd className="col-span-2 text-sm">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-muted-foreground">
        La edición de estos valores y ajustes avanzados (envíos, impuestos,
        integraciones de pago) se habilitará próximamente.
      </p>
    </div>
  );
}
