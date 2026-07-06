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

## Fase 4 — Carrito, favoritos y extras ✅
- ✅ Carrito (Zustand + persistencia local): drawer global + página /carrito,
  cantidades, totales, badge en navbar; botones de producto activados
- ✅ Wishlist/favoritos reales (store persistido) + /favoritos + cuenta
- ✅ Vistos recientemente (store) en la página de producto
- ✅ Newsletter funcional (insert en `newsletter_subscribers` vía Server Action)
- ⬜ Sincronización carrito/wishlist con Supabase (se hará junto al checkout)
- ⬜ Comparador de productos (pendiente)

## Fase 5 — Landing page ✅
- ✅ Hero full-bleed, marquee, categorías, nueva colección, más vendidos,
  ofertas, banner promocional (promoción activa desde BD), banner editorial,
  testimonios, FAQ (accordion), newsletter, footer
- ✅ Componentes reutilizables: ProductShowcase, PromoBanner, Testimonials, FAQ

## Fase 6 — Chatbot IA ✅
- ✅ `/api/chat` con OpenRouter + bucle de tool calling (5 pasos) + persistencia
- ✅ Herramientas: search_products, get_product_details, get_best_sellers,
  get_products_on_sale, list_categories_brands (consultan Supabase, datos reales)
- ✅ Widget flotante con memoria, sugerencias rápidas y tarjetas de producto
- ✅ Fallback automático entre modelos gratuitos (429) — default gpt-oss-20b:free
- ✅ Verificado en vivo: ofertas, más vendido, búsqueda, stock por variante

## Fase 7 — Checkout (estructura para pagos) ✅
- ✅ Flujo /checkout (envío + pago) con validación server-side de stock/precios
- ✅ Creación de pedido (orders/order_items snapshot) + descuento de stock
  transaccional (apply_inventory_movement); cupones
- ✅ Confirmación /pedido/[n]; account/pedidos con pedidos reales
- ✅ Capa de pagos desacoplada (services/payments) lista para Stripe/MercadoPago;
  método "contra entrega" operativo
- ✅ Verificado contra la BD real (order + item + RPC de inventario)

## Fase 8 — Panel de administración ✅
- ✅ Layout con sidebar + Dashboard (KPIs reales + gráfica Recharts + top ventas)
- ✅ Productos: CRUD de ficha (list + crear/editar/eliminar/estado)
- ✅ Categorías y Marcas: CRUD completo
- ✅ Inventario: ajustes de stock (entradas/salidas vía RPC + historial)
- ✅ Pedidos: lista + cambio de estado
- ✅ Clientes (lectura), Usuarios/roles (cambio de rol, solo admin)
- ✅ Promociones: lista + activar/desactivar
- ✅ Dashboard de IA: conversaciones, mensajes, productos más consultados
- ✅ Configuración (base). Verificado: consultas válidas + rutas protegidas
- ⬜ Gestión de variantes/imágenes por UI y creación de promos/cupones (pendiente)

## Fase 9 — Pulido y producción ⬜
- SEO (sitemap, robots, OG), accesibilidad, animaciones (Framer Motion)
- Notificaciones en tiempo real (Supabase Realtime)
- Tests, optimización, `npm run build` limpio
