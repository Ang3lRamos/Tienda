import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

/**
 * Landing page (placeholder de Fase 0).
 * Las secciones completas (hero, categorías, destacados, ofertas,
 * testimonios, newsletter, FAQ) llegan en la Fase 5.
 */
export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center md:py-28">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-3.5" /> Nueva colección · Otoño 2026
            </span>
            <h1 className="font-serif text-5xl leading-[1.05] md:text-6xl">
              {siteConfig.tagline}
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/catalogo">
                  Explorar catálogo <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/catalogo?ofertas=1">Ver ofertas</Link>
              </Button>
            </div>
          </div>

          <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-gradient-to-br from-secondary to-muted">
            <div className="absolute inset-0 grid place-items-center text-muted-foreground">
              <span className="font-serif text-2xl">Editorial</span>
            </div>
          </div>
        </div>
      </section>

      {/* Estado del proyecto (visible sólo en esta fase de fundaciones) */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-2xl">Fundaciones listas ✅</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Esquema de BD, RLS, autenticación, clientes de Supabase, sistema de
            diseño y arquitectura documentada. El desarrollo continúa por
            módulos según <code>docs/ROADMAP.md</code>.
          </p>
          <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Base de datos + RLS',
              'Autenticación (Supabase)',
              'Sistema de diseño + modo oscuro',
              'Catálogo y filtros',
              'Chatbot IA (OpenRouter)',
              'Panel de administración',
            ].map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-card px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
