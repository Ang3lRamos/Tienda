import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, Prose } from '@/components/shared/content-page';
import { getStoreSettings } from '@/features/settings/queries';

export const metadata: Metadata = {
  title: 'Empleo',
  description: 'Trabaja con nosotros: vacantes abiertas y candidaturas espontáneas.',
};

/**
 * Vacantes abiertas. Al dejar la lista vacía, la página invita a enviar una
 * candidatura espontánea en lugar de mostrar una sección vacía.
 */
const openings: { title: string; location: string; type: string; summary: string }[] = [];

export default async function EmpleoPage() {
  const { contactEmail } = await getStoreSettings();

  return (
    <ContentPage
      kicker="Empresa"
      title="Empleo"
      intro="Somos un equipo pequeño. Cuando abrimos una posición, la publicamos aquí."
    >
      {openings.length > 0 ? (
        <ul className="space-y-1">
          {openings.map((job) => (
            <li key={job.title} className="border p-6">
              <h2 className="font-display text-xl font-bold uppercase">{job.title}</h2>
              <p className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
                {job.location} · {job.type}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{job.summary}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-2 border-foreground p-8">
          <h2 className="font-display text-2xl font-bold uppercase">
            No hay vacantes abiertas ahora mismo
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Aun así leemos todas las candidaturas espontáneas y las guardamos para cuando se abra
            una posición que encaje.
          </p>
        </div>
      )}

      <Prose className="mt-12">
        <h2>Enviar tu candidatura</h2>
        <p>
          {contactEmail ? (
            <>
              Escríbenos a <a href={`mailto:${contactEmail}`}>{contactEmail}</a> con el asunto{' '}
              <strong>Candidatura</strong>, tu hoja de vida y un par de líneas sobre qué te
              interesa de nosotros.
            </>
          ) : (
            <>
              Escríbenos desde <Link href="/contacto">Contacto</Link> con el asunto{' '}
              <strong>Candidatura</strong>, tu hoja de vida y un par de líneas sobre qué te
              interesa de nosotros.
            </>
          )}
        </p>
        <p>
          Si tienes portafolio (diseño, fotografía, contenido), inclúyelo: nos dice mucho más que
          una lista de herramientas.
        </p>

        <h2>Cómo tratamos tus datos</h2>
        <p>
          Los datos que nos envíes se usan únicamente para evaluar tu candidatura y se conservan
          como máximo <strong>dos (2) años</strong>, salvo que nos pidas eliminarlos antes. Puedes
          consultar el detalle en nuestra{' '}
          <Link href="/legal/tratamiento-datos">política de tratamiento de datos</Link>.
        </p>
      </Prose>
    </ContentPage>
  );
}
