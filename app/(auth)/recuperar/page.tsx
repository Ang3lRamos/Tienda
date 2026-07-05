import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export const metadata: Metadata = { title: 'Recuperar contraseña' };

export default function RecuperarPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl">¿Olvidaste tu clave?</h1>
        <p className="text-sm text-muted-foreground">
          Te enviaremos un enlace para restablecerla.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
