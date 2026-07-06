'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { upsertTaxonomy, deleteTaxonomy } from '../actions';
import type { TaxonomyRow } from '../lists';

type Kind = 'categories' | 'brands';

export function TaxonomyManager({
  kind,
  title,
  rows,
}: {
  kind: Kind;
  title: string;
  rows: TaxonomyRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaxonomyRow | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setOpen(true);
  }
  function openEdit(row: TaxonomyRow) {
    setEditing(row);
    setName(row.name);
    setDescription(row.description ?? '');
    setIsActive(row.isActive);
    setOpen(true);
  }

  function save() {
    startTransition(async () => {
      const res = await upsertTaxonomy(kind, {
        id: editing?.id,
        name,
        description: description || undefined,
        isActive,
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success('Guardado');
        setOpen(false);
        router.refresh();
      }
    });
  }

  function remove(row: TaxonomyRow) {
    if (!confirm(`¿Eliminar "${row.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteTaxonomy(kind, row.id);
      if (res.error) toast.error(res.error);
      else {
        toast.success('Eliminado');
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        <Button onClick={openNew}>
          <Plus className="size-4" /> Nuevo
        </Button>
      </div>

      <div className="overflow-x-auto border-2 border-foreground">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-foreground bg-secondary/40 text-left">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-display [&>th]:text-xs [&>th]:font-bold [&>th]:uppercase [&>th]:tracking-wider">
              <th>Nombre</th>
              <th>Slug</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="[&>td]:px-4 [&>td]:py-3">
                <td className="font-bold uppercase">{row.name}</td>
                <td className="text-muted-foreground">{row.slug}</td>
                <td>
                  <span className="border-2 border-foreground px-2 py-0.5 text-[0.65rem] font-bold uppercase">
                    {row.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(row)} aria-label="Editar" className="hover:text-foreground text-muted-foreground">
                      <Pencil className="size-4" />
                    </button>
                    <button onClick={() => remove(row)} aria-label="Eliminar" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Sin registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="border-l-2 border-foreground sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? 'Editar' : 'Nuevo'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-6">
            <div className="space-y-2">
              <Label htmlFor="tax-name">Nombre</Label>
              <Input id="tax-name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-none border-2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-desc">Descripción</Label>
              <Input id="tax-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-none border-2" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-foreground" />
              Activo
            </label>
            <Button onClick={save} disabled={pending || !name} className="w-full">
              {pending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
