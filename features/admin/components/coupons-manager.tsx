'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { upsertCoupon, deleteCoupon, toggleCoupon } from '../actions';
import { formatPrice } from '@/lib/utils';
import type { CouponRowView } from '../lists';

type Form = {
  id?: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: string;
  minPurchase: string;
  maxUses: string;
  perUserLimit: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};
const empty: Form = {
  code: '', description: '', type: 'percentage', value: '', minPurchase: '0',
  maxUses: '', perUserLimit: '1', startsAt: '', endsAt: '', isActive: true,
};
const d10 = (s: string | null) => (s ? s.slice(0, 10) : '');

export function CouponsManager({ rows }: { rows: CouponRowView[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  function openNew() { setForm(empty); setOpen(true); }
  function openEdit(c: CouponRowView) {
    setForm({
      id: c.id, code: c.code, description: c.description ?? '', type: c.type as Form['type'],
      value: String(c.value), minPurchase: String(c.minPurchase),
      maxUses: c.maxUses != null ? String(c.maxUses) : '', perUserLimit: String(c.perUserLimit),
      startsAt: d10(c.startsAt), endsAt: d10(c.endsAt), isActive: c.isActive,
    });
    setOpen(true);
  }
  function save() {
    startTransition(async () => {
      const res = await upsertCoupon({
        id: form.id, code: form.code, description: form.description || undefined,
        type: form.type, value: Number(form.value), minPurchase: Number(form.minPurchase || 0),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        perUserLimit: Number(form.perUserLimit || 1),
        startsAt: form.startsAt || undefined, endsAt: form.endsAt || undefined, isActive: form.isActive,
      });
      if (res.error) toast.error(res.error);
      else { toast.success('Cupón guardado'); setOpen(false); router.refresh(); }
    });
  }
  function remove(c: CouponRowView) {
    if (!confirm(`¿Eliminar el cupón "${c.code}"?`)) return;
    startTransition(async () => {
      const res = await deleteCoupon(c.id);
      if (res.error) toast.error(res.error);
      else { toast.success('Eliminado'); router.refresh(); }
    });
  }
  function toggle(c: CouponRowView) {
    startTransition(async () => {
      const res = await toggleCoupon(c.id, !c.isActive);
      if (res.error) toast.error(res.error);
      else router.refresh();
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Cupones</h2>
        <Button size="sm" onClick={openNew}><Plus className="size-4" /> Nuevo</Button>
      </div>
      {/* Móvil: tarjetas apiladas */}
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground md:hidden">Sin cupones.</p>
      ) : (
        <ul className="space-y-3 md:hidden">
          {rows.map((c) => (
            <li key={c.id} className="space-y-2 border-2 border-foreground p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-display text-sm font-bold uppercase break-all">{c.code}</p>
                <div className="flex shrink-0 gap-3 text-muted-foreground">
                  <button onClick={() => openEdit(c)} aria-label="Editar" className="hover:text-foreground"><Pencil className="size-4" /></button>
                  <button onClick={() => remove(c)} aria-label="Eliminar" className="hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="font-display text-base font-black tabular-nums text-foreground">
                  {c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}
                </span>
                <span className="tabular-nums">
                  Usos: {c.usedCount}{c.maxUses != null ? ` / ${c.maxUses}` : ''}
                </span>
                <button onClick={() => toggle(c)} disabled={pending}
                  className={`border-2 border-foreground px-2 py-0.5 text-[0.65rem] font-bold uppercase ${c.isActive ? 'bg-foreground text-background' : ''}`}>
                  {c.isActive ? 'Activo' : 'Inactivo'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Escritorio: tabla completa */}
      <div className="hidden overflow-x-auto border-2 border-foreground md:block">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-foreground bg-secondary/40 text-left">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-display [&>th]:text-xs [&>th]:font-bold [&>th]:uppercase [&>th]:tracking-wider">
              <th>Código</th><th>Descuento</th><th>Usos</th><th>Estado</th><th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((c) => (
              <tr key={c.id} className="[&>td]:px-4 [&>td]:py-3">
                <td className="font-bold uppercase">{c.code}</td>
                <td className="tabular-nums">{c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}</td>
                <td className="tabular-nums text-muted-foreground">{c.usedCount}{c.maxUses != null ? ` / ${c.maxUses}` : ''}</td>
                <td>
                  <button onClick={() => toggle(c)} disabled={pending}
                    className={`border-2 border-foreground px-2 py-0.5 text-[0.65rem] font-bold uppercase ${c.isActive ? 'bg-foreground text-background' : ''}`}>
                    {c.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td>
                  <div className="flex justify-end gap-2 text-muted-foreground">
                    <button onClick={() => openEdit(c)} className="hover:text-foreground"><Pencil className="size-4" /></button>
                    <button onClick={() => remove(c)} className="hover:text-destructive"><Trash2 className="size-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Sin cupones.</td></tr>}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="overflow-y-auto border-l-2 border-foreground sm:max-w-md">
          <SheetHeader><SheetTitle>{form.id ? 'Editar cupón' : 'Nuevo cupón'}</SheetTitle></SheetHeader>
          <div className="space-y-4 px-6 pb-12">
            <F label="Código"><Input value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="BIENVENIDO10" className="rounded-none border-2 uppercase" /></F>
            <F label="Descripción"><Input value={form.description} onChange={(e) => set('description', e.target.value)} className="rounded-none border-2" /></F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Tipo">
                <Sel value={form.type} onChange={(v) => set('type', v as Form['type'])}>
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto fijo ($)</option>
                </Sel>
              </F>
              <F label={form.type === 'percentage' ? 'Valor (%)' : 'Valor (COP)'}>
                <Input type="number" value={form.value} onChange={(e) => set('value', e.target.value)} className="rounded-none border-2" />
              </F>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <F label="Compra mínima (COP)"><Input type="number" value={form.minPurchase} onChange={(e) => set('minPurchase', e.target.value)} className="rounded-none border-2" /></F>
              <F label="Usos máx. (vacío = ilimitado)"><Input type="number" value={form.maxUses} onChange={(e) => set('maxUses', e.target.value)} className="rounded-none border-2" /></F>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <F label="Desde"><Input type="date" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} className="rounded-none border-2" /></F>
              <F label="Hasta"><Input type="date" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} className="rounded-none border-2" /></F>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="accent-foreground" /> Activo
            </label>
            <Button onClick={save} disabled={pending || !form.code || !form.value} className="w-full">
              {pending ? 'Guardando…' : 'Guardar cupón'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
function Sel({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full border-2 border-input bg-transparent px-2 text-sm outline-none focus:border-foreground">
      {children}
    </select>
  );
}
