# Átelier — Tienda de moda (Next.js 15 + Supabase + IA)

Plataforma de e-commerce de ropa, lista para producción, con catálogo,
carrito, favoritos, panel de administración y un **chatbot con IA (OpenRouter +
tool calling)** que responde únicamente con datos reales de la tienda.

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, TailwindCSS v4, shadcn/ui,
  Framer Motion, React Hook Form, Zod, TanStack Query, Zustand.
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS).
- **IA:** OpenRouter (API compatible con OpenAI) con function calling.

## Puesta en marcha

1. **Instala dependencias** (ya hecho): `npm install`
2. **Crea un proyecto en [Supabase](https://supabase.com)** y ejecuta las
   migraciones de `supabase/migrations/` en orden (SQL Editor o Supabase CLI):
   - `0001_schema.sql` — tablas, índices, vistas, funciones.
   - `0002_rls.sql` — Row Level Security + trigger de alta de perfil.
   - `0003_seed.sql` — roles, permisos y catálogo demo.
3. **Configura las variables de entorno:** copia `.env.example` a `.env.local`
   y rellena tus claves de Supabase y OpenRouter.
4. **Crea tu usuario admin:** regístrate en la app y luego, en SQL Editor:
   ```sql
   update profiles set role_id = (select id from roles where name='admin')
   where email = 'tu-correo@ejemplo.com';
   ```
5. **Arranca:** `npm run dev` → http://localhost:3000

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Chequeo de tipos (tsc) |
| `npm run db:types` | Regenera `types/database.types.ts` desde Supabase |

## Documentación

- `docs/ARCHITECTURE.md` — arquitectura y estructura del proyecto.
- `docs/DATABASE.md` — modelo de datos.
- `docs/AUTH.md` — autenticación y autorización (RLS/RBAC).
- `docs/CHATBOT.md` — chatbot IA con OpenRouter + tool calling.
- `docs/ROADMAP.md` — plan de desarrollo por módulos y estado.

> **OneDrive:** este proyecto vive dentro de OneDrive. Para evitar que la
> sincronización interfiera con `node_modules`/`.next`, pausa OneDrive mientras
> desarrollas o excluye esas carpetas de la sincronización.
