import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, Prose } from '@/components/shared/content-page';
import { LegalPendingNotice } from '@/components/shared/legal-pending-notice';
import { legalConfig } from '@/config/legal';
import { siteConfig } from '@/config/site';
import { getStoreSettings } from '@/features/settings/queries';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: `Qué datos recoge ${siteConfig.name}, para qué los usa y con quién los comparte.`,
};

export default async function PrivacidadPage() {
  const { contactEmail } = await getStoreSettings();
  const privacyEmail = legalConfig.privacyEmail ?? contactEmail;

  return (
    <ContentPage
      kicker="Legal"
      title="Política de privacidad"
      intro="Qué datos recogemos, para qué los usamos, con quién los compartimos y cómo puedes controlarlos."
      updatedAt={legalConfig.lastUpdated}
    >
      <LegalPendingNotice />

      <Prose>
        <h2>1. Responsable del tratamiento</h2>
        <p>
          <strong>{legalConfig.legalName}</strong>, NIT {legalConfig.taxId}, con domicilio en{' '}
          {legalConfig.address}, {legalConfig.city}
          {privacyEmail && (
            <>
              . Para cualquier asunto relacionado con tus datos, escribe a{' '}
              <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
            </>
          )}
          .
        </p>

        <h2>2. Qué datos recogemos</h2>
        <h3>Los que nos das directamente</h3>
        <ul>
          <li>
            <strong>Cuenta:</strong> correo electrónico y contraseña (almacenada cifrada, nunca en
            texto plano).
          </li>
          <li>
            <strong>Perfil:</strong> nombre y teléfono, si decides completarlos.
          </li>
          <li>
            <strong>Direcciones de envío:</strong> destinatario, dirección, ciudad, departamento y
            teléfono de contacto.
          </li>
          <li>
            <strong>Pedidos:</strong> productos comprados, importes, método de pago y estado del
            envío.
          </li>
          <li>
            <strong>Reseñas:</strong> la calificación y el comentario que publicas sobre un
            producto, junto a tu nombre.
          </li>
          <li>
            <strong>Newsletter:</strong> tu correo, si te suscribes.
          </li>
          <li>
            <strong>Chatbot:</strong> los mensajes que escribes al asistente de la tienda.
          </li>
        </ul>

        <h3>Los que se generan con tu uso</h3>
        <ul>
          <li>
            <strong>Carrito y favoritos:</strong> se guardan en tu navegador y, si inicias sesión,
            se sincronizan con tu cuenta para que los tengas en todos tus dispositivos.
          </li>
          <li>
            <strong>Productos vistos recientemente:</strong> se almacenan únicamente en tu
            navegador.
          </li>
          <li>
            <strong>Datos técnicos:</strong> dirección IP, tipo de navegador y registros de acceso,
            recogidos por nuestros proveedores de infraestructura por seguridad.
          </li>
        </ul>
        <p>
          <strong>No recogemos datos de tarjetas.</strong> Los pagos electrónicos se procesan
          íntegramente en los sistemas del proveedor de pago; nosotros solo guardamos una
          referencia de la transacción y su estado.
        </p>

        <h2>3. Para qué los usamos</h2>
        <ul>
          <li>Crear y gestionar tu cuenta, y autenticarte de forma segura.</li>
          <li>Procesar tus pedidos, cobrarlos, enviarlos y atender devoluciones y garantías.</li>
          <li>Responder tus consultas por los canales de contacto y por el chatbot.</li>
          <li>Publicar tus reseñas, previa moderación.</li>
          <li>Enviarte el boletín, solo si te suscribiste voluntariamente.</li>
          <li>Prevenir el fraude y proteger la seguridad de la tienda.</li>
          <li>Cumplir obligaciones legales, contables y tributarias.</li>
        </ul>
        <p>
          <strong>No vendemos tus datos personales</strong>, ni los cedemos a terceros con fines
          publicitarios.
        </p>

        <h2>4. Con quién los compartimos</h2>
        <p>
          Compartimos datos únicamente con los proveedores necesarios para operar la tienda, que
          actúan como encargados del tratamiento y solo pueden usarlos para prestarnos su servicio:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — base de datos, autenticación y almacenamiento de archivos.
          </li>
          <li>
            <strong>Vercel</strong> — alojamiento del sitio y registros técnicos.
          </li>
          <li>
            <strong>OpenRouter</strong> — procesamiento de los mensajes del asistente de IA. Ten
            en cuenta que <strong>lo que escribas en el chat se transmite a este proveedor</strong>
            : evita compartir ahí datos sensibles o información que no quieras que salga de la
            tienda.
          </li>
          <li>
            <strong>Proveedores de pago y transportadoras</strong> — reciben los datos
            imprescindibles para cobrar y entregar tu pedido.
          </li>
        </ul>
        <p>
          Algunos de estos proveedores están ubicados fuera de Colombia, por lo que puede existir
          una <strong>transferencia internacional de datos</strong>. En esos casos exigimos
          garantías contractuales de un nivel de protección adecuado, conforme a la Ley 1581 de
          2012.
        </p>
        <p>
          También podemos entregar información cuando lo exija una autoridad competente en el marco
          de la ley.
        </p>

        <h2>5. Cuánto tiempo los conservamos</h2>
        <ul>
          <li>
            <strong>Datos de cuenta:</strong> mientras la cuenta esté activa.
          </li>
          <li>
            <strong>Pedidos y facturación:</strong> el plazo que exige la normativa contable y
            tributaria, aunque cierres tu cuenta.
          </li>
          <li>
            <strong>Newsletter:</strong> hasta que canceles la suscripción.
          </li>
          <li>
            <strong>Conversaciones del chatbot:</strong> se conservan para dar continuidad a la
            atención y mejorar el servicio.
          </li>
        </ul>

        <h2>6. Tus derechos</h2>
        <p>
          Puedes <strong>conocer, actualizar, rectificar y suprimir</strong> tus datos, solicitar
          prueba de la autorización otorgada, revocarla y ser informado sobre el uso que hemos
          dado a tu información. El procedimiento y los plazos de respuesta están detallados en la{' '}
          <Link href="/legal/tratamiento-datos">política de tratamiento de datos personales</Link>.
        </p>
        <p>
          Buena parte de estos derechos puedes ejercerlos tú directamente desde tu{' '}
          <Link href="/account">cuenta</Link>: editar tu perfil, gestionar tus direcciones y
          consultar tus pedidos.
        </p>

        <h2>7. Seguridad</h2>
        <p>
          El acceso a la información está restringido mediante políticas de seguridad a nivel de
          base de datos, de modo que cada persona solo puede consultar sus propios datos. Las
          contraseñas se almacenan cifradas y las comunicaciones viajan por conexión segura (HTTPS).
          Ningún sistema es infalible, pero mantenemos medidas técnicas y organizativas razonables
          para protegerlos.
        </p>

        <h2>8. Cookies y almacenamiento local</h2>
        <p>
          Usamos cookies estrictamente necesarias para mantener tu sesión iniciada y para recordar
          tus preferencias, como el tema claro u oscuro. El carrito, los favoritos y los productos
          vistos recientemente se guardan en el almacenamiento local de tu navegador. Puedes
          borrarlos desde la configuración de tu navegador, teniendo en cuenta que al hacerlo se
          cerrará tu sesión.
        </p>

        <h2>9. Menores de edad</h2>
        <p>
          La tienda está dirigida a mayores de 18 años. No recogemos deliberadamente datos de
          menores; si detectamos que se han registrado, eliminaremos la cuenta y su información.
        </p>

        <h2>10. Cambios en esta política</h2>
        <p>
          Si modificamos esta política, publicaremos la nueva versión en esta página con su fecha
          de actualización. Cuando los cambios sean sustanciales, te lo notificaremos por un medio
          adicional.
        </p>
      </Prose>
    </ContentPage>
  );
}
