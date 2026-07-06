import type { Metadata } from 'next';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { listPromotions } from '@/features/admin/lists';
import { PromotionToggle } from '@/features/admin/components/promotion-toggle';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Promociones' };

export default async function AdminPromotionsPage() {
  const promos = await listPromotions();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl md:text-5xl">Promociones</h1>
      <div className="overflow-x-auto border-2 border-foreground">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-foreground bg-secondary/40 text-left">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-display [&>th]:text-xs [&>th]:font-bold [&>th]:uppercase [&>th]:tracking-wider">
              <th>Nombre</th>
              <th>Descuento</th>
              <th>Vigencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {promos.map((p) => (
              <tr key={p.id} className="[&>td]:px-4 [&>td]:py-3">
                <td className="font-bold uppercase">{p.name}</td>
                <td className="tabular-nums">
                  {p.type === 'percentage' ? `${p.value}%` : formatPrice(p.value)}
                </td>
                <td className="text-muted-foreground">
                  {p.endsAt ? `hasta ${format(new Date(p.endsAt), 'd MMM yyyy', { locale: es })}` : 'Sin límite'}
                </td>
                <td>
                  <PromotionToggle id={p.id} active={p.isActive} />
                </td>
              </tr>
            ))}
            {promos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Sin promociones. (La creación se gestiona en la BD por ahora.)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
