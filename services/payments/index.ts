import 'server-only';

import { addiProvider } from './addi';

/**
 * Capa de pagos desacoplada. El checkout depende de esta interfaz, no de una
 * pasarela concreta. Para integrar un nuevo proveedor basta con implementar
 * `PaymentProvider` y registrarlo en `providers`, sin tocar el flujo de checkout.
 */

export type PaymentMethod = 'cod' | 'addi' | 'card' | 'pse';

export interface PaymentCustomer {
  email?: string | null;
  fullName?: string | null;
  phone?: string | null;
}

export interface PaymentItem {
  sku: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface PaymentAddress {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  country: string;
}

export interface PaymentInput {
  orderNumber: string;
  amount: number;
  currency: string;
  shippingAmount?: number;
  taxAmount?: number;
  customer?: PaymentCustomer;
  items?: PaymentItem[];
  shippingAddress?: PaymentAddress;
  /** URL base de la tienda para construir los callbacks (sin barra final). */
  siteUrl?: string;
}

export interface PaymentResult {
  status: 'pending' | 'paid' | 'failed';
  reference?: string;
  provider?: string;
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
    return { status: 'pending', reference: 'COD', provider: 'cod' };
  },
};

// Registro de proveedores disponibles.
const providers: Partial<Record<PaymentMethod, PaymentProvider>> = {
  cod: codProvider,
  addi: addiProvider,
};

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  const provider = providers[method];
  if (!provider) throw new Error(`Método de pago no disponible: ${method}`);
  return provider;
}
