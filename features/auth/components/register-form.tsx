'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field } from './field';
import { GoogleButton } from './google-button';
import { signUpAction } from '../actions';
import { registerSchema, type RegisterInput } from '@/schemas/auth';

export function RegisterForm() {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  if (done) {
    return (
      <div className="space-y-4 border-2 border-foreground p-6">
        <h2 className="text-2xl">Revisa tu correo</h2>
        <p className="text-sm text-muted-foreground">{done}</p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Volver a iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        setFormError(null);
        startTransition(async () => {
          const res = await signUpAction(values);
          if (res?.error) {
            setFormError(res.error);
            toast.error(res.error);
          } else if (res?.success) {
            setDone(res.message ?? 'Cuenta creada.');
            toast.success('Cuenta creada');
          }
        });
      })}
      className="space-y-5"
    >
      <Field
        id="fullName"
        label="Nombre completo"
        autoComplete="name"
        placeholder="Ana Pérez"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Field
        id="email"
        label="Correo"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Field
        id="password"
        label="Contraseña"
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

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton />

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-foreground hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
