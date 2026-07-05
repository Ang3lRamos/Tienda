'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import { publicEnv } from '@/config/env';

/**
 * Cliente de Supabase para componentes de cliente ('use client').
 * Usa la anon key + RLS: sólo puede hacer lo que las policies permitan.
 */
export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
