'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { setUserRole } from '../actions';

const ROLES = ['customer', 'staff', 'admin'];

export function UserRoleSelect({ userId, role }: { userId: string; role: string | null }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      defaultValue={role ?? 'customer'}
      disabled={pending}
      onChange={(e) =>
        startTransition(async () => {
          const res = await setUserRole(userId, e.target.value);
          if (res.error) toast.error(res.error);
          else toast.success('Rol actualizado');
        })
      }
      className="h-9 border-2 border-foreground bg-background px-2 text-xs font-bold uppercase outline-none disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
