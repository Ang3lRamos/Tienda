'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const searchParams = useSearchParams();
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    return `/catalogo?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Paginación">
      <PageLink disabled={page <= 1} href={hrefFor(page - 1)} aria-label="Anterior">
        <ChevronLeft className="size-4" />
      </PageLink>
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const gap = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {gap && <span className="px-1 text-muted-foreground">…</span>}
            <PageLink href={hrefFor(p)} active={p === page}>
              {p}
            </PageLink>
          </span>
        );
      })}
      <PageLink disabled={page >= totalPages} href={hrefFor(page + 1)} aria-label="Siguiente">
        <ChevronRight className="size-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...props
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.ComponentProps<typeof Link>) {
  const cls = cn(
    'grid h-10 min-w-10 place-items-center border-2 px-2 text-sm font-bold transition-colors',
    active
      ? 'border-foreground bg-foreground text-background'
      : 'border-border hover:border-foreground',
    disabled && 'pointer-events-none opacity-40',
  );
  if (disabled) return <span className={cls}>{children}</span>;
  return (
    <Link href={href} className={cls} {...props}>
      {children}
    </Link>
  );
}
