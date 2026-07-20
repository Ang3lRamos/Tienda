'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { MapPin, Plus, Star, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/features/auth/components/field';
import {
  upsertAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from '@/features/account/actions';
import { addressSchema, type AddressInput } from '@/schemas/account';
import type { AddressRow } from '@/types/database.types';

function rowToInput(a: AddressRow): AddressInput {
  return {
    id: a.id,
    label: a.label ?? undefined,
    recipient: a.recipient,
    phone: a.phone ?? '',
    line1: a.line1,
    line2: a.line2 ?? undefined,
    city: a.city,
    state: a.state ?? undefined,
    postalCode: a.postal_code ?? undefined,
    country: a.country,
    isDefault: a.is_default,
  };
}

export function AddressesManager({ addresses }: { addresses: AddressRow[] }) {
  const [editing, setEditing] = useState<AddressInput | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();

  function onDelete(id: string) {
    if (!confirm('¿Eliminar esta dirección?')) return;
    startTransition(async () => {
      const res = await deleteAddressAction(id);
      if (res?.error) toast.error(res.error);
      else toast.success('Dirección eliminada.');
    });
  }

  function onSetDefault(id: string) {
    startTransition(async () => {
      const res = await setDefaultAddressAction(id);
      if (res?.error) toast.error(res.error);
      else toast.success('Dirección predeterminada actualizada.');
    });
  }

  const showForm = creating || editing;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl">Mis direcciones</h2>
        {!showForm && (
          <Button
            variant="outline"
            onClick={() => {
              setEditing(null);
              setCreating(true);
            }}
          >
            <Plus className="size-4" /> Añadir
          </Button>
        )}
      </div>

      {showForm ? (
        <AddressForm
          initial={editing}
          pending={pending}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(values) =>
            startTransition(async () => {
              const res = await upsertAddressAction(values);
              if (res?.error) {
                toast.error(res.error);
                return;
              }
              toast.success('Dirección guardada.');
              setCreating(false);
              setEditing(null);
            })
          }
        />
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border-2 border-dashed border-border px-6 py-16 text-center">
          <MapPin className="size-8 text-muted-foreground" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Aún no has guardado ninguna dirección. Añade una para agilizar tus compras.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-3 border-2 border-foreground p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-display text-sm font-bold uppercase">
                    {a.label || 'Dirección'}
                    {a.is_default && (
                      <span className="inline-flex items-center gap-1 border-2 border-foreground px-1.5 py-0.5 text-[0.6rem]">
                        <Star className="size-3 fill-current" /> Predeterminada
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm">{a.recipient}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {[a.city, a.state, a.postal_code].filter(Boolean).join(', ')}
                  </p>
                  {a.phone && <p className="text-sm text-muted-foreground">Tel. {a.phone}</p>}
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                {!a.is_default && (
                  <Button size="sm" variant="ghost" onClick={() => onSetDefault(a.id)} disabled={pending}>
                    <Star className="size-4" /> Predeterminar
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setEditing(rowToInput(a))} disabled={pending}>
                  <Pencil className="size-4" /> Editar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(a.id)} disabled={pending}>
                  <Trash2 className="size-4" /> Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddressForm({
  initial,
  pending,
  onSave,
  onCancel,
}: {
  initial: AddressInput | null;
  pending: boolean;
  onSave: (values: AddressInput) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: initial ?? { country: 'CO', isDefault: false },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4 border-2 border-foreground p-5">
      {initial?.id && <input type="hidden" {...register('id')} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="label" label="Etiqueta (Casa, Oficina…)" error={errors.label?.message} {...register('label')} />
        <Field id="recipient" label="Destinatario" error={errors.recipient?.message} {...register('recipient')} />
        <Field id="phone" label="Teléfono" type="tel" error={errors.phone?.message} {...register('phone')} />
        <Field id="city" label="Ciudad" error={errors.city?.message} {...register('city')} />
        <div className="sm:col-span-2">
          <Field id="line1" label="Dirección" error={errors.line1?.message} {...register('line1')} />
        </div>
        <div className="sm:col-span-2">
          <Field id="line2" label="Apto / referencia (opcional)" error={errors.line2?.message} {...register('line2')} />
        </div>
        <Field id="state" label="Departamento (opcional)" error={errors.state?.message} {...register('state')} />
        <Field id="postalCode" label="Código postal (opcional)" error={errors.postalCode?.message} {...register('postalCode')} />
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" className="size-4 accent-foreground" {...register('isDefault')} />
        Usar como dirección predeterminada
      </label>
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar dirección'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
