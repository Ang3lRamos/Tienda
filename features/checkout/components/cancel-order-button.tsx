'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cancelOrderAction } from '@/features/checkout/actions';

export function CancelOrderButton({ orderNumber }: { orderNumber: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onCancel() {
    if (!confirm('¿Seguro que quieres cancelar este pedido?')) return;
    startTransition(async () => {
      const res = await cancelOrderAction(orderNumber);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Pedido cancelado.');
      router.refresh();
    });
  }

  return (
    <Button variant="outline" onClick={onCancel} disabled={pending} className="flex-1">
      {pending ? 'Cancelando…' : 'Cancelar pedido'}
    </Button>
  );
}
