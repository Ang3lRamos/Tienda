import { z } from 'zod';

export const shippingAddressSchema = z.object({
  recipient: z.string().min(2, 'Ingresa el nombre del destinatario'),
  phone: z.string().min(7, 'Teléfono no válido'),
  line1: z.string().min(3, 'Ingresa la dirección'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Ingresa la ciudad'),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('CO'),
  notes: z.string().max(500).optional(),
});

export const checkoutItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});

export const checkoutSchema = z.object({
  address: shippingAddressSchema,
  items: z.array(checkoutItemSchema).min(1, 'Tu carrito está vacío'),
  couponCode: z.string().trim().max(40).optional(),
  paymentMethod: z.enum(['cod', 'addi']).default('cod'),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Reglas de envío. */
export const FREE_SHIPPING_THRESHOLD = 200000;
export const SHIPPING_COST = 15000;
