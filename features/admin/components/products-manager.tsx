'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ExternalLink, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { upsertProduct, deleteProduct } from '../actions';
import { formatPrice } from '@/lib/utils';
import type { AdminProductRow } from '../lists';

type Option = { id: string; name: string };
type ImgRow = { url: string; alt: string; isPrimary: boolean };
type VarRow = {
  id?: string;
  color: string;
  colorHex: string;
  size: string;
  sku: string;
  price: string;
  quantity: string;
};
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
  images: ImgRow[];
  variants: VarRow[];
};

const empty: Form = {
  name: '', description: '', categoryId: '', brandId: '', gender: 'unisex',
  basePrice: '', compareAtPrice: '', material: '', careInstructions: '',
  status: 'draft', isFeatured: false, images: [], variants: [],
};

const emptyVariant = (): VarRow => ({ color: '', colorHex: '#000000', size: '', sku: '', price: '', quantity: '0' });

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

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  function openNew() {
    setForm({ ...empty, images: [], variants: [emptyVariant()] });
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
      images: p.images.map((im) => ({ url: im.url, alt: im.alt ?? '', isPrimary: im.isPrimary })),
      variants: p.variants.map((v) => ({
        id: v.id,
        color: v.color ?? '',
        colorHex: v.colorHex ?? '#000000',
        size: v.size ?? '',
        sku: v.sku,
        price: v.price != null ? String(v.price) : '',
        quantity: String(v.quantity),
      })),
    });
    setOpen(true);
  }

  // --- imágenes ---
  const addImage = () => set('images', [...form.images, { url: '', alt: '', isPrimary: form.images.length === 0 }]);
  const updImage = (i: number, patch: Partial<ImgRow>) =>
    set('images', form.images.map((im, idx) => (idx === i ? { ...im, ...patch } : im)));
  const rmImage = (i: number) => set('images', form.images.filter((_, idx) => idx !== i));
  const setPrimary = (i: number) => set('images', form.images.map((im, idx) => ({ ...im, isPrimary: idx === i })));

  // --- variantes ---
  const addVariant = () => set('variants', [...form.variants, emptyVariant()]);
  const updVariant = (i: number, patch: Partial<VarRow>) =>
    set('variants', form.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const rmVariant = (i: number) => set('variants', form.variants.filter((_, idx) => idx !== i));

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
        images: form.images
          .filter((im) => im.url.trim())
          .map((im) => ({ url: im.url.trim(), alt: im.alt || undefined, isPrimary: im.isPrimary })),
        variants: form.variants
          .filter((v) => v.sku.trim())
          .map((v) => ({
            id: v.id,
            color: v.color || undefined,
            colorHex: v.colorHex || undefined,
            size: v.size || undefined,
            sku: v.sku.trim(),
            price: v.price ? Number(v.price) : null,
            quantity: v.quantity ? Number(v.quantity) : 0,
          })),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl md:text-5xl">Productos</h1>
        <Button onClick={openNew}>
          <Plus className="size-4" /> Nuevo
        </Button>
      </div>

      <div className="overflow-x-auto border-2 border-foreground">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-foreground bg-secondary/40 text-left">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-display [&>th]:text-xs [&>th]:font-bold [&>th]:uppercase [&>th]:tracking-wider">
              <th>Producto</th>
              <th>Variantes</th>
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
                <td className="text-muted-foreground tabular-nums">
                  {p.variants.length} · {p.variants.reduce((s, v) => s + v.quantity, 0)} u.
                </td>
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
          <div className="space-y-6 px-6 pb-12">
            {/* Ficha */}
            <div className="space-y-4">
              <FieldRow label="Nombre">
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} className="rounded-none border-2" />
              </FieldRow>
              <FieldRow label="Descripción">
                <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className="w-full border-2 border-input bg-transparent p-2 text-sm outline-none focus:border-foreground" />
              </FieldRow>
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="Categoría">
                  <NativeSelect value={form.categoryId} onChange={(v) => set('categoryId', v)}>
                    <option value="">—</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </NativeSelect>
                </FieldRow>
                <FieldRow label="Marca">
                  <NativeSelect value={form.brandId} onChange={(v) => set('brandId', v)}>
                    <option value="">—</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </NativeSelect>
                </FieldRow>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="Precio (COP)">
                  <Input type="number" value={form.basePrice} onChange={(e) => set('basePrice', e.target.value)} className="rounded-none border-2" />
                </FieldRow>
                <FieldRow label="Precio anterior">
                  <Input type="number" value={form.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} className="rounded-none border-2" />
                </FieldRow>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="Género">
                  <NativeSelect value={form.gender} onChange={(v) => set('gender', v as Form['gender'])}>
                    <option value="women">Mujer</option>
                    <option value="men">Hombre</option>
                    <option value="unisex">Unisex</option>
                    <option value="kids">Niños</option>
                  </NativeSelect>
                </FieldRow>
                <FieldRow label="Estado">
                  <NativeSelect value={form.status} onChange={(v) => set('status', v as Form['status'])}>
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                  </NativeSelect>
                </FieldRow>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="Material">
                  <Input value={form.material} onChange={(e) => set('material', e.target.value)} className="rounded-none border-2" />
                </FieldRow>
                <FieldRow label="Cuidados">
                  <Input value={form.careInstructions} onChange={(e) => set('careInstructions', e.target.value)} className="rounded-none border-2" />
                </FieldRow>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} className="accent-foreground" />
                Producto destacado
              </label>
            </div>

            {/* Imágenes */}
            <section className="space-y-3 border-t-2 border-border pt-4">
              <div className="flex items-center justify-between">
                <h3 className="kicker">Imágenes</h3>
                <Button type="button" size="sm" variant="outline" onClick={addImage}>
                  <Plus className="size-3.5" /> Imagen
                </Button>
              </div>
              {form.images.length === 0 && (
                <p className="text-xs text-muted-foreground">Añade la URL de al menos una imagen (p. ej. de Unsplash o tu CDN).</p>
              )}
              {form.images.map((im, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={im.url}
                    onChange={(e) => updImage(i, { url: e.target.value })}
                    placeholder="https://…/imagen.jpg"
                    className="h-9 min-w-0 flex-1 border-2 border-input bg-transparent px-2 text-xs outline-none focus:border-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setPrimary(i)}
                    title="Marcar como principal"
                    className={`shrink-0 border-2 px-2 py-1 text-[0.6rem] font-bold uppercase ${im.isPrimary ? 'border-foreground bg-foreground text-background' : 'border-border'}`}
                  >
                    Principal
                  </button>
                  <button type="button" onClick={() => rmImage(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </section>

            {/* Variantes */}
            <section className="space-y-3 border-t-2 border-border pt-4">
              <div className="flex items-center justify-between">
                <h3 className="kicker">Variantes (color / talla / stock)</h3>
                <Button type="button" size="sm" variant="outline" onClick={addVariant}>
                  <Plus className="size-3.5" /> Variante
                </Button>
              </div>
              {form.variants.length === 0 && (
                <p className="text-xs text-muted-foreground">Añade al menos una variante para que el producto sea comprable.</p>
              )}
              {form.variants.map((v, i) => (
                <div key={i} className="space-y-2 border-2 border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="kicker text-muted-foreground">Variante {i + 1}</span>
                    <button type="button" onClick={() => rmVariant(i)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <input value={v.color} onChange={(e) => updVariant(i, { color: e.target.value })} placeholder="Color" className="h-9 min-w-0 flex-1 border-2 border-input bg-transparent px-2 text-xs outline-none focus:border-foreground" />
                      <input type="color" value={v.colorHex} onChange={(e) => updVariant(i, { colorHex: e.target.value })} title="Color hex" className="h-9 w-9 shrink-0 border-2 border-input bg-transparent" />
                    </div>
                    <input value={v.size} onChange={(e) => updVariant(i, { size: e.target.value })} placeholder="Talla (S, M, 32…)" className="h-9 border-2 border-input bg-transparent px-2 text-xs outline-none focus:border-foreground" />
                    <input value={v.sku} onChange={(e) => updVariant(i, { sku: e.target.value })} placeholder="SKU" className="col-span-2 h-9 border-2 border-input bg-transparent px-2 text-xs uppercase outline-none focus:border-foreground" />
                    <input type="number" value={v.price} onChange={(e) => updVariant(i, { price: e.target.value })} placeholder="Precio (opcional)" className="h-9 border-2 border-input bg-transparent px-2 text-xs outline-none focus:border-foreground" />
                    <input type="number" value={v.quantity} onChange={(e) => updVariant(i, { quantity: e.target.value })} placeholder="Stock" className="h-9 border-2 border-input bg-transparent px-2 text-xs outline-none focus:border-foreground" />
                  </div>
                </div>
              ))}
            </section>

            <Button onClick={save} disabled={pending || !form.name || !form.basePrice} className="w-full">
              {pending ? 'Guardando…' : 'Guardar producto'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
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
