'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

/**
 * Escucha inserciones en `orders` vía Supabase Realtime y avisa al admin.
 * Requiere habilitar Realtime en la tabla `orders`
 * (Supabase → Database → Replication → activar `orders`).
 */
export function RealtimeOrders() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        () => {
          toast.success('Nuevo pedido recibido', { description: 'Se actualizó la lista.' });
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
