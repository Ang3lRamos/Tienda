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
      {/* Móvil: tarjetas apiladas */}
      {customers.length === 0 ? (
        <p className="text-sm text-muted-foreground md:hidden">Sin clientes aún.</p>
      ) : (
        <ul className="space-y-3 md:hidden">
          {customers.map((c) => (
            <li key={c.id} className="space-y-1 border-2 border-foreground p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-display text-sm font-bold uppercase break-words">
                  {c.name ?? '—'}
                </p>
                <span className="shrink-0 border-2 border-border px-2 py-0.5 text-[0.65rem] font-bold uppercase">
                  {c.role ?? 'customer'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground break-all">{c.email ?? '—'}</p>
              <p className="text-xs text-muted-foreground">
                Registro: {format(new Date(c.createdAt), 'd MMM yyyy', { locale: es })}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Escritorio: tabla completa */}
      <div className="hidden overflow-x-auto border-2 border-foreground md:block">
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
