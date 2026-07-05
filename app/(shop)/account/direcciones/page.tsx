import type { Metadata } from 'next';
import { MapPin } from 'lucide-react';

export const metadata: Metadata = { title: 'Mis direcciones' };

export default function DireccionesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl">Mis direcciones</h2>
      <div className="flex flex-col items-center gap-4 border-2 border-dashed border-border px-6 py-16 text-center">
        <MapPin className="size-8 text-muted-foreground" />
        <p className="max-w-sm text-sm text-muted-foreground">
          Aquí podrás guardar tus direcciones de envío. La gestión de direcciones
          se habilita junto con el checkout.
        </p>
      </div>
    </div>
  );
}
