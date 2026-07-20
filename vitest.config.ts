import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    /**
     * `config/env.ts` valida el entorno al importarse (fail-fast). Los tests
     * son de lógica pura y no tocan Supabase, así que se le dan valores
     * ficticios para que los módulos puedan importarse sin un `.env` real.
     */
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    },
  },
  resolve: {
    // Resuelve los alias `@/*` de tsconfig.json de forma nativa.
    tsconfigPaths: true,
    alias: {
      // `server-only` sólo existe para que el bundler falle si un módulo de
      // servidor acaba en el cliente; en los tests no aporta nada.
      'server-only': new URL('./tests/stubs/server-only.ts', import.meta.url).pathname,
    },
  },
});
