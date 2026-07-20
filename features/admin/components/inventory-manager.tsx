'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { adjustInventory } from '../actions';
import { cn } from '@/lib/utils';
import type { InventoryRowView } from '../lists';

export function InventoryManager({ rows }: { rows: InventoryRowView[] }) {
  const router = useRouter();
  const [deltas, setDeltas] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function apply(variantId: string) {
    const delta = Number(deltas[variantId]);
    if (!Number.isInteger(delta) || delta === 0) {
      toast.error('Ingresa una cantidad (+ entrada, − salida)');
      return;
    }
    startTransition(async () => {
      const res = await adjustInventory(variantId, delta, 'ajuste manual');
      if (res.error) toast.error(res.error);
      else {
        toast.success('Inventario actualizado');
        setDeltas((d) => ({ ...d, [variantId]: '' }));
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl md:text-5xl">Inventario</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Registra entradas (+) y salidas (−). Cada ajuste queda en el historial de movimientos.
        </p>
      </div>

      {/* Móvil: tarjetas apiladas (la tabla no cabe sin alejar la pantalla) */}
      <ul className="space-y-3 md:hidden">
        {rows.map((r) => {
          const out = r.available <= 0;
          const low = !out && r.available <= r.threshold;
          return (
            <li key={r.variantId} className="space-y-3 border-2 border-foreground p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold uppercase break-words">
                    {r.productName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground break-all">{r.sku}</p>
                  <p className="text-xs text-muted-foreground">{r.label}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 border-2 border-foreground px-2 py-0.5 text-[0.65rem] font-bold uppercase',
                    out && 'bg-foreground text-background',
                  )}
                >
                  {out ? 'Agotado' : low ? 'Bajo' : 'OK'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm">
                  Stock:{' '}
                  <span className="font-display text-lg font-black tabular-nums">{r.available}</span>
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={deltas[r.variantId] ?? ''}
                    onChange={(e) => setDeltas((d) => ({ ...d, [r.variantId]: e.target.value }))}
                    placeholder="±"
                    aria-label={`Ajustar stock de ${r.sku}`}
                    className="h-9 w-16 border-2 border-input bg-transparent px-2 text-sm outline-none focus:border-foreground"
                  />
                  <Button size="sm" variant="outline" disabled={pending} onClick={() => apply(r.variantId)}>
                    Aplicar
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Escritorio: tabla completa */}
      <div className="hidden overflow-x-auto border-2 border-foreground md:block">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-foreground bg-secondary/40 text-left">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-display [&>th]:text-xs [&>th]:font-bold [&>th]:uppercase [&>th]:tracking-wider">
              <th>Producto</th>
              <th>SKU</th>
              <th>Variante</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Ajustar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => {
              const out = r.available <= 0;
              const low = !out && r.available <= r.threshold;
              return (
                <tr key={r.variantId} className="[&>td]:px-4 [&>td]:py-3">
                  <td className="font-bold uppercase">{r.productName}</td>
                  <td className="text-muted-foreground">{r.sku}</td>
                  <td className="text-muted-foreground">{r.label}</td>
                  <td className="tabular-nums">{r.available}</td>
                  <td>
                    <span
                      className={cn(
                        'border-2 border-foreground px-2 py-0.5 text-[0.65rem] font-bold uppercase',
                        out && 'bg-foreground text-background',
                      )}
                    >
                      {out ? 'Agotado' : low ? 'Bajo' : 'OK'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={deltas[r.variantId] ?? ''}
                        onChange={(e) => setDeltas((d) => ({ ...d, [r.variantId]: e.target.value }))}
                        placeholder="±"
                        className="h-9 w-20 border-2 border-input bg-transparent px-2 text-sm outline-none focus:border-foreground"
                      />
                      <Button size="sm" variant="outline" disabled={pending} onClick={() => apply(r.variantId)}>
                        Aplicar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
