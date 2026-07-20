import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, Prose } from '@/components/shared/content-page';

export const metadata: Metadata = {
  title: 'Devoluciones',
  description: 'Cómo devolver o cambiar un producto comprado en Átelier.',
};

export default function DevolucionesPage() {
  return (
    <ContentPage
      kicker="Ayuda"
      title="Devoluciones"
      intro="Si algo no te queda como esperabas, puedes devolverlo. Así funciona el proceso."
    >
      <Prose>
        <h2>Derecho de retracto</h2>
        <p>
          Como toda compra hecha por internet en Colombia, tienes{' '}
          <strong>cinco (5) días hábiles</strong> desde que recibes el pedido para retractarte, sin
          necesidad de justificar el motivo. Es un derecho reconocido por el artículo 47 del
          Estatuto del Consumidor (Ley 1480 de 2011).
        </p>
        <p>
          Al ejercer el retracto te devolvemos el <strong>valor total pagado</strong>, incluido el
          envío. El costo de devolver el producto corre por tu cuenta, salvo que la devolución se
          deba a un error nuestro o a un defecto del artículo.
        </p>

        <h2>Condiciones del producto</h2>
        <p>Para aceptar la devolución, la prenda debe volver:</p>
        <ul>
          <li>Sin usar ni lavar, y sin olores, manchas ni señales de desgaste.</li>
          <li>Con todas sus etiquetas originales puestas.</li>
          <li>En su empaque original, cuando lo tenga.</li>
        </ul>
        <p>
          Por razones de higiene, la <strong>ropa interior</strong> y los{' '}
          <strong>trajes de baño</strong> solo se aceptan si conservan intacto el precinto
          sanitario.
        </p>

        <h2>Cómo iniciar la devolución</h2>
        <ol>
          <li>
            Escríbenos desde <Link href="/contacto">Contacto</Link> con tu número de pedido y los
            artículos que quieres devolver.
          </li>
          <li>Te respondemos con la guía de devolución y la dirección de recepción.</li>
          <li>Empaca los productos y entrégalos a la transportadora indicada.</li>
          <li>Al recibirlos, revisamos su estado en un plazo máximo de 3 días hábiles.</li>
        </ol>

        <h2>Reembolsos</h2>
        <p>
          Una vez aprobada la devolución, el reembolso se hace por el mismo medio de pago que
          usaste. El dinero suele reflejarse en un plazo de{' '}
          <strong>hasta treinta (30) días calendario</strong>, aunque el tiempo exacto depende de
          tu banco o de la entidad financiera.
        </p>
        <p>
          Si pagaste contra entrega, te pediremos los datos de una cuenta bancaria a tu nombre para
          hacer la transferencia.
        </p>

        <h2>Cambios de talla o color</h2>
        <p>
          No hacemos cambios directos: el proceso es devolver el producto y hacer un pedido nuevo
          con la talla o el color que quieres. Así te aseguras de que la prenda que necesitas
          todavía tenga existencias, en vez de quedar a la espera. Si dudas con la talla, mira
          antes nuestra <Link href="/ayuda/tallas">guía de tallas</Link>.
        </p>

        <h2>Garantía por defectos</h2>
        <p>
          Además del retracto, todos los productos tienen la{' '}
          <strong>garantía legal de calidad e idoneidad</strong>. Si una prenda presenta un defecto
          de fabricación, escríbenos y la reparamos, la cambiamos o te devolvemos el dinero, según
          lo que corresponda. Puedes consultar el detalle en nuestros{' '}
          <Link href="/legal/terminos">términos y condiciones</Link>.
        </p>
      </Prose>
    </ContentPage>
  );
}
