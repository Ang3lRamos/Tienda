import 'server-only';

import { formatPrice, orderStatusLabel } from '@/lib/utils';
import type { EmailMessage } from './index';

/**
 * Plantillas de los correos transaccionales.
 *
 * Los clientes de correo (sobre todo Outlook y Gmail) ignoran hojas de estilo,
 * flexbox y grid: todo va con tablas y estilos en línea. Se mantiene la línea
 * gráfica de la tienda —blanco y negro, alto contraste, mayúsculas— dentro de
 * lo que el medio permite.
 */

const BLACK = '#000000';
const WHITE = '#ffffff';
const GREY = '#666666';
const BORDER = '#e5e5e5';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface ShellOptions {
  storeName: string;
  title: string;
  preheader: string;
  body: string;
  siteUrl: string;
}

/** Marco común: cabecera con el logotipo tipográfico, contenido y pie. */
function shell({ storeName, title, preheader, body, siteUrl }: ShellOptions): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif;color:${BLACK};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${WHITE};border:1px solid ${BORDER};">
    <tr>
      <td style="background:${BLACK};padding:24px;text-align:center;">
        <a href="${siteUrl}" style="color:${WHITE};font-size:26px;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase;text-decoration:none;">${escapeHtml(storeName)}</a>
      </td>
    </tr>
    <tr><td style="padding:32px 24px;">${body}</td></tr>
    <tr>
      <td style="border-top:1px solid ${BORDER};padding:24px;text-align:center;font-size:12px;color:${GREY};line-height:1.6;">
        <p style="margin:0 0 8px;">Recibes este correo porque hiciste un pedido en ${escapeHtml(storeName)}.</p>
        <p style="margin:0;">
          <a href="${siteUrl}/ayuda/envios" style="color:${GREY};">Envíos</a> &nbsp;·&nbsp;
          <a href="${siteUrl}/ayuda/devoluciones" style="color:${GREY};">Devoluciones</a> &nbsp;·&nbsp;
          <a href="${siteUrl}/contacto" style="color:${GREY};">Contacto</a>
        </p>
      </td>
    </tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="background:${BLACK};">
      <a href="${href}" style="display:inline-block;padding:14px 28px;color:${WHITE};font-size:13px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;">${escapeHtml(label)}</a>
    </td></tr>
  </table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:-0.01em;">${escapeHtml(text)}</h1>`;
}

function paragraph(html: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333333;">${html}</p>`;
}

/* ------------------------- Confirmación de pedido ------------------------ */

