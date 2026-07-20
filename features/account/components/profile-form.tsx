'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field } from '@/features/auth/components/field';
import { updateProfileAction } from '@/features/account/actions';
import { profileSchema, type ProfileInput } from '@/schemas/account';

export function ProfileForm({
  defaultValues,
  email,
}: {
  defaultValues: { fullName: string; phone: string };
  email: string;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  function onSubmit(values: ProfileInput) {
    startTransition(async () => {
      const res = await updateProfileAction(values);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Perfil actualizado.');
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Actualiza tu nombre y teléfono de contacto.
        </p>
        <Button variant="outline" onClick={() => setEditing(true)}>
          Editar perfil
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border-2 border-foreground p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="fullName" label="Nombre" error={errors.fullName?.message} {...register('fullName')} />
        <Field id="phone" label="Teléfono" type="tel" error={errors.phone?.message} {...register('phone')} />
      </div>
      <div className="space-y-1">
        <p className="font-display text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Correo
        </p>
        <p className="text-sm">{email} <span className="text-muted-foreground">(no editable)</span></p>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset(defaultValues);
            setEditing(false);
          }}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
