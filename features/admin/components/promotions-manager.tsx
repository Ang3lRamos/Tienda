'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { upsertPromotion, deletePromotion, togglePromotion } from '../actions';
import { formatPrice } from '@/lib/utils';
import type { PromotionRowView } from '../lists';

type Option = { id: string; name: string };
type Form = {
  id?: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: string;
  scope: 'all' | 'category' | 'brand';
  targetId: string;
  bannerImageUrl: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};
const empty: Form = {
  name: '', description: '', type: 'percentage', value: '', scope: 'all',
  targetId: '', bannerImageUrl: '', startsAt: '', endsAt: '', isActive: true,
};
const d10 = (s: string | null) => (s ? s.slice(0, 10) : '');

export function PromotionsManager({
  rows,
  categories,
  brands,
}: {
  rows: PromotionRowView[];
  categories: Option[];
  brands: Option[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  function openNew() { setForm(empty); setOpen(true); }
  function openEdit(p: PromotionRowView) {
    setForm({
      id: p.id, name: p.name, description: p.description ?? '',
      type: p.type as Form['type'], value: String(p.value),
      scope: (['all', 'category', 'brand'].includes(p.scope) ? p.scope : 'all') as Form['scope'],
      targetId: p.targetId ?? '', bannerImageUrl: p.bannerImageUrl ?? '',
      startsAt: d10(p.startsAt), endsAt: d10(p.endsAt), isActive: p.isActive,
    });
    setOpen(true);
  }
  function save() {
    startTransition(async () => {
      const res = await upsertPromotion({
        id: form.id, name: form.name, description: form.description || undefined,
        type: form.type, value: Number(form.value), scope: form.scope,
        targetId: form.scope === 'all' ? null : form.targetId || null,
        bannerImageUrl: form.bannerImageUrl || undefined,
        startsAt: form.startsAt || undefined, endsAt: form.endsAt || undefined,
        isActive: form.isActive,
      });
      if (res.error) toast.error(res.error);
      else { toast.success('Promoción guardada'); setOpen(false); router.refresh(); }
    });
  }
  function remove(p: PromotionRowView) {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return;
    startTransition(async () => {
      const res = await deletePromotion(p.id);
      if (res.error) toast.error(res.error);
      else { toast.success('Eliminada'); router.refresh(); }
    });
  }
  function toggle(p: PromotionRowView) {
    startTransition(async () => {
      const res = await togglePromotion(p.id, !p.isActive);
      if (res.error) toast.error(res.error);
      else router.refresh();
    });
  }

  const targetOptions = form.scope === 'category' ? categories : form.scope === 'brand' ? brands : [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Promociones</h2>
        <Button size="sm" onClick={openNew}><Plus className="size-4" /> Nueva</Button>
      </div>
      {/* Móvil: tarjetas apiladas */}
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground md:hidden">Sin promociones.</p>
      ) : (
        <ul className="space-y-3 md:hidden">
          {rows.map((p) => (
            <li key={p.id} className="space-y-2 border-2 border-foreground p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-display text-sm font-bold uppercase break-words">{p.name}</p>
                <div className="flex shrink-0 gap-3 text-muted-foreground">
                  <button onClick={() => openEdit(p)} aria-label="Editar" className="hover:text-foreground"><Pencil className="size-4" /></button>
                  <button onClick={() => remove(p)} aria-label="Eliminar" className="hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="font-display text-base font-black tabular-nums text-foreground">
                  {p.type === 'percentage' ? `${p.value}%` : formatPrice(p.value)}
                </span>
                <span>
                  {p.endsAt ? `hasta ${format(new Date(p.endsAt), 'd MMM yyyy', { locale: es })}` : 'Sin límite'}
                </span>
                <button onClick={() => toggle(p)} disabled={pending}
                  className={`border-2 border-foreground px-2 py-0.5 text-[0.65rem] font-bold uppercase ${p.isActive ? 'bg-foreground text-background' : ''}`}>
                  {p.isActive ? 'Activa' : 'Inactiva'}
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
              <th>Nombre</th><th>Descuento</th><th>Vigencia</th><th>Estado</th><th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => (
              <tr key={p.id} className="[&>td]:px-4 [&>td]:py-3">
                <td className="font-bold uppercase">{p.name}</td>
                <td className="tabular-nums">{p.type === 'percentage' ? `${p.value}%` : formatPrice(p.value)}</td>
                <td className="text-muted-foreground">
                  {p.endsAt ? `hasta ${format(new Date(p.endsAt), 'd MMM yyyy', { locale: es })}` : 'Sin límite'}
                </td>
                <td>
                  <button onClick={() => toggle(p)} disabled={pending}
                    className={`border-2 border-foreground px-2 py-0.5 text-[0.65rem] font-bold uppercase ${p.isActive ? 'bg-foreground text-background' : ''}`}>
                    {p.isActive ? 'Activa' : 'Inactiva'}
                  </button>
                </td>
                <td>
                  <div className="flex justify-end gap-2 text-muted-foreground">
                    <button onClick={() => openEdit(p)} className="hover:text-foreground"><Pencil className="size-4" /></button>
                    <button onClick={() => remove(p)} className="hover:text-destructive"><Trash2 className="size-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Sin promociones.</td></tr>}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="overflow-y-auto border-l-2 border-foreground sm:max-w-md">
          <SheetHeader><SheetTitle>{form.id ? 'Editar promoción' : 'Nueva promoción'}</SheetTitle></SheetHeader>
          <div className="space-y-4 px-6 pb-12">
            <F label="Nombre"><Input value={form.name} onChange={(e) => set('name', e.target.value)} className="rounded-none border-2" /></F>
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
              <F label="Aplica a">
                <Sel value={form.scope} onChange={(v) => set('scope', v as Form['scope'])}>
                  <option value="all">Todo</option>
                  <option value="category">Categoría</option>
                  <option value="brand">Marca</option>
                </Sel>
              </F>
              {form.scope !== 'all' && (
                <F label={form.scope === 'category' ? 'Categoría' : 'Marca'}>
                  <Sel value={form.targetId} onChange={(v) => set('targetId', v)}>
                    <option value="">—</option>
                    {targetOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </Sel>
                </F>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <F label="Desde"><Input type="date" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} className="rounded-none border-2" /></F>
              <F label="Hasta"><Input type="date" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} className="rounded-none border-2" /></F>
            </div>
            <F label="Imagen de banner (URL, opcional)"><Input value={form.bannerImageUrl} onChange={(e) => set('bannerImageUrl', e.target.value)} placeholder="https://…" className="rounded-none border-2" /></F>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="accent-foreground" /> Activa
            </label>
            <Button onClick={save} disabled={pending || !form.name || !form.value} className="w-full">
              {pending ? 'Guardando…' : 'Guardar promoción'}
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
