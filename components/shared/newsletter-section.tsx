import { NewsletterForm } from '@/components/layout/newsletter-form';

/** Banda de newsletter para la landing. */
export function NewsletterSection() {
  return (
    <section className="border-y-2 border-foreground">
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="kicker text-muted-foreground">Newsletter</p>
          <h2 className="mt-2 text-4xl leading-none md:text-6xl">
            −10% en tu
            <br />
            primera compra
          </h2>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Suscríbete y recibe el cupón de bienvenida, además de acceso
            anticipado a lanzamientos y ofertas exclusivas.
          </p>
          <div className="max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
