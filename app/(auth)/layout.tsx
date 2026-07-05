import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/site';

/** Layout de autenticación: panel editorial B&N + área de formulario. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Panel editorial (desktop) */}
      <div className="relative hidden overflow-hidden bg-foreground lg:block">
        <Image
          src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200"
          alt="Editorial de moda"
          fill
          sizes="50vw"
          className="object-cover opacity-70 grayscale"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 to-black/10" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-background">
          <Link
            href="/"
            className="font-display text-2xl font-black tracking-[-0.04em] uppercase"
          >
            {siteConfig.name}
          </Link>
          <div>
            <p className="kicker mb-3 text-background/70">Miembros</p>
            <h2 className="text-5xl leading-none text-background">
              Tu estilo,
              <br />
              tu colección.
            </h2>
          </div>
        </div>
      </div>

      {/* Área de formulario */}
      <div className="flex flex-col">
        <header className="flex items-center justify-between px-6 py-6 lg:hidden">
          <Link
            href="/"
            className="font-display text-xl font-black tracking-[-0.04em] uppercase"
          >
            {siteConfig.name}
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
