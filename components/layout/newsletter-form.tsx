'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * Formulario de newsletter. En la Fase 4 hará un insert en
 * `newsletter_subscribers` vía Server Action; por ahora valida y avisa.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          toast.error('Introduce un correo válido');
          return;
        }
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setEmail('');
          toast.success('¡Gracias por suscribirte!');
        }, 500);
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
