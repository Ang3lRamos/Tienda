'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { upsertProduct, deleteProduct } from '../actions';
import { formatPrice } from '@/lib/utils';
import type { AdminProductRow } from '../lists';

type Option = { id: string; name: string };
type Form = {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
  brandId: string;
  gender: 'men' | 'women' | 'unisex' | 'kids';
  basePrice: string;
  compareAtPrice: string;
  material: string;
  careInstructions: string;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
};

const empty: Form = {
  name: '', description: '', categoryId: '', brandId: '', gender: 'unisex',
  basePrice: '', compareAtPrice: '', material: '', careInstructions: '',
  status: 'draft', isFeatured: false,
};

export function ProductsManager({
  rows,
  categories,
  brands,
}: {
  rows: AdminProductRow[];
  categories: Option[];
  brands: Option[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setForm(empty);
    setOpen(true);
  }
  function openEdit(p: AdminProductRow) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? '',
      categoryId: p.categoryId ?? '',
      brandId: p.brandId ?? '',
      gender: p.gender as Form['gender'],
      basePrice: String(p.price),
      compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : '',
      material: p.material ?? '',
      careInstructions: p.careInstructions ?? '',
      status: p.status as Form['status'],
      isFeatured: p.isFeatured,
    });
    setOpen(true);
  }

  function save() {
    startTransition(async () => {
      const res = await upsertProduct({
        id: form.id,
        name: form.name,
        description: form.description || undefined,
        categoryId: form.categoryId || null,
        brandId: form.brandId || null,
        gender: form.gender,
        basePrice: Number(form.basePrice),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        material: form.material || undefined,
        careInstructions: form.careInstructions || undefined,
        status: form.status,
        isFeatured: form.isFeatured,
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success('Producto guardado');
        setOpen(false);
        router.refresh();
      }
    });
  }

  function remove(p: AdminProductRow) {
    if (!confirm(`¿Eliminar "${p.name}"? Esto elimina sus variantes e imágenes.`)) return;
    startTransition(async () => {
      const res = await deleteProduct(p.id);
      if (res.error) toast.error(res.error);
      else {
        toast.success('Producto eliminado');
        router.refresh();
      }
    });
  }

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl md:text-5xl">Productos</h1>
        <Button onClick={openNew}>
          <Plus className="size-4" /> Nuevo
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Nota: la gestión de variantes (colores/tallas) e imágenes se realiza por SKU;
        aquí administras la ficha principal del producto.
      </p>

      <div className="overflow-x-auto border-2 border-foreground">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-foreground bg-secondary/40 text-left">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-display [&>th]:text-xs [&>th]:font-bold [&>th]:uppercase [&>th]:tracking-wider">
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => (
              <tr key={p.id} className="[&>td]:px-4 [&>td]:py-3">
                <td className="font-bold uppercase">
                  {p.name}
                  {p.isFeatured && <span className="ml-2 text-[0.6rem] text-muted-foreground">★</span>}
                </td>
                <td className="text-muted-foreground">{p.categoryName ?? '—'}</td>
                <td className="tabular-nums">{formatPrice(p.price)}</td>
                <td>
                  <span className="border-2 border-foreground px-2 py-0.5 text-[0.65rem] font-bold uppercase">
                    {p.status}
                  </span>
                </td>
                <td>
                  <div className="flex justify-end gap-2 text-muted-foreground">
                    <Link href={`/producto/${p.slug}`} aria-label="Ver" className="hover:text-foreground">
                      <ExternalLink className="size-4" />
                    </Link>
                    <button onClick={() => openEdit(p)} aria-label="Editar" className="hover:text-foreground">
                      <Pencil className="size-4" />
                    </button>
                    <button onClick={() => remove(p)} aria-label="Eliminar" className="hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="overflow-y-auto border-l-2 border-foreground sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{form.id ? 'Editar producto' : 'Nuevo producto'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-6 pb-10">
            <Field label="Nombre">
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} className="rounded-none border-2" />
            </Field>
            <Field label="Descripción">
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                className="w-full border-2 border-input bg-transparent p-2 text-sm outline-none focus:border-foreground"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoría">
                <Select value={form.categoryId} onChange={(v) => set('categoryId', v)} options={categories} />
              </Field>
              <Field label="Marca">
                <Select value={form.brandId} onChange={(v) => set('brandId', v)} options={brands} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Precio (COP)">
                <Input type="number" value={form.basePrice} onChange={(e) => set('basePrice', e.target.value)} className="rounded-none border-2" />
              </Field>
              <Field label="Precio anterior">
                <Input type="number" value={form.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} className="rounded-none border-2" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Género">
                <NativeSelect value={form.gender} onChange={(v) => set('gender', v as Form['gender'])}>
                  <option value="women">Mujer</option>
                  <option value="men">Hombre</option>
                  <option value="unisex">Unisex</option>
                  <option value="kids">Niños</option>
                </NativeSelect>
              </Field>
              <Field label="Estado">
                <NativeSelect value={form.status} onChange={(v) => set('status', v as Form['status'])}>
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </NativeSelect>
              </Field>
            </div>
            <Field label="Material">
              <Input value={form.material} onChange={(e) => set('material', e.target.value)} className="rounded-none border-2" />
            </Field>
            <Field label="Cuidados">
              <Input value={form.careInstructions} onChange={(e) => set('careInstructions', e.target.value)} className="rounded-none border-2" />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} className="accent-foreground" />
              Producto destacado
            </label>
            <Button onClick={save} disabled={pending || !form.name || !form.basePrice} className="w-full">
              {pending ? 'Guardando…' : 'Guardar producto'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function NativeSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full border-2 border-input bg-transparent px-2 text-sm outline-none focus:border-foreground"
    >
      {children}
    </select>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}) {
  return (
    <NativeSelect value={value} onChange={onChange}>
      <option value="">—</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </NativeSelect>
  );
}
