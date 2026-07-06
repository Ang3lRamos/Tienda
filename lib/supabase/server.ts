import 'server-only';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createAdminClientBase } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { publicEnv, getServerEnv } from '@/config/env';

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 * Lee/escribe la sesión desde las cookies y respeta RLS con el usuario actual.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: CookieOptions }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Invocado desde un Server Component: lo maneja el middleware.
          }
        },
      },
    },
  );
}

/**
 * Cliente público sin sesión (anon key, sin cookies). Útil para generación
 * estática/sitemap donde no hay contexto de request (cookies()).
 */
export function createPublicSupabase() {
  return createAdminClientBase<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * Cliente ADMIN con service_role: ignora RLS. Úsalo SÓLO en el servidor
 * para operaciones controladas (webhooks, tareas de sistema, el chatbot
 * consultando el catálogo). NUNCA lo expongas al cliente.
 */
export function createAdminSupabase() {
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada');
  }
  return createAdminClientBase<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
