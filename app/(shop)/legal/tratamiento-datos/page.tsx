import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, Prose } from '@/components/shared/content-page';
import { LegalPendingNotice } from '@/components/shared/legal-pending-notice';
import { legalConfig } from '@/config/legal';
import { siteConfig } from '@/config/site';
import { getStoreSettings } from '@/features/settings/queries';

export const metadata: Metadata = {
  title: 'Política de tratamiento de datos personales',
  description: `Política de tratamiento de datos personales de ${siteConfig.name} conforme a la Ley 1581 de 2012.`,
};

export default async function TratamientoDatosPage() {
  const { contactEmail } = await getStoreSettings();
  const privacyEmail = legalConfig.privacyEmail ?? contactEmail;

  return (
    <ContentPage
      kicker="Legal"
      title="Tratamiento de datos"
      intro="Política de tratamiento de datos personales conforme a la Ley 1581 de 2012 y al Decreto 1074 de 2015."
      updatedAt={legalConfig.lastUpdated}
    >
      <LegalPendingNotice />

      <Prose>
        <h2>1. Responsable</h2>
        <p>
          <strong>{legalConfig.legalName}</strong>, NIT {legalConfig.taxId}, domiciliada en{' '}
          {legalConfig.address}, {legalConfig.city}, es la responsable del tratamiento de los datos
          personales recogidos a través de {siteConfig.name}
          {privacyEmail && (
            <>
              . Canal de atención: <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
            </>
          )}
          .
        </p>

        <h2>2. Ámbito</h2>
        <p>
          Esta política aplica a todos los datos personales tratados por el responsable, ya sean de
          clientes, usuarios registrados, suscriptores del boletín, candidatos a un empleo o
          contactos comerciales.
        </p>

        <h2>3. Principios</h2>
        <p>
          El tratamiento se rige por los principios de legalidad, finalidad, libertad, veracidad,
          transparencia, acceso y circulación restringida, seguridad y confidencialidad, previstos
          en el artículo 4 de la Ley 1581 de 2012.
        </p>

        <h2>4. Finalidades del tratamiento</h2>
        <ul>
          <li>Gestionar el registro y la autenticación de los usuarios.</li>
          <li>Tramitar pedidos: cobro, facturación, envío, devoluciones y garantías.</li>
          <li>Atender consultas, peticiones, quejas y reclamos.</li>
          <li>Enviar comunicaciones comerciales a quienes lo hayan autorizado.</li>
          <li>Prevenir el fraude y garantizar la seguridad de la plataforma.</li>
          <li>Cumplir obligaciones legales, contables y tributarias.</li>
          <li>Evaluar candidaturas de empleo recibidas.</li>
        </ul>
        <p>
          El detalle de qué datos se recogen para cada finalidad está en la{' '}
          <Link href="/legal/privacidad">política de privacidad</Link>.
        </p>

        <h2>5. Autorización del titular</h2>
        <p>
          La autorización se obtiene antes del tratamiento, por medios que permiten conservar
          prueba de ella: al crear una cuenta, al realizar un pedido o al suscribirte al boletín.
          Puede otorgarse de forma escrita, verbal o mediante conductas inequívocas del titular.
        </p>

        <h2>6. Datos sensibles y de menores</h2>
        <p>
          No solicitamos datos sensibles en el sentido del artículo 5 de la Ley 1581 de 2012. Si en
          algún caso llegaran a requerirse, se informará expresamente su carácter facultativo: el
          titular no está obligado a autorizar su tratamiento. Tampoco tratamos deliberadamente
          datos de menores de edad.
        </p>

        <h2>7. Derechos del titular</h2>
        <p>Como titular de tus datos personales tienes derecho a:</p>
        <ul>
          <li>Conocer, actualizar y rectificar tus datos frente al responsable.</li>
          <li>Solicitar prueba de la autorización otorgada, salvo cuando la ley la exceptúe.</li>
          <li>Ser informado sobre el uso que se ha dado a tus datos.</li>
          <li>
            Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la
            ley.
          </li>
          <li>
            Revocar la autorización o solicitar la supresión de los datos, cuando no exista un
            deber legal o contractual que obligue a conservarlos.
          </li>
          <li>Acceder de forma gratuita a los datos que hayan sido objeto de tratamiento.</li>
        </ul>

        <h2>8. Cómo ejercerlos</h2>
        <p>
          {privacyEmail ? (
            <>
              Envía tu solicitud a <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
            </>
          ) : (
            <>
              Envía tu solicitud por los canales indicados en{' '}
              <Link href="/contacto">Contacto</Link>
            </>
          )}{' '}
          indicando tu nombre completo, documento de identidad, el correo asociado a tu cuenta, una
          descripción clara de lo que solicitas y los documentos que quieras aportar.
        </p>
        <h3>Plazos de respuesta</h3>
        <ul>
          <li>
            <strong>Consultas:</strong> se atienden en un plazo máximo de{' '}
            <strong>diez (10) días hábiles</strong>, prorrogable por cinco (5) días hábiles más,
            informando previamente el motivo.
          </li>
          <li>
            <strong>Reclamos:</strong> se atienden en un plazo máximo de{' '}
            <strong>quince (15) días hábiles</strong>, prorrogable por ocho (8) días hábiles más.
            Si el reclamo está incompleto, se te pedirá subsanarlo dentro de los cinco (5) días
            siguientes; transcurridos dos meses sin respuesta, se entenderá desistido.
          </li>
        </ul>
        <p>
          Mientras un reclamo esté en trámite, el dato objeto de la solicitud quedará marcado con
          la leyenda <strong>&quot;reclamo en trámite&quot;</strong>.
        </p>

        <h2>9. Requisito de procedibilidad</h2>
        <p>
          Antes de acudir a la Superintendencia de Industria y Comercio, el titular debe agotar el
          trámite de consulta o reclamo ante el responsable, conforme al artículo 16 de la Ley 1581
          de 2012.
        </p>

        <h2>10. Seguridad y encargados</h2>
        <p>
          Aplicamos medidas técnicas, humanas y administrativas razonables para evitar la
          adulteración, pérdida, consulta o acceso no autorizado a los datos. Los proveedores que
          acceden a información en calidad de encargados están sujetos a obligaciones de
          confidencialidad y solo pueden tratarla según nuestras instrucciones. El listado figura
          en la <Link href="/legal/privacidad">política de privacidad</Link>.
        </p>

        <h2>11. Transferencias internacionales</h2>
        <p>
          Parte de la infraestructura está alojada fuera de Colombia, lo que implica transferencia
          y transmisión internacional de datos. Estas operaciones se realizan con garantías
          contractuales de un nivel adecuado de protección, en los términos de los artículos 26 y
          27 de la Ley 1581 de 2012.
        </p>

        <h2>12. Vigencia</h2>
        <p>
          Esta política rige desde el {legalConfig.lastUpdated}. Los datos se conservarán mientras
          sea necesario para cumplir las finalidades descritas y los plazos legales aplicables.
          Cualquier modificación se publicará en esta página.
        </p>
      </Prose>
    </ContentPage>
  );
}
