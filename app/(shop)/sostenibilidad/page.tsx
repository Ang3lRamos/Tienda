import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, Prose } from '@/components/shared/content-page';

export const metadata: Metadata = {
  title: 'Sostenibilidad',
  description: 'Nuestros compromisos de producción, materiales y empaque.',
};

export default function SostenibilidadPage() {
  return (
    <ContentPage
      kicker="Empresa"
      title="Sostenibilidad"
      intro="La moda es una industria contaminante y no vamos a fingir lo contrario. Estos son los compromisos concretos que sí podemos sostener."
    >
      <Prose>
        <h2>Producir menos</h2>
        <p>
          La decisión con más impacto es sencilla: fabricar menos prendas. Trabajamos con series
          cortas y reponemos según la demanda real, en lugar de llenar bodega con inventario que
          acaba destruido o rematado. Menos sobreproducción es menos desperdicio.
        </p>

        <h2>Materiales</h2>
        <ul>
          <li>Priorizamos algodón, lino y fibras naturales frente a las sintéticas.</li>
          <li>
            Publicamos la composición completa en la ficha de cada producto, incluso cuando lleva
            mezcla sintética.
          </li>
          <li>
            Evitamos los acabados y tintes con mayor carga química siempre que exista alternativa.
          </li>
        </ul>

        <h2>Talleres</h2>
        <p>
          Producimos con talleres colombianos pequeños, con los que tenemos trato directo y
          visitamos con regularidad. No trabajamos con intermediarios que nos impidan saber quién
          cose nuestra ropa ni en qué condiciones.
        </p>

        <h2>Empaque</h2>
        <ul>
          <li>Enviamos en cajas y bolsas de papel reciclado, sin plástico de un solo uso.</li>
          <li>Sin relleno innecesario: la caja se ajusta al tamaño del pedido.</li>
          <li>Las facturas van en formato digital, salvo que pidas una copia impresa.</li>
        </ul>

        <h2>Cuidar lo que ya tienes</h2>
        <p>
          Una prenda que dura el doble contamina la mitad. Cada ficha incluye instrucciones de
          cuidado, y la regla general es la de siempre: lavar menos, a baja temperatura, y secar al
          aire.
        </p>

        <h2>Lo que todavía no hacemos</h2>
        <p>
          No compensamos la huella de carbono de los envíos, no tenemos aún un programa de
          recogida de prendas usadas y parte de nuestra materia prima es importada. Preferimos
          decirlo a colgarnos etiquetas que no sostenemos. Si quieres proponernos algo,{' '}
          <Link href="/contacto">escríbenos</Link>.
        </p>
      </Prose>
    </ContentPage>
  );
}
