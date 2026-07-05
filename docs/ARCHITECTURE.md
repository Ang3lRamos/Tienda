# Arquitectura del sistema

Tienda online de ropa · Next.js 15 (App Router) + Supabase + IA (OpenRouter).

## 1. Visión general

```
┌──────────────────────────────────────────────────────────────┐
│                        Cliente (navegador)                     │
│  React 19 · Server + Client Components · Zustand · TanStack Q   │
└───────────────┬───────────────────────────────┬───────────────┘
                │ HTTP/RSC                        │ WebSocket (Realtime)
┌───────────────▼───────────────────────────────▼───────────────┐
│                    Next.js 15 (App Router)                     │
│  ┌────────────┐  ┌───────────────┐  ┌───────────────────────┐  │
│  │  Server    │  │ Server Actions│  │  Route Handlers (API) │  │
│  │ Components │  │  (mutaciones) │  │  /api/chat  /api/...   │  │
│  └─────┬──────┘  └───────┬───────┘  └───────────┬───────────┘  │
│        │  middleware.ts (sesión + protección de rutas)         │
└────────┼─────────────────┼──────────────────────┼─────────────┘
         │ anon key + RLS   │ anon/service          │ service role
┌────────▼─────────────────▼──────────────────────▼─────────────┐
│                          Supabase                              │
│   Postgres + RLS · Auth (JWT) · Storage · Realtime             │
└────────────────────────────────────────────────────────────────┘
                                     ▲
                                     │ Tool Calling (function calling)
                          ┌──────────┴───────────┐
                          │   OpenRouter (LLM)   │
                          │  modelo gratuito      │
                          └──────────────────────┘
```

**Principio clave:** el navegador nunca habla directo con la BD para operaciones
sensibles. Todo pasa por Server Components (lectura), Server Actions (mutaciones)
o Route Handlers (API/IA), y toda tabla está protegida por **RLS**. El LLM nunca
recibe acceso a la BD: sólo puede pedir datos a través de *herramientas* que
ejecutamos nosotros en el servidor.

## 2. Capas (Clean Architecture)

| Capa | Carpeta | Responsabilidad |
|------|---------|-----------------|
| Presentación | `app/`, `components/`, `features/*/components` | UI, RSC, layouts |
| Aplicación | `features/*/actions`, `services/` | Casos de uso, orquestación |
| Dominio | `schemas/`, `types/` | Contratos (Zod) y tipos |
| Infraestructura | `lib/supabase`, `lib/openrouter` | Acceso a datos y APIs externas |

Reglas SOLID aplicadas:
- **S**: cada `service` hace una sola cosa (p.ej. `products.service.ts`).
- **D**: la UI depende de servicios/abstracciones, no de `supabase-js` directo.
- Validación en el borde con **Zod** (formularios + Server Actions + tool args).

## 3. Estructura de carpetas

```
app/
  (shop)/            → tienda pública (landing, catálogo, producto, carrito…)
  (auth)/            → login, registro, recuperar contraseña
  (admin)/admin/     → dashboard protegido (rol admin/staff)
  api/               → route handlers (/api/chat, webhooks futuros)
components/
  ui/                → primitivos shadcn (button, input, dialog…)
  layout/            → navbar, footer, sidebars
  shared/            → componentes reutilizables (ProductCard, Price…)
  providers/         → Theme, QueryClient, Toaster
features/            → módulos verticales (products, cart, chatbot, orders…)
  <modulo>/
    components/      → UI del módulo
    actions.ts       → Server Actions (mutaciones)
    queries.ts       → lecturas (Server Components)
    hooks.ts         → hooks de cliente (TanStack Query / Zustand)
hooks/               → hooks genéricos (useMediaQuery, useDebounce…)
lib/                 → infraestructura (supabase, openrouter, utils)
services/            → lógica de dominio reutilizable entre módulos
store/               → stores Zustand (cart, ui, recentlyViewed)
schemas/             → esquemas Zod (validación)
types/               → tipos TS + database.types.ts
config/              → env, site config, navegación
supabase/migrations/ → SQL versionado del esquema
docs/                → esta documentación
```

## 4. Estrategia de rendimiento

- **Server Components por defecto**; `'use client'` sólo donde hay interacción.
- **Server Actions** para mutaciones (sin endpoints REST manuales).
- **next/image** para optimización de imágenes + `remotePatterns`.
- **Paginación + infinite scroll** en catálogo (rango con `range()` de Supabase).
- **TanStack Query** para caché de cliente e invalidación fina.
- **Streaming/Suspense** en secciones pesadas de la landing.
- **SEO**: `generateMetadata`, `sitemap.ts`, `robots.ts`, Open Graph.

## 5. Estrategia de desarrollo por módulos

Cada módulo se entrega **completo y funcional** antes de pasar al siguiente.
Ver `docs/ROADMAP.md` para el orden y el estado.
