import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/features/auth/components/login-form';
import { createServerSupabase } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Iniciar sesión' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(redirectTo || '/account');

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl">Bienvenido</h1>
        <p className="text-sm text-muted-foreground">
          Inicia sesión para continuar.
        </p>
      </div>
      <LoginForm redirectTo={redirectTo || '/account'} />
    </div>
  );
}
