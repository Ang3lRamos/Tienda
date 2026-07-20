import { z } from 'zod';

/** Edición del perfil (nombre y teléfono). El correo no se edita aquí. */
export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Ingresa tu nombre').max(80),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
});
export type ProfileInput = z.infer<typeof profileSchema>;

/** Dirección de envío guardada en la cuenta. */
export const addressSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().max(40).optional().or(z.literal('')).transform((v) => v || undefined),
  recipient: z.string().trim().min(2, 'Ingresa el nombre del destinatario').max(80),
  phone: z.string().trim().min(7, 'Teléfono no válido').max(20),
  line1: z.string().trim().min(3, 'Ingresa la dirección').max(160),
  line2: z.string().trim().max(160).optional().or(z.literal('')).transform((v) => v || undefined),
  city: z.string().trim().min(2, 'Ingresa la ciudad').max(80),
  state: z.string().trim().max(80).optional().or(z.literal('')).transform((v) => v || undefined),
  postalCode: z.string().trim().max(20).optional().or(z.literal('')).transform((v) => v || undefined),
  country: z.string().trim().default('CO'),
  isDefault: z.boolean().default(false),
});
export type AddressInput = z.infer<typeof addressSchema>;
