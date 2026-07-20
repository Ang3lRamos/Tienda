'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, Scale, ImageIcon } from 'lucide-react';
import { useCompareStore } from '@/store/compare';
import { useMounted } from '@/hooks/use-mounted';

/**
 * Barra flotante con los productos seleccionados para comparar.
 * Se oculta en flujos enfocados (checkout, cuenta) y en la propia
 * página de comparación.
 */
export function CompareBar() {
  const mounted = useMounted();
  const pathname = usePathname();
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);

  const hidden =
    pathname.startsWith('/comparar') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/admin');

  if (!mounted || hidden || items.length === 0) return null;

  return (
    <>
      {/* Reserva espacio al final de la página para que la barra no tape contenido. */}
      <div aria-hidden className="h-24" />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-foreground bg-background">
        {/* pr-* deja hueco al botón flotante del chat (fixed right-4/6). */}
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 py-3 pr-20 pl-4 sm:gap-4 sm:pr-24 sm:pl-6">
          <Scale className="hidden size-5 shrink-0 sm:block" />

          <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
            {items.map((p) => (
              <li key={p.id} className="relative shrink-0">
                <div className="relative size-12 overflow-hidden bg-muted sm:size-14">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.imageAlt ?? p.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground">
                      <ImageIcon className="size-4" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  aria-label={`Quitar ${p.name} del comparador`}
                  className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-foreground text-background"
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={clear}
            className="hidden shrink-0 text-xs tracking-wide text-muted-foreground uppercase hover:text-foreground sm:block"
          >
            Limpiar
          </button>

          <Link
            href="/comparar"
            className="shrink-0 border-2 border-foreground bg-foreground px-4 py-2.5 font-display text-xs font-bold tracking-[0.12em] text-background uppercase transition-colors hover:bg-transparent hover:text-foreground sm:px-6"
          >
            Comparar ({items.length})
          </Link>
        </div>
      </div>
    </>
  );
}
