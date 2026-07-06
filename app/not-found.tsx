import Link from 'next/link';
import { siteConfig } from '@/config/site';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="font-display text-2xl font-black tracking-[-0.04em] uppercase">
        {siteConfig.name}
      </Link>
      <p className="display-xxl mt-6 text-[22vw] leading-none md:text-[12rem]">404</p>
      <h1 className="mt-2 text-2xl">Página no encontrada</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center border-2 border-foreground px-8 py-3 font-display text-xs font-bold tracking-[0.12em] uppercase transition-colors hover:bg-foreground hover:text-background"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
