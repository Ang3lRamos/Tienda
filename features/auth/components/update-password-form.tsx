'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field } from './field';
import { updatePasswordAction } from '../actions';
import { updatePasswordSchema, type UpdatePasswordInput } from '@/schemas/auth';
import { useMounted } from '@/hooks/use-mounted';

export function UpdatePasswordForm() {
  // Evita el envío nativo antes de hidratar (la contraseña acabaría en la URL).
  const mounted = useMounted();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordInput>({ resolver: zodResolver(updatePasswordSchema) });

  return (
    <form
      noValidate
      method="post"
      onSubmit={handleSubmit((values) => {
        setFormError(null);
        startTransition(async () => {
          const res = await updatePasswordAction(values);
          if (res?.error) {
            setFormError(res.error);
            toast.error(res.error);
          }
        });
      })}
      className="space-y-5"
    >
      <Field
        id="password"
        label="Nueva contraseña"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        error={errors.password?.message}
        {...register('password')}
      />
      <Field
        id="confirmPassword"
        label="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
        placeholder="Repite la contraseña"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      {formError && (
        <p className="border-2 border-destructive px-3 py-2 text-xs font-medium text-destructive">
          {formError}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending || !mounted}>
        {pending ? 'Guardando…' : 'Actualizar contraseña'}
      </Button>
    </form>
  );
}
