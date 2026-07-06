import 'server-only';

/**
 * Capa de pagos desacoplada. El checkout depende de esta interfaz, no de una
 * pasarela concreta. Para integrar Stripe/MercadoPago en el futuro, basta con
 * implementar `PaymentProvider` y registrarlo en `getPaymentProvider`, sin
 * tocar el flujo de checkout ni la creación de pedidos.
 */

export type PaymentMethod = 'cod' | 'card' | 'pse';

export interface PaymentInput {
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail?: string | null;
}

export interface PaymentResult {
  status: 'pending' | 'paid' | 'failed';
  reference?: string;
  /** URL a la que redirigir para completar el pago (pasarelas externas). */
  redirectUrl?: string;
}

export interface PaymentProvider {
  method: PaymentMethod;
  createPayment(input: PaymentInput): Promise<PaymentResult>;
}

/** Pago contra entrega: el pedido queda pendiente hasta la entrega. */
const codProvider: PaymentProvider = {
  method: 'cod',
  async createPayment() {
    return { status: 'pending', reference: 'COD' };
  },
};

// Registro de proveedores disponibles.
const providers: Partial<Record<PaymentMethod, PaymentProvider>> = {
  cod: codProvider,
  // card: stripeProvider,   // TODO: integrar pasarela
  // pse: mercadoPagoProvider,
};

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  const provider = providers[method];
  if (!provider) throw new Error(`Método de pago no disponible: ${method}`);
  return provider;
}
