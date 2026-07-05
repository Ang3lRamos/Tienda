'use client';

import { Toaster } from 'sonner';
import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';

/** Envuelve la app con tema (claro/oscuro), caché de datos y notificaciones. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </QueryProvider>
    </ThemeProvider>
  );
}
