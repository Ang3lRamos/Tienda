import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createServerSupabase } from '@/lib/supabase/server';
import { getAccountProfile, getCurrentRole } from '@/features/account/queries';

export const metadata: Metadata = { title: 'Perfil' };

export default async function AccountPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/account');

  const profile = await getAccountProfile(user.id);
  const roleName = await getCurrentRole();

  // El rol se usa solo para decidir si mostrar el acceso al panel; NO se muestra al cliente.
  const rows = [
    { label: 'Nombre', value: profile?.full_name ?? '—' },
    { label: 'Correo', value: profile?.email ?? user.email ?? '—' },
    { label: 'Teléfono', value: profile?.phone ?? '—' },
    {
      label: 'Miembro desde',
      value: profile?.created_at
        ? format(new Date(profile.created_at), "d 'de' MMMM yyyy", { locale: es })
        : '—',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl">Hola, {profile?.full_name?.split(' ')[0] ?? 'bienvenido'}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona tu información personal y revisa tu actividad.
        </p>
      </div>

      <dl className="divide-y-2 divide-border border-2 border-foreground">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4"
          >
            <dt className="font-display text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
              {row.label}
            </dt>
            <dd className="text-sm break-words sm:col-span-2">{row.value}</dd>
          </div>
        ))}
      </dl>

      {(roleName === 'admin' || roleName === 'staff') && (
        <a
          href="/admin"
          className="inline-flex items-center border-2 border-foreground bg-foreground px-6 py-3 font-display text-xs font-bold tracking-[0.12em] text-background uppercase transition-colors hover:bg-transparent hover:text-foreground"
        >
          Ir al panel de administración
        </a>
      )}
    </div>
  );
}
