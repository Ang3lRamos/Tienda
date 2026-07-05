import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/features/auth/components/register-form';
import { createServerSupabase } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Crear cuenta' };

export default async function RegisterPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect('/account');

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl">Crea tu cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Únete a Átelier y guarda tus favoritos y pedidos.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
