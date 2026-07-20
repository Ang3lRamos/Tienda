import { describe, it, expect } from 'vitest';
import { orderConfirmationEmail, orderStatusEmail } from '@/services/email/templates';

const base = {
  storeName: 'Átelier',
  siteUrl: 'https://tienda.example',
  orderNumber: 'ORD-2026-AB12CD',
  recipientName: 'Angel Ramos',
};

const confirmation = {
  ...base,
  items: [
    { productName: 'Camiseta Oversize', label: 'Negro / M', quantity: 2, unitPrice: 89000, lineTotal: 178000 },
  ],
  subtotal: 178000,
  discount: 0,
  shipping: 15000,
  tax: 0,
  grandTotal: 193000,
  paymentMethodLabel: 'Contra entrega',
  shippingAddress: { line1: 'Calle 45 #12-30', line2: null, city: 'Medellín', state: 'Antioquia' },
};

/** Texto visible del correo, sin etiquetas ni entidades. */
function visibleText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

describe('orderConfirmationEmail', () => {
  it('incluye el número de pedido en el asunto', () => {
    expect(orderConfirmationEmail(confirmation).subject).toContain('ORD-2026-AB12CD');
  });

  it('muestra los artículos con su variante y cantidad', () => {
    const text = visibleText(orderConfirmationEmail(confirmation).html);
    expect(text).toContain('Camiseta Oversize');
    expect(text).toContain('Negro / M');
    expect(text).toContain('Cantidad: 2');
  });

  it('enlaza al pedido con la URL absoluta de la tienda', () => {
    // Los clientes de correo no resuelven rutas relativas.
    expect(orderConfirmationEmail(confirmation).html).toContain(
      'https://tienda.example/pedido/ORD-2026-AB12CD',
    );
  });

  it('omite la fila de descuento cuando no hay', () => {
    expect(visibleText(orderConfirmationEmail(confirmation).html)).not.toContain('Descuento');
  });

  it('muestra el descuento cuando lo hay', () => {
    const text = visibleText(orderConfirmationEmail({ ...confirmation, discount: 33700 }).html);
    expect(text).toContain('Descuento');
  });

  it('escribe "Gratis" en vez de $ 0 cuando el envío es gratuito', () => {
    const text = visibleText(orderConfirmationEmail({ ...confirmation, shipping: 0 }).html);
    expect(text).toContain('Gratis');
  });

  it('omite los impuestos cuando la tasa es 0', () => {
    expect(visibleText(orderConfirmationEmail(confirmation).html)).not.toContain('Impuestos');
  });

  it('genera también una versión en texto plano con el total', () => {
    const { text } = orderConfirmationEmail(confirmation);
    expect(text).toContain('ORD-2026-AB12CD');
    // formatPrice separa el símbolo de la cifra con un espacio duro, así que
    // la aserción no depende del tipo de espacio concreto.
    expect(text).toMatch(/Total:\s\$\s?193\.000/);
  });

  it('escapa el HTML del nombre de producto en vez de inyectarlo', () => {
    const { html } = orderConfirmationEmail({
      ...confirmation,
      items: [
        {
          productName: '<script>alert(1)</script> & "comillas"',
          label: null,
          quantity: 1,
          unitPrice: 1000,
          lineTotal: 1000,
        },
      ],
    });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
  });

  it('omite la segunda línea de dirección cuando es null', () => {
    const text = visibleText(orderConfirmationEmail(confirmation).html);
    expect(text).toContain('Calle 45 #12-30');
    expect(text).not.toContain('null');
  });
});

describe('orderStatusEmail', () => {
  it('usa un mensaje distinto por estado', () => {
    const enviado = orderStatusEmail({ ...base, status: 'shipped' });
    const entregado = orderStatusEmail({ ...base, status: 'delivered' });
    expect(enviado.subject).not.toBe(entregado.subject);
    expect(enviado.html).not.toBe(entregado.html);
  });

  it('muestra la etiqueta del estado en español', () => {
    const text = visibleText(orderStatusEmail({ ...base, status: 'shipped' }).html);
    expect(text).toContain('Enviado');
  });

  it('invita a reseñar sólo cuando el pedido se entregó', () => {
    const entregado = visibleText(orderStatusEmail({ ...base, status: 'delivered' }).html);
    const enviado = visibleText(orderStatusEmail({ ...base, status: 'shipped' }).html);
    expect(entregado).toContain('reseña');
    expect(enviado).not.toContain('reseña');
  });

  it('ofrece contacto cuando se cancela o se reembolsa', () => {
    for (const status of ['cancelled', 'refunded'] as const) {
      expect(visibleText(orderStatusEmail({ ...base, status }).html)).toContain('escríbenos');
    }
  });

  it('incluye el número de pedido en asunto y texto plano', () => {
    const msg = orderStatusEmail({ ...base, status: 'shipped' });
    expect(msg.subject).toContain('ORD-2026-AB12CD');
    expect(msg.text).toContain('ORD-2026-AB12CD');
  });
});
