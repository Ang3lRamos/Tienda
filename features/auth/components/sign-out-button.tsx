'use client';

import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOutAction } from '../actions';

export function SignOutButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      disabled={pending}
      onClick={() => startTransition(() => void signOutAction())}
    >
      <LogOut className="size-4" />
      {pending ? 'Saliendo…' : 'Cerrar sesión'}
    </Button>
  );
}
