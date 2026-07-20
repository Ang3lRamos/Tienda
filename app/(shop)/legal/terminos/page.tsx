import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, Prose } from '@/components/shared/content-page';
import { LegalPendingNotice } from '@/components/shared/legal-pending-notice';
import { legalConfig } from '@/config/legal';
import { siteConfig } from '@/config/site';
import { getStoreSettings } from '@/features/settings/queries';

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: `Condiciones de uso y de compra en ${siteConfig.name}.`,
};

export default async function TerminosPage() {
  const { contactEmail } = await getStoreSettings();

  return (
    <ContentPage kicker="Legal" title="Términos y condiciones" updatedAt={legalConfig.lastUpdated}>
      <LegalPendingNotice />

      <Prose>
        <h2>1. Identificación del responsable</h2>
        <p>
          Este sitio es operado por <strong>{legalConfig.legalName}</strong>, identificada con NIT{' '}
          <strong>{legalConfig.taxId}</strong>, con domicilio en {legalConfig.address},{' '}
          {legalConfig.city}
          {contactEmail && (
            <>
              . Correo de contacto: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </>
          )}
          .
        </p>

        <h2>2. Objeto y aceptación</h2>
        <p>
          Estos términos regulan el acceso al sitio y la compra de productos en {siteConfig.name}.
          Al navegar por la tienda, crear una cuenta o realizar un pedido, aceptas estas
          condiciones en su totalidad. Si no estás de acuerdo con alguna de ellas, no utilices el
          sitio.
        </p>
        <p>
          Podemos actualizar estos términos en cualquier momento. La versión vigente es siempre la
          publicada en esta página, con su fecha de última actualización. Los pedidos ya realizados
          se rigen por la versión vigente en el momento de la compra.
        </p>

        <h2>3. Cuenta de usuario</h2>
        <p>
          Para comprar necesitas crear una cuenta con datos veraces y actualizados. Eres
          responsable de la confidencialidad de tu contraseña y de la actividad realizada desde tu
          cuenta. Avísanos de inmediato si detectas un uso no autorizado.
        </p>
        <p>
          Podemos suspender o cancelar cuentas que incumplan estos términos, suministren
          información falsa o se usen con fines fraudulentos.
        </p>

        <h2>4. Productos, precios y disponibilidad</h2>
        <ul>
          <li>
            Todos los precios se expresan en <strong>pesos colombianos (COP)</strong> e incluyen
            los impuestos aplicables, salvo que se indique lo contrario en el resumen del pedido.
          </li>
          <li>
            Las fotografías son orientativas: pueden existir variaciones de color según la
            pantalla desde la que las veas.
          </li>
          <li>
            La disponibilidad se calcula sobre el inventario real. Si un producto se agota después
            de confirmar tu pedido, te avisamos y te reembolsamos el importe correspondiente.
          </li>
          <li>
            Podemos modificar precios en cualquier momento, pero el precio aplicable es siempre el
            mostrado al confirmar el pedido.
          </li>
        </ul>
        <p>
          Si por un error evidente se publica un precio manifiestamente equivocado, podremos anular
          el pedido e informarte, reembolsando la totalidad de lo pagado.
        </p>

        <h2>5. Proceso de compra</h2>
        <p>
          El pedido se perfecciona cuando confirmas la compra y recibes la confirmación
          correspondiente. Antes de ese momento puedes revisar y modificar el contenido del
          carrito, la dirección de envío y el método de pago.
        </p>
        <p>
          Nos reservamos el derecho de rechazar pedidos cuando existan indicios razonables de
          fraude, error en los datos de entrega o incumplimiento de estas condiciones.
        </p>

        <h2>6. Medios de pago</h2>
        <p>
          Aceptamos los medios de pago habilitados en el checkout, incluido el pago contra entrega
          y, cuando esté disponible, la financiación a través de proveedores externos. El
          tratamiento de los datos de pago se rige por las políticas de cada proveedor; nosotros no
          almacenamos los datos completos de tus tarjetas.
        </p>

        <h2>7. Envíos</h2>
        <p>
          Los costos, plazos y cobertura se detallan en <Link href="/ayuda/envios">Envíos</Link>.
          Los plazos indicados son estimados y se cuentan en días hábiles: no incluyen demoras
          atribuibles a la transportadora, a causas de fuerza mayor o a datos de entrega
          incorrectos.
        </p>

        <h2>8. Derecho de retracto y devoluciones</h2>
        <p>
          Conforme al artículo 47 de la Ley 1480 de 2011, tienes <strong>cinco (5) días
          hábiles</strong> desde la entrega para ejercer el derecho de retracto. El procedimiento,
          las condiciones del producto y los plazos de reembolso se detallan en{' '}
          <Link href="/ayuda/devoluciones">Devoluciones</Link>.
        </p>

        <h2>9. Garantía legal</h2>
        <p>
          Todos los productos cuentan con la garantía legal de calidad e idoneidad prevista en el
          Estatuto del Consumidor. Ante un defecto de fabricación puedes solicitar la reparación,
          el cambio o la devolución del dinero, en los términos de la ley. La garantía no cubre el
          desgaste natural por el uso, ni los daños derivados de un uso indebido o del
          incumplimiento de las instrucciones de cuidado.
        </p>

        <h2>10. Propiedad intelectual</h2>
        <p>
          Las marcas, los textos, las fotografías, el diseño del sitio y el resto de contenidos son
          propiedad de {legalConfig.legalName} o de sus licenciantes, y están protegidos por la
          normativa de propiedad intelectual. No está permitida su reproducción o explotación sin
          autorización previa y escrita.
        </p>

        <h2>11. Contenido de los usuarios</h2>
        <p>
          Al publicar una reseña nos concedes una licencia no exclusiva para mostrarla en el sitio.
          Eres responsable de su contenido. Podemos moderar o retirar reseñas que contengan
          lenguaje ofensivo, datos personales de terceros, publicidad o información
          manifiestamente falsa.
        </p>

        <h2>12. Limitación de responsabilidad</h2>
        <p>
          Procuramos que el sitio esté disponible de forma continua y que su información sea
          exacta, pero no garantizamos la ausencia de interrupciones o errores. No respondemos por
          daños indirectos derivados del uso del sitio, sin que ello limite los derechos que la ley
          reconoce a los consumidores.
        </p>

        <h2>13. Protección de datos personales</h2>
        <p>
          El tratamiento de tus datos se rige por nuestra{' '}
          <Link href="/legal/privacidad">política de privacidad</Link> y por la{' '}
          <Link href="/legal/tratamiento-datos">política de tratamiento de datos personales</Link>.
        </p>

        <h2>14. Ley aplicable y controversias</h2>
        <p>
          Estos términos se rigen por la legislación colombiana. Cualquier controversia se someterá
          a los jueces competentes de {legalConfig.city}. Antes de acudir a la vía judicial puedes
          presentar tu reclamación por los canales indicados en{' '}
          <Link href="/contacto">Contacto</Link>, o ante la Superintendencia de Industria y
          Comercio.
        </p>
      </Prose>
    </ContentPage>
  );
}
