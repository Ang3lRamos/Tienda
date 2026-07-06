'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aquí podría enviarse a un servicio de observabilidad.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <h1 className="text-4xl">Algo salió mal</h1>
      <p className="mt-2 text-muted-foreground">
        Ocurrió un error inesperado. Puedes intentarlo de nuevo.
      </p>
      <div className="mt-8 flex gap-3">
        <Button size="lg" onClick={reset}>
          Reintentar
        </Button>
        <Button size="lg" variant="outline" onClick={() => (window.location.href = '/')}>
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}
