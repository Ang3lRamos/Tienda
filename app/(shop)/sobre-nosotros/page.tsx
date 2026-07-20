import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, Prose } from '@/components/shared/content-page';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Sobre nosotros',
  description: `Qué es ${siteConfig.name} y cómo trabajamos.`,
};

const pillars = [
  {
    title: 'Colecciones cortas',
    body: 'Producimos poco y bien. Preferimos agotar una prenda a llenar una bodega con saldos que terminan rebajados.',
  },
  {
    title: 'Materiales honestos',
    body: 'Fichas claras: composición, origen y cuidados. Si una prenda lleva mezcla sintética, lo decimos.',
  },
  {
    title: 'Precio sin teatro',
    body: 'Sin precios inflados para simular descuentos. Lo que ves es lo que vale.',
  },
];

export default function SobreNosotrosPage() {
  return (
    <ContentPage
      kicker="Empresa"
      title="Sobre nosotros"
      intro={`${siteConfig.name} es una tienda de moda colombiana: colecciones cuidadas, pocas prendas y ninguna prisa por seguir la tendencia de la semana.`}
    >
      <Prose>
        <h2>Cómo empezamos</h2>
        <p>
          Nacimos de una molestia sencilla: comprar ropa en línea suele ser un ejercicio de fe. Las
          fotos no coinciden con la prenda, las tallas cambian según la marca y las fichas técnicas
          dicen poco. Quisimos montar lo contrario: una tienda donde la información sea suficiente
          para decidir sin adivinar.
        </p>

        <h2>En qué creemos</h2>
      </Prose>

      <div className="mt-8 grid gap-1 sm:grid-cols-3">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="border p-6">
            <h3 className="font-display text-lg font-bold uppercase">{pillar.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
          </article>
        ))}
      </div>

      <Prose className="mt-12">
        <h2>Cómo trabajamos</h2>
        <p>
          Diseñamos en Colombia y producimos con talleres pequeños con los que mantenemos una
          relación directa. Eso nos permite pedir series cortas, revisar la calidad de cerca y
          reponer solo lo que de verdad se vende. Puedes leer más en{' '}
          <Link href="/sostenibilidad">Sostenibilidad</Link>.
        </p>

        <h2>Hablemos</h2>
        <p>
          Si tienes una duda, una queja o una propuesta, escríbenos desde{' '}
          <Link href="/contacto">Contacto</Link>. Si lo que buscas es trabajar con nosotros, mira
          las <Link href="/empleo">vacantes</Link>.
        </p>
      </Prose>
    </ContentPage>
  );
}
