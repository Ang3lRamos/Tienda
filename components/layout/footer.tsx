import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { NewsletterForm } from './newsletter-form';
import { siteConfig } from '@/config/site';

const footerNav = [
  {
    title: 'Tienda',
    links: [
      { label: 'Novedades', href: '/catalogo?sort=nuevos' },
      { label: 'Mujer', href: '/catalogo?gender=women' },
      { label: 'Hombre', href: '/catalogo?gender=men' },
      { label: 'Ofertas', href: '/catalogo?ofertas=1' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { label: 'Envíos y entregas', href: '/ayuda/envios' },
      { label: 'Cambios y devoluciones', href: '/ayuda/devoluciones' },
      { label: 'Guía de tallas', href: '/ayuda/tallas' },
      { label: 'Preguntas frecuentes', href: '/#faq' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nosotros', href: '/sobre-nosotros' },
      { label: 'Sostenibilidad', href: '/sostenibilidad' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Trabaja con nosotros', href: '/empleo' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Marca + newsletter */}
          <div className="space-y-4">
            <Link href="/" className="font-serif text-2xl">
              {siteConfig.name}
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              Suscríbete y recibe novedades, lanzamientos y ofertas exclusivas.
            </p>
            <NewsletterForm />
          </div>

          {/* Columnas de enlaces */}
          {footerNav.map((col) => (
            <nav key={col.title} className="space-y-3">
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" aria-label="Instagram" className="hover:text-foreground">
              <Instagram className="size-5" />
            </Link>
            <Link href="#" aria-label="Facebook" className="hover:text-foreground">
              <Facebook className="size-5" />
            </Link>
            <Link href="#" aria-label="Twitter" className="hover:text-foreground">
              <Twitter className="size-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
