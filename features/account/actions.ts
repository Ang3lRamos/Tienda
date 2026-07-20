'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { profileSchema, addressSchema } from '@/schemas/account';

export interface ActionResult {
  error?: string;
  ok?: boolean;
}

async function requireUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Actualiza nombre y teléfono del perfil (RLS: profile_self_update). */
export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Revisa los datos.' };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { error: 'Debes iniciar sesión.' };

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone ?? null,
    } as never)
    .match({ id: user.id });

  if (error) return { error: 'No fue posible guardar los cambios.' };
  revalidatePath('/account');
  return { ok: true };
}

/** Crea o actualiza una dirección del usuario (RLS: addr_owner_all). */
export async function upsertAddressAction(input: unknown): Promise<ActionResult> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Revisa los datos.' };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { error: 'Debes iniciar sesión.' };
  const a = parsed.data;

  const payload = {
    user_id: user.id,
    label: a.label ?? null,
    recipient: a.recipient,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 ?? null,
    city: a.city,
    state: a.state ?? null,
    postal_code: a.postalCode ?? null,
    country: a.country || 'CO',
    is_default: a.isDefault,
  };

  let savedId = a.id;
  if (a.id) {
    const { error } = await supabase
      .from('addresses')
      .update(payload as never)
      .match({ id: a.id, user_id: user.id });
    if (error) return { error: 'No fue posible guardar la dirección.' };
  } else {
    const { data, error } = await supabase
      .from('addresses')
      .insert(payload as never)
      .select('id')
      .single();
    if (error) return { error: 'No fue posible guardar la dirección.' };
    savedId = (data as { id: string } | null)?.id;
  }

  // Si se marcó como predeterminada, desmarca las demás.
  if (a.isDefault) {
    await unsetOtherDefaults(supabase, user.id, savedId);
  }
  revalidatePath('/account/direcciones');
  return { ok: true };
}

/** Elimina una dirección del usuario. */
export async function deleteAddressAction(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: 'Debes iniciar sesión.' };
  const { error } = await supabase.from('addresses').delete().match({ id, user_id: user.id });
  if (error) return { error: 'No fue posible eliminar la dirección.' };
  revalidatePath('/account/direcciones');
  return { ok: true };
}

/** Marca una dirección como predeterminada (y desmarca el resto). */
export async function setDefaultAddressAction(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: 'Debes iniciar sesión.' };
  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true } as never)
    .match({ id, user_id: user.id });
  if (error) return { error: 'No fue posible actualizar la dirección.' };
  await unsetOtherDefaults(supabase, user.id, id);
  revalidatePath('/account/direcciones');
  return { ok: true };
}

async function unsetOtherDefaults(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  userId: string,
  keepId: string | undefined,
) {
  let query = supabase
    .from('addresses')
    .update({ is_default: false } as never)
    .match({ user_id: userId, is_default: true });
  if (keepId) query = query.neq('id', keepId);
  await query;
}
