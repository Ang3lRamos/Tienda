'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field } from './field';
import { GoogleButton } from './google-button';
import { signInAction } from '../actions';
import { loginSchema, type LoginInput } from '@/schemas/auth';

export function LoginForm({ redirectTo = '/account' }: { redirectTo?: string }) {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        setFormError(null);
        startTransition(async () => {
          const res = await signInAction(values, redirectTo);
          if (res?.error) {
            setFormError(res.error);
            toast.error(res.error);
          }
        });
      })}
      className="space-y-5"
    >
      <Field
        id="email"
        label="Correo"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <div className="space-y-2">
        <Field
          id="password"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="text-right">
          <Link
            href="/recuperar"
            className="text-xs tracking-wide text-muted-foreground uppercase hover:text-foreground"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      {formError && (
        <p className="border-2 border-destructive px-3 py-2 text-xs font-medium text-destructive">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Entrando…' : 'Iniciar sesión'}
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton />

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="font-semibold text-foreground hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
