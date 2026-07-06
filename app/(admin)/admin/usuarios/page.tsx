import type { Metadata } from 'next';
import { listCustomers } from '@/features/admin/lists';
import { UserRoleSelect } from '@/features/admin/components/user-role-select';

export const metadata: Metadata = { title: 'Usuarios' };

export default async function AdminUsersPage() {
  const users = await listCustomers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl md:text-5xl">Usuarios y roles</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Asigna roles. <strong>customer</strong> = cliente, <strong>staff</strong> = operación,
          <strong> admin</strong> = acceso total. Solo un admin puede cambiar roles.
        </p>
      </div>
      <div className="overflow-x-auto border-2 border-foreground">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-foreground bg-secondary/40 text-left">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-display [&>th]:text-xs [&>th]:font-bold [&>th]:uppercase [&>th]:tracking-wider">
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="[&>td]:px-4 [&>td]:py-3">
                <td className="font-bold uppercase">{u.name ?? '—'}</td>
                <td className="text-muted-foreground">{u.email ?? '—'}</td>
                <td>
                  <UserRoleSelect userId={u.id} role={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
