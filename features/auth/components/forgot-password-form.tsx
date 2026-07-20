'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Field } from './field';
import { requestPasswordResetAction } from '../actions';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/auth';
import { useMounted } from '@/hooks/use-mounted';

export function ForgotPasswordForm() {
  // Evita el envío nativo antes de hidratar (el correo acabaría en la URL).
  const mounted = useMounted();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  if (message) {
    return (
      <div className="space-y-4 border-2 border-foreground p-6">
        <h2 className="text-2xl">Correo enviado</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Volver a iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      method="post"
      onSubmit={handleSubmit((values) => {
        startTransition(async () => {
          const res = await requestPasswordResetAction(values);
          if (res?.message) setMessage(res.message);
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
      <Button type="submit" size="lg" className="w-full" disabled={pending || !mounted}>
        {pending ? 'Enviando…' : 'Enviar enlace'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-semibold text-foreground hover:underline">
          Volver
        </Link>
      </p>
    </form>
  );
}
