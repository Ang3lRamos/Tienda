# Roadmap de desarrollo por módulos

Cada módulo se entrega **completo y funcional** antes de avanzar. Estado:
✅ hecho · 🔨 en progreso · ⬜ pendiente.

## Fase 0 — Fundaciones ✅
- ✅ Proyecto Next.js 15 + TS + Tailwind v4
- ✅ Estructura de carpetas modular
- ✅ Esquema de BD completo (`supabase/migrations/0001..0003`)
- ✅ RLS en todas las tablas + RBAC (roles/permisos)
- ✅ Clientes Supabase (browser/server/admin) + middleware de sesión
- ✅ Validación de entorno (Zod) + `.env.example`
- ✅ Documentación (arquitectura, auth, chatbot, BD)
- ✅ Sistema de diseño base (tokens, tema claro/oscuro, primitivos UI)

## Fase 1 — Design system y layout de tienda ✅
- ✅ Tokens de color/tipografía, modo oscuro (`next-themes`)
- ✅ Primitivos shadcn (button, input, badge, skeleton, sheet, separator, dropdown)
- ✅ Navbar fija + buscador + menú móvil + Footer + newsletter
- ✅ Componentes compartidos: `ProductCard`, `Price`, `StockBadge`, `Rating`, `FavoriteButton`

## Fase 2 — Autenticación ✅
- ✅ Login, registro, recuperar y actualizar contraseña, callback OAuth
- ✅ Server Actions + validación Zod (cliente y servidor) + manejo de errores
- ✅ Google OAuth cableado (opcional, requiere activar proveedor en Supabase)
- ✅ Área de cuenta (perfil + navegación) protegida; navbar consciente de sesión
- ✅ Patrón de consultas `.ts` con tipo explícito (evita bailout a `never` en TSX)

## Fase 3 — Catálogo y producto ✅
- ✅ Listado con filtros (categoría, marca, género, precio, color, talla,
  ofertas) + orden (nuevos/precio/vendidos/destacados) + paginación
- ✅ Buscador inteligente (full-text `search_vector`, config español)
- ✅ Página de producto: galería + zoom, variantes (color/talla + stock),
  relacionados, reseñas
- ✅ Acciones: añadir al carrito / comprar ahora (stub → Fase 4), favoritos
- ✅ Página de categorías; landing conectada a datos reales de Supabase
- ✅ Verificado end-to-end contra la BD real (filtros, búsqueda, 404)

## Fase 4 — Carrito, favoritos y extras ⬜
- Carrito (Zustand + persistencia + sincronización con BD al iniciar sesión)
- Wishlist / favoritos, comparador, vistos recientemente
- Newsletter

## Fase 5 — Landing page ⬜
- Hero, banner promocional, categorías, nueva colección, destacados,
  más vendidos, ofertas, testimonios, newsletter, FAQ, footer

## Fase 6 — Chatbot IA ⬜
- `/api/chat` con OpenRouter + bucle de tool calling
- Herramientas de catálogo (search, details, availability, sale, best-sellers…)
- Widget flotante con memoria, sugerencias rápidas y tarjetas de producto

## Fase 7 — Checkout (estructura para pagos) ⬜
- Flujo de checkout, creación de pedido, reserva de stock
- Estructura desacoplada lista para integrar pasarela (Stripe/MercadoPago…)

## Fase 8 — Panel de administración ⬜
- Dashboard (KPIs + gráficas Recharts)
- CRUD: productos (+variantes/imágenes), categorías, marcas
- Inventario (movimientos, alertas), pedidos, clientes, usuarios/roles
- Promociones/cupones, Dashboard de IA, configuración

## Fase 9 — Pulido y producción ⬜
- SEO (sitemap, robots, OG), accesibilidad, animaciones (Framer Motion)
- Notificaciones en tiempo real (Supabase Realtime)
- Tests, optimización, `npm run build` limpio
