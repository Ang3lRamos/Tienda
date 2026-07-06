import type { Metadata } from 'next';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { listCustomers } from '@/features/admin/lists';

export const metadata: Metadata = { title: 'Clientes' };

export default async function AdminCustomersPage() {
  const customers = await listCustomers();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl md:text-5xl">Clientes</h1>
      <div className="overflow-x-auto border-2 border-foreground">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-foreground bg-secondary/40 text-left">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-display [&>th]:text-xs [&>th]:font-bold [&>th]:uppercase [&>th]:tracking-wider">
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c.id} className="[&>td]:px-4 [&>td]:py-3">
                <td className="font-bold uppercase">{c.name ?? '—'}</td>
                <td className="text-muted-foreground">{c.email ?? '—'}</td>
                <td className="text-xs uppercase">{c.role ?? 'customer'}</td>
                <td className="text-muted-foreground">
                  {format(new Date(c.createdAt), 'd MMM yyyy', { locale: es })}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Sin clientes aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
