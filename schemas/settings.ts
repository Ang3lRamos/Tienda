import { z } from 'zod';

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal('')).transform((v) => v || undefined);

export const storeSettingsSchema = z.object({
  shippingCost: z.coerce
    .number({ message: 'Ingresa un número' })
    .int('Usa un valor entero en pesos')
    .min(0, 'No puede ser negativo')
    .max(10_000_000),
  freeShippingThreshold: z.coerce
    .number({ message: 'Ingresa un número' })
    .int('Usa un valor entero en pesos')
    .min(0, 'No puede ser negativo')
    .max(100_000_000),
  taxRate: z.coerce
    .number({ message: 'Ingresa un número' })
    .min(0, 'No puede ser negativo')
    .max(100, 'No puede superar 100%'),
  storeName: z.string().trim().min(2, 'Ingresa el nombre de la tienda').max(60),
  contactEmail: z
    .string()
    .trim()
    .email('Correo no válido')
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  contactPhone: optionalText(30),
  announcement: optionalText(120),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;
