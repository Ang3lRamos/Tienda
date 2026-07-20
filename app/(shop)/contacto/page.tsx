import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Phone, Clock } from 'lucide-react';
import { ContentPage, Prose } from '@/components/shared/content-page';
import { getStoreSettings } from '@/features/settings/queries';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Escríbenos: resolvemos dudas sobre pedidos, tallas, envíos y devoluciones.',
};

export default async function ContactoPage() {
  const settings = await getStoreSettings();
  const { contactEmail, contactPhone } = settings;

  return (
    <ContentPage
      kicker="Empresa"
      title="Contacto"
      intro="¿Dudas con un pedido, una talla o una devolución? Escríbenos y te respondemos."
    >
      {contactEmail || contactPhone ? (
        <div className="grid gap-1 sm:grid-cols-2">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="group border p-6 transition-colors hover:bg-foreground hover:text-background"
            >
              <Mail className="size-6" aria-hidden />
              <h2 className="mt-4 font-display text-lg font-bold uppercase">Correo</h2>
              <p className="mt-1 text-sm break-all opacity-80">{contactEmail}</p>
            </a>
          )}
          {contactPhone && (
            <a
              href={`tel:${contactPhone.replace(/\s+/g, '')}`}
              className="group border p-6 transition-colors hover:bg-foreground hover:text-background"
            >
              <Phone className="size-6" aria-hidden />
              <h2 className="mt-4 font-display text-lg font-bold uppercase">Teléfono</h2>
              <p className="mt-1 text-sm opacity-80">{contactPhone}</p>
            </a>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed p-6 text-sm text-muted-foreground">
          Todavía no hay datos de contacto configurados. Un administrador puede añadirlos en{' '}
          <strong className="text-foreground">Panel → Configuración</strong>.
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 border p-6 text-sm">
        <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <div>
          <h2 className="font-display font-bold uppercase">Horario de atención</h2>
          <p className="mt-1 text-muted-foreground">
            Lunes a viernes, de 8:00 a. m. a 6:00 p. m. (hora de Colombia). Sábados de 9:00 a. m. a
            1:00 p. m. Respondemos los correos en un plazo máximo de 24 horas hábiles.
          </p>
        </div>
      </div>

      <Prose className="mt-12">
        <h2>Antes de escribir</h2>
        <p>Puede que la respuesta ya esté aquí y te ahorres la espera:</p>
        <ul>
          <li>
            Estado de tu compra: <Link href="/account/pedidos">Mis pedidos</Link>.
          </li>
          <li>
            Costos y plazos de entrega: <Link href="/ayuda/envios">Envíos</Link>.
          </li>
          <li>
            Cómo devolver una prenda: <Link href="/ayuda/devoluciones">Devoluciones</Link>.
          </li>
          <li>
            Cómo elegir la talla: <Link href="/ayuda/tallas">Guía de tallas</Link>.
          </li>
        </ul>
        <p>
          Si escribes por un pedido concreto, incluye el <strong>número de pedido</strong>: nos
          permite responderte en el primer correo, sin ida y vuelta.
        </p>
      </Prose>
    </ContentPage>
  );
}
