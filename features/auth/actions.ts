'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { publicEnv } from '@/config/env';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type UpdatePasswordInput,
} from '@/schemas/auth';

type ActionResult = { error?: string; success?: boolean; message?: string };

const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;

/** Inicio de sesión con email + contraseña. */
export async function signInAction(
  values: LoginInput,
  redirectTo = '/account',
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { error: 'Revisa los datos ingresados.' };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: 'Correo o contraseña incorrectos.' };

  revalidatePath('/', 'layout');
  redirect(redirectTo);
}

/** Registro de una cuenta nueva (rol customer por trigger). */
export async function signUpAction(values: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) return { error: 'Revisa los datos ingresados.' };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${siteUrl}/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('registered')) {
      return { error: 'Ya existe una cuenta con este correo.' };
    }
    return { error: 'No fue posible crear la cuenta. Inténtalo de nuevo.' };
  }

  // Si la confirmación por correo está desactivada, ya hay sesión → entra.
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/account');
  }

  return {
    success: true,
    message: 'Cuenta creada. Revisa tu correo para confirmar tu cuenta.',
  };
}

/** Cierra la sesión. */
export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

/** Envía el correo de recuperación de contraseña. */
export async function requestPasswordResetAction(
  values: ForgotPasswordInput,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return { error: 'Correo no válido.' };

  const supabase = await createServerSupabase();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/callback?next=/actualizar-clave`,
  });

  // Respuesta neutra para no revelar si el correo existe (seguridad).
  return {
    success: true,
    message: 'Si el correo está registrado, te enviamos un enlace de recuperación.',
  };
}

/** Actualiza la contraseña (tras seguir el enlace de recuperación). */
export async function updatePasswordAction(
  values: UpdatePasswordInput,
): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse(values);
  if (!parsed.success) return { error: 'Revisa los datos ingresados.' };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: 'No fue posible actualizar la contraseña.' };

  revalidatePath('/', 'layout');
  redirect('/account');
}

/** Inicia sesión con Google (requiere activar el proveedor en Supabase). */
export async function signInWithGoogleAction(): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${siteUrl}/callback` },
  });
  if (error || !data.url) {
    return { error: 'Google no está disponible por ahora.' };
  }
  redirect(data.url);
}
