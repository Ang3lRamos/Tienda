'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { signInWithGoogleAction } from '../actions';

/** Botón de acceso con Google (funciona al activar el proveedor en Supabase). */
export function GoogleButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await signInWithGoogleAction();
          if (res?.error) toast.error(res.error);
        })
      }
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path
          fill="currentColor"
          d="M12 11v2.8h4c-.2 1-1.5 3-4 3-2.4 0-4.4-2-4.4-4.5S9.6 7.8 12 7.8c1.4 0 2.3.6 2.8 1.1l1.9-1.8C15.5 6 13.9 5.3 12 5.3c-3.7 0-6.7 3-6.7 6.7s3 6.7 6.7 6.7c3.9 0 6.4-2.7 6.4-6.6 0-.4 0-.8-.1-1.1H12Z"
        />
      </svg>
      Continuar con Google
    </Button>
  );
}
