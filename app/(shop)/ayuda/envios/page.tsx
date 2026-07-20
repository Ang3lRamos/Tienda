import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, Prose } from '@/components/shared/content-page';
import { getStoreSettings } from '@/features/settings/queries';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Envíos',
  description: 'Costos, plazos y cobertura de los envíos de Átelier en Colombia.',
};

export default async function EnviosPage() {
  const settings = await getStoreSettings();

  return (
    <ContentPage
      kicker="Ayuda"
      title="Envíos"
      intro="Enviamos a todo el territorio nacional. Aquí tienes los costos, los plazos y cómo seguir tu pedido."
    >
      <Prose>
        <h2>Costo del envío</h2>
        <p>
          El envío cuesta <strong>{formatPrice(settings.shippingCost)}</strong> a cualquier
          dirección del país.{' '}
          {settings.freeShippingThreshold > 0 && (
            <>
              Los pedidos iguales o superiores a{' '}
              <strong>{formatPrice(settings.freeShippingThreshold)}</strong> tienen{' '}
              <strong>envío gratis</strong>, y el descuento se aplica solo al llegar al total del
              carrito.
            </>
          )}
        </p>
        <p>
          El valor definitivo siempre se muestra en el resumen del checkout antes de confirmar el
          pago, así que nunca hay cargos sorpresa al final.
        </p>

        <h2>Plazos de entrega</h2>
        <p>
          Preparamos los pedidos en un plazo de <strong>1 a 2 días hábiles</strong>. A partir de
          ahí, el tiempo de tránsito depende del destino:
        </p>
        <ul>
          <li>
            <strong>Ciudades principales</strong> (Bogotá, Medellín, Cali, Barranquilla,
            Bucaramanga y Cartagena): de 2 a 4 días hábiles.
          </li>
          <li>
            <strong>Ciudades intermedias y cabeceras municipales</strong>: de 4 a 7 días hábiles.
          </li>
          <li>
            <strong>Zonas rurales y de difícil acceso</strong>: de 7 a 10 días hábiles.
          </li>
        </ul>
        <p>
          Los pedidos confirmados después de las 2:00 p. m., los fines de semana o los festivos
          empiezan a procesarse el siguiente día hábil.
        </p>

        <h2>Seguimiento del pedido</h2>
        <p>
          Puedes consultar el estado de tu compra en cualquier momento desde{' '}
          <Link href="/account/pedidos">Mis pedidos</Link>, dentro de tu cuenta. Ahí verás si el
          pedido está pendiente, en preparación, enviado o entregado.
        </p>

        <h2>Si algo sale mal</h2>
        <p>
          Si el pedido llega incompleto, dañado o con un producto distinto al que compraste,
          escríbenos desde <Link href="/contacto">Contacto</Link> dentro de los cinco días
          siguientes a la entrega y lo resolvemos. Si lo que quieres es devolverlo, revisa{' '}
          <Link href="/ayuda/devoluciones">Devoluciones</Link>.
        </p>
      </Prose>
    </ContentPage>
  );
}
