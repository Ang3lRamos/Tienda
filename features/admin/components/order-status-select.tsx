'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { updateOrderStatus } from '../actions';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export function OrderStatusSelect({
  orderNumber,
  status,
}: {
  orderNumber: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(async () => {
          const res = await updateOrderStatus(orderNumber, e.target.value);
          if (res.error) toast.error(res.error);
          else toast.success('Estado actualizado');
        })
      }
      className="h-9 border-2 border-foreground bg-background px-2 text-xs font-bold uppercase outline-none disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
