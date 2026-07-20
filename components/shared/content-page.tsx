import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContentPageProps {
  /** Texto pequeño en versalitas sobre el título. */
  kicker: string;
  title: string;
  /** Entradilla opcional bajo el título. */
  intro?: string;
  /** Fecha de última actualización (páginas legales). */
  updatedAt?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Maqueta común de las páginas de contenido (ayuda, empresa y legales):
 * cabecera editorial + columna de texto legible.
 */
export function ContentPage({
  kicker,
  title,
  intro,
  updatedAt,
  children,
  className,
}: ContentPageProps) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6">
      <header className="mb-10 border-b pb-10">
        <p className="kicker text-muted-foreground">{kicker}</p>
        <h1 className="mt-2 text-5xl md:text-7xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
        {updatedAt && (
          <p className="mt-5 text-xs tracking-wide text-muted-foreground uppercase">
            Última actualización: {updatedAt}
          </p>
        )}
      </header>

      <div className={cn('max-w-3xl', className)}>{children}</div>
    </div>
  );
}

/**
 * Columna de texto con ritmo vertical y jerarquía tipográfica aplicados a los
 * hijos, para escribir el contenido con HTML plano.
 */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'space-y-6 text-[15px] leading-relaxed text-muted-foreground',
        '[&_h2]:font-display [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:uppercase [&_h2]:first:mt-0',
        '[&_h3]:mt-8 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:tracking-wide [&_h3]:text-foreground [&_h3]:uppercase',
        '[&_strong]:font-semibold [&_strong]:text-foreground',
        '[&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4',
        '[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5',
        '[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5',
        className,
      )}
    >
      {children}
    </div>
  );
}
