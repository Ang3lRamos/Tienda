import type { Metadata } from 'next';
import { UpdatePasswordForm } from '@/features/auth/components/update-password-form';

export const metadata: Metadata = { title: 'Actualizar contraseña' };

export default function ActualizarClavePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl">Nueva contraseña</h1>
        <p className="text-sm text-muted-foreground">
          Define una contraseña nueva para tu cuenta.
        </p>
      </div>
      <UpdatePasswordForm />
    </div>
  );
}
