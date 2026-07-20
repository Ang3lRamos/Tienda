import { z } from 'zod';

/**
 * Validación centralizada de variables de entorno.
 * - Las públicas (NEXT_PUBLIC_*) se pueden usar en cliente y servidor.
 * - Las privadas sólo deben leerse en código de servidor.
 * Si falta una variable requerida, la app falla al arrancar (fail-fast).
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  OPENROUTER_MODEL: z.string().min(1).default('openai/gpt-oss-20b:free'),

  // --- Addi (BNPL Colombia). Los valores exactos los entrega Addi en el
  // onboarding (correo cifrado): credenciales de sandbox y producción. ---
  ADDI_CLIENT_ID: z.string().min(1).optional(),
  ADDI_CLIENT_SECRET: z.string().min(1).optional(),
  ADDI_AUTH_URL: z.string().url().default('https://auth.addi-staging.com/oauth/token'),
  ADDI_AUDIENCE: z.string().min(1).default('https://api.staging.addi.com'),
  ADDI_API_URL: z.string().url().default('https://api.staging.addi.com'),
  /** Slug del comercio (ally) asignado por Addi. */
  ADDI_ALLY_SLUG: z.string().min(1).optional(),
  /** Secreto compartido para validar los webhooks entrantes de Addi. */
  ADDI_WEBHOOK_SECRET: z.string().min(1).optional(),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

/**
 * Sólo debe invocarse desde el servidor (Server Components, Actions, Route Handlers).
 */
export function getServerEnv() {
  return serverSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
    ADDI_CLIENT_ID: process.env.ADDI_CLIENT_ID,
    ADDI_CLIENT_SECRET: process.env.ADDI_CLIENT_SECRET,
    ADDI_AUTH_URL: process.env.ADDI_AUTH_URL,
    ADDI_AUDIENCE: process.env.ADDI_AUDIENCE,
    ADDI_API_URL: process.env.ADDI_API_URL,
    ADDI_ALLY_SLUG: process.env.ADDI_ALLY_SLUG,
    ADDI_WEBHOOK_SECRET: process.env.ADDI_WEBHOOK_SECRET,
  });
}
