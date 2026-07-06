'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { togglePromotion } from '../actions';
import { cn } from '@/lib/utils';

export function PromotionToggle({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await togglePromotion(id, !active);
          if (res.error) toast.error(res.error);
          else toast.success(active ? 'Desactivada' : 'Activada');
        })
      }
      className={cn(
        'border-2 border-foreground px-3 py-1 text-[0.65rem] font-bold uppercase transition-colors disabled:opacity-50',
        active ? 'bg-foreground text-background' : 'bg-transparent',
      )}
    >
      {active ? 'Activa' : 'Inactiva'}
    </button>
  );
}
