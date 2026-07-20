import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { NewsletterForm } from './newsletter-form';
import { siteConfig, socialLinks } from '@/config/site';

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
      { label: 'Envíos', href: '/ayuda/envios' },
      { label: 'Devoluciones', href: '/ayuda/devoluciones' },
      { label: 'Guía de tallas', href: '/ayuda/tallas' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nosotros', href: '/sobre-nosotros' },
      { label: 'Sostenibilidad', href: '/sostenibilidad' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Empleo', href: '/empleo' },
    ],
  },
];

/** Sólo las redes realmente configuradas en `config/site.ts`. */
const social = (
  [
    { label: 'Instagram', href: socialLinks.instagram, Icon: Instagram },
    { label: 'Facebook', href: socialLinks.facebook, Icon: Facebook },
    { label: 'Twitter', href: socialLinks.twitter, Icon: Twitter },
  ] as const
).filter((s): s is typeof s & { href: string } => Boolean(s.href));

const legalNav = [
  { label: 'Términos y condiciones', href: '/legal/terminos' },
  { label: 'Privacidad', href: '/legal/privacidad' },
  { label: 'Tratamiento de datos', href: '/legal/tratamiento-datos' },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6">
        {/* Newsletter */}
        <div className="grid gap-8 border-b border-background/20 pb-12 lg:grid-cols-2 lg:items-end">
          <h2 className="text-4xl leading-none md:text-6xl">
            Únete al
            <br />
            club Átelier
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-background/70">
              Novedades, lanzamientos y ofertas exclusivas en tu correo.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Columnas */}
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          {footerNav.map((col) => (
            <nav key={col.title} className="space-y-4">
              <h3 className="font-display text-xs font-bold tracking-[0.2em] text-background/50 uppercase">
                {col.title}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-background/80 transition-colors hover:text-background"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          {social.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display text-xs font-bold tracking-[0.2em] text-background/50 uppercase">
                Síguenos
              </h3>
              <div className="flex items-center gap-3">
                {social.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="text-background/80 transition-colors hover:text-background"
                  >
                    <Icon className="size-5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wordmark gigante */}
        <Link
          href="/"
          className="block overflow-hidden py-4 text-center select-none"
          aria-label={siteConfig.name}
        >
          <span className="block font-display text-[15vw] leading-[0.8] font-black tracking-[-0.04em] whitespace-nowrap text-background uppercase">
            {siteConfig.name}
          </span>
        </Link>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-6 text-xs text-background/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <nav aria-label="Enlaces legales">
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {legalNav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-background">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
