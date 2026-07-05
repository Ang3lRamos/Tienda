'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { subscribeNewsletter } from '@/features/newsletter/actions';

/** Formulario de newsletter: inserta en `newsletter_subscribers` (Server Action). */
export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          toast.error('Introduce un correo válido');
          return;
        }
        startTransition(async () => {
          const res = await subscribeNewsletter(email);
          if (res.error) {
            toast.error(res.error);
          } else {
            setEmail('');
            toast.success('¡Gracias por suscribirte!');
          }
        });
      }}
      className="flex gap-2"
    >
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@correo.com"
        aria-label="Correo electrónico"
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Enviando…' : 'Suscribir'}
      </Button>
    </form>
  );
}
