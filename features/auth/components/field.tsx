'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

/** Campo etiqueta + input + error, compatible con register() de RHF. */
export const Field = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & { label: string; error?: string; id: string }
>(function Field({ label, error, id, ...props }, ref) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        ref={ref}
        aria-invalid={!!error}
        className="h-11 rounded-none border-2"
        {...props}
      />
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
});
