'use server';

import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';

const schema = z.object({ email: z.string().email() });

/** Suscribe un correo al newsletter (insert en newsletter_subscribers). */
export async function subscribeNewsletter(
  email: string,
): Promise<{ error?: string; success?: boolean }> {
  const parsed = schema.safeParse({ email });
  if (!parsed.success) return { error: 'Introduce un correo válido.' };

  const supabase = await createServerSupabase();
  const payload = { email: parsed.data.email } as unknown as never;
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert(payload, { onConflict: 'email', ignoreDuplicates: true });

  if (error) return { error: 'No fue posible suscribirte. Inténtalo más tarde.' };
  return { success: true };
}
