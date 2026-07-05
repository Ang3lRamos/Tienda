import Link from 'next/link';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { siteConfig, mainNav } from '@/config/site';

/**
 * Layout de la tienda pública. Navbar y footer definitivos llegan en la
 * Fase 1 (design system + layout). Este es el andamiaje base.
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-serif text-2xl tracking-tight">
            {siteConfig.name}
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto max-w-7xl px-4 text-sm text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} {siteConfig.name}. {siteConfig.tagline}.
        </div>
      </footer>
    </div>
  );
}
