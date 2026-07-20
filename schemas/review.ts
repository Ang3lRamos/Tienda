import { z } from 'zod';

export const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.coerce.number().int().min(1, 'Elige una calificación').max(5),
  title: z.string().trim().max(120).optional().or(z.literal('')).transform((v) => v || undefined),
  comment: z
    .string()
    .trim()
    .min(4, 'Escribe tu opinión')
    .max(1000)
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