export interface OrderEmailItem {
  productName: string;
  label: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderConfirmationInput {
  storeName: string;
  siteUrl: string;
  orderNumber: string;
  recipientName: string;
  items: OrderEmailItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  paymentMethodLabel: string;
  shippingAddress: { line1: string; line2?: string | null; city: string; state?: string | null };
}

function itemsTable(items: OrderEmailItem[]): string {
  const rows = items
    .map(
      (item) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid ${BORDER};font-size:14px;">
          <strong>${escapeHtml(item.productName)}</strong>
          ${item.label ? `<br><span style="color:${GREY};font-size:13px;">${escapeHtml(item.label)}</span>` : ''}
          <br><span style="color:${GREY};font-size:13px;">Cantidad: ${item.quantity}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid ${BORDER};text-align:right;font-size:14px;white-space:nowrap;">
          ${escapeHtml(formatPrice(item.lineTotal))}
        </td>
      </tr>`,
    )
    .join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}

function totalsTable(input: OrderConfirmationInput): string {
  const line = (label: string, value: string, bold = false) =>
    `<tr>
      <td style="padding:6px 0;font-size:${bold ? '16px' : '14px'};${bold ? 'font-weight:bold;text-transform:uppercase;' : `color:${GREY};`}">${escapeHtml(label)}</td>
      <td style="padding:6px 0;text-align:right;font-size:${bold ? '16px' : '14px'};${bold ? 'font-weight:bold;' : ''}white-space:nowrap;">${escapeHtml(value)}</td>
    </tr>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
    ${line('Subtotal', formatPrice(input.subtotal))}
    ${input.discount > 0 ? line('Descuento', `− ${formatPrice(input.discount)}`) : ''}
    ${line('Envío', input.shipping === 0 ? 'Gratis' : formatPrice(input.shipping))}
    ${input.tax > 0 ? line('Impuestos', formatPrice(input.tax)) : ''}
    <tr><td colspan="2" style="border-top:2px solid ${BLACK};padding-top:8px;"></td></tr>
    ${line('Total', formatPrice(input.grandTotal), true)}
  </table>`;
}

export function orderConfirmationEmail(input: OrderConfirmationInput): Omit<EmailMessage, 'to'> {
  const { storeName, siteUrl, orderNumber, recipientName, shippingAddress } = input;
  const orderUrl = `${siteUrl}/pedido/${orderNumber}`;

  const address = [
    shippingAddress.line1,
    shippingAddress.line2,
    [shippingAddress.city, shippingAddress.state].filter(Boolean).join(', '),
  ]
    .filter(Boolean)
    .map((l) => escapeHtml(String(l)))
    .join('<br>');

  const body = `
    ${heading('Pedido confirmado')}
    ${paragraph(`Hola ${escapeHtml(recipientName)}, recibimos tu pedido y ya estamos preparándolo.`)}
    ${paragraph(`Tu número de pedido es <strong>${escapeHtml(orderNumber)}</strong>. Guárdalo: te sirve para cualquier consulta.`)}
    ${button('Ver mi pedido', orderUrl)}

    <h2 style="margin:32px 0 8px;font-size:13px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">Resumen</h2>
    ${itemsTable(input.items)}
    ${totalsTable(input)}

    <h2 style="margin:32px 0 8px;font-size:13px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">Envío</h2>
    ${paragraph(address)}
    ${paragraph(`Método de pago: <strong>${escapeHtml(input.paymentMethodLabel)}</strong>`)}
    ${paragraph(`Los plazos de entrega y su cobertura están en <a href="${siteUrl}/ayuda/envios" style="color:${BLACK};">nuestra página de envíos</a>.`)}
  `;

  const text = [
    `Pedido confirmado — ${orderNumber}`,
    ``,
    `Hola ${recipientName}, recibimos tu pedido y ya estamos preparándolo.`,
    ``,
    ...input.items.map(
      (i) => `- ${i.productName}${i.label ? ` (${i.label})` : ''} x${i.quantity}  ${formatPrice(i.lineTotal)}`,
    ),
    ``,
    `Subtotal: ${formatPrice(input.subtotal)}`,
    ...(input.discount > 0 ? [`Descuento: -${formatPrice(input.discount)}`] : []),
    `Envío: ${input.shipping === 0 ? 'Gratis' : formatPrice(input.shipping)}`,
    ...(input.tax > 0 ? [`Impuestos: ${formatPrice(input.tax)}`] : []),
    `Total: ${formatPrice(input.grandTotal)}`,
    ``,
    `Método de pago: ${input.paymentMethodLabel}`,
    `Ver el pedido: ${orderUrl}`,
  ].join('\n');

  return {
    subject: `Pedido ${orderNumber} confirmado — ${storeName}`,
    html: shell({
      storeName,
      siteUrl,
      title: `Pedido ${orderNumber} confirmado`,
      preheader: `Recibimos tu pedido ${orderNumber} y ya lo estamos preparando.`,
      body,
    }),
    text,
  };
}

/* --------------------------- Cambio de estado --------------------------- */

export type NotifiableStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

/** Estados que justifican avisar al comprador (los demás no aportan nada). */
export const NOTIFIABLE_STATUSES: NotifiableStatus[] = [
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

const statusCopy: Record<NotifiableStatus, { heading: string; message: string }> = {
  processing: {
    heading: 'Preparando tu pedido',
    message: 'Ya estamos alistando tus prendas. Te avisamos en cuanto salgan hacia tu dirección.',
  },
  shipped: {
    heading: 'Tu pedido va en camino',
    message:
      'Tu pedido salió de nuestra bodega y está en manos de la transportadora. Según el destino, la entrega toma entre 2 y 10 días hábiles.',
  },
  delivered: {
    heading: 'Pedido entregado',
    message:
      'Tu pedido figura como entregado. Si algo no está bien, escríbenos dentro de los cinco días siguientes y lo resolvemos.',
  },
  cancelled: {
    heading: 'Pedido cancelado',
    message:
      'Tu pedido fue cancelado y las unidades volvieron a nuestro inventario. Si ya habías pagado, el reembolso se tramita por el mismo medio de pago.',
  },
  refunded: {
    heading: 'Reembolso en curso',
    message:
      'Procesamos el reembolso de tu pedido por el mismo medio de pago. Según tu banco, puede tardar hasta 30 días calendario en reflejarse.',
  },
};

export interface OrderStatusInput {
  storeName: string;
  siteUrl: string;
  orderNumber: string;
  recipientName: string;
  status: NotifiableStatus;
}

export function orderStatusEmail(input: OrderStatusInput): Omit<EmailMessage, 'to'> {
  const { storeName, siteUrl, orderNumber, recipientName, status } = input;
  const copy = statusCopy[status];
  const orderUrl = `${siteUrl}/pedido/${orderNumber}`;

  const extra =
    status === 'delivered'
      ? paragraph(
          `¿Te gustó lo que pediste? Puedes <a href="${siteUrl}/account/pedidos" style="color:${BLACK};">dejar una reseña</a> desde tu cuenta.`,
        )
      : status === 'cancelled' || status === 'refunded'
        ? paragraph(
            `Si no reconoces esta cancelación, <a href="${siteUrl}/contacto" style="color:${BLACK};">escríbenos</a> cuanto antes.`,
          )
        : '';

  const body = `
    ${heading(copy.heading)}
    ${paragraph(`Hola ${escapeHtml(recipientName)}, tu pedido <strong>${escapeHtml(orderNumber)}</strong> cambió de estado.`)}
    ${paragraph(copy.message)}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 0;">
      <tr><td style="border:2px solid ${BLACK};padding:10px 16px;font-size:13px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">
        ${escapeHtml(orderStatusLabel(status))}
      </td></tr>
    </table>
    ${button('Ver mi pedido', orderUrl)}
    ${extra}
  `;

  const text = [
    `${copy.heading} — ${orderNumber}`,
    ``,
    `Hola ${recipientName}, tu pedido ${orderNumber} cambió de estado a "${orderStatusLabel(status)}".`,
    ``,
    copy.message,
    ``,
    `Ver el pedido: ${orderUrl}`,
  ].join('\n');

  return {
    subject: `${copy.heading} — Pedido ${orderNumber}`,
    html: shell({
      storeName,
      siteUrl,
      title: copy.heading,
      preheader: copy.message,
      body,
    }),
    text,
  };
}
