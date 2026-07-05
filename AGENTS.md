# Convenciones del proyecto — Átelier (tienda de moda)

Stack: **Next.js 15 (App Router)** + TypeScript estricto + TailwindCSS v4 +
shadcn/ui + Supabase (Postgres/Auth/Storage/RLS) + OpenRouter (chatbot IA).

## Reglas de arquitectura

- **Server Components por defecto.** Marca `'use client'` sólo cuando haya
  interactividad (estado, efectos, eventos).
- **Mutaciones = Server Actions** (`features/<modulo>/actions.ts`), validadas
  con **Zod** antes de tocar la BD. Lecturas de servidor en `queries.ts`.
- **Acceso a datos vía Supabase clients** de `lib/supabase/`:
  - `client.ts` → componentes de cliente (anon key + RLS).
  - `server.ts` → `createServerSupabase()` (RSC/actions) y `createAdminSupabase()`
    (service role, **sólo servidor**).
- **Nunca** expongas la `service_role` key al cliente. La seguridad real es
  **RLS**; el middleware es sólo la primera barrera.
- Tipos de BD en `types/database.types.ts` (regenerar con `npm run db:types`).
- **Consultas Supabase → módulos `.ts` con tipo de retorno EXPLÍCITO** (p.ej.
  `features/*/queries.ts` con `): Promise<T | null>` + `as T`). El parser de
  `select()` es muy recursivo y en archivos `.tsx` TypeScript hace *bailout* a
  `never`; fijar el retorno lo evita. Para igualdad usa `.match({ col: val })`.
- Esquemas Zod en `schemas/`, tipos en `types/`, lógica de dominio en
  `services/`, stores Zustand en `store/`.

## Estilo de código

- TypeScript estricto; evita `any`. Componentes funcionales.
- Clases con el helper `cn()` de `@/lib/utils`.
- Textos de la UI en **español**. Moneda: COP (`formatPrice`).
- Precios en la BD como enteros/`numeric` (COP sin decimales en la UI).

## Verificación antes de dar por hecho un módulo

```
npm run typecheck && npm run lint && npm run build
```

## Estado y plan

Desarrollo incremental por módulos — ver `docs/ROADMAP.md`. Cada módulo se
entrega completo y verificado antes de continuar con el siguiente.
