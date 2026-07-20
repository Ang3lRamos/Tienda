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
- ✅ Sincronización carrito/wishlist con Supabase (ver post-lanzamiento)
- ✅ Comparador de productos (ver post-lanzamiento)

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
- ✅ Gestión de variantes/imágenes por UI y creación de promos/cupones
  (completado en post-lanzamiento, ver abajo)

## Fase 9 — Pulido y producción ✅
- ✅ SEO: `sitemap.ts` dinámico (productos/categorías), `robots.ts`,
  `manifest.ts`, imagen Open Graph de marca (`opengraph-image.tsx`)
- ✅ Páginas 404 (raíz + tienda) y `error.tsx`; skeletons de carga
- ✅ Accesibilidad: skip link, `id` de contenido, `lang=es`, focus states
- ✅ Notificaciones en tiempo real (Supabase Realtime) para nuevos pedidos
- ✅ `npm run build` limpio; verificado en vivo (robots/sitemap/OG/404)

---

## Estado: TODAS LAS FASES COMPLETADAS ✅

### Post-lanzamiento
- ✅ Gestión completa de productos por UI: variantes (color/talla/SKU/precio/stock)
  e imágenes desde el panel → producto comprable de punta a punta
  (verificado E2E: admin crea producto → queda publicado y disponible)

- ✅ Subida de imágenes a Supabase Storage (bucket `product-images`, endpoint
  `/api/admin/upload-image` con auth admin; botón "Subir" en el formulario) —
  verificado E2E (archivo sube al bucket y queda en el producto)

- ✅ Creación/edición de promociones y cupones desde el panel (CRUD completo +
  activar/desactivar) — verificado E2E; los cupones aplican en el checkout

- ✅ Sincronización carrito/wishlist con Supabase: fusión al iniciar sesión +
  guardado con debounce; persisten entre dispositivos (verificado E2E)

- ✅ Cuenta de usuario completa: edición de perfil (nombre/teléfono), CRUD de
  direcciones (predeterminada) y su uso en el checkout, cancelación de pedidos
  (con reposición de stock), y estados de pedido/pago en español (helper
  compartido en `lib/utils`).

- ✅ Reseñas: los compradores pueden opinar/editar su reseña (verificación de
  compra) y el panel las modera (`/admin/resenas`: aprobar/ocultar/eliminar).

- ✅ Admin: detalle de pedido (`/admin/pedidos/[orderNumber]` con artículos,
  cliente, envío y totales) y estados en español en las tablas.

- ✅ Pago con **Addi** (BNPL Colombia): capa `services/payments` con proveedor
  Addi (OAuth2 client_credentials + Web Checkout con redirección), webhook
  `/api/payments/addi/webhook` (aprueba/rechaza + repone stock), selector en el
  checkout y retorno en `/pedido/[n]?addi=`. Migración `0004_payments.sql`
  (columnas `payment_method`/`payment_reference`/`payment_provider` en orders).
  Requiere correr `0004` en Supabase y definir las variables `ADDI_*`; los
  endpoints/campos exactos los entrega Addi en el onboarding (sandbox por
  defecto). Sin credenciales, el checkout sigue operando con "contra entrega".

- ✅ Comparador de productos: selección desde tarjeta y ficha (máx. 4), barra
  flotante con los elegidos y tabla comparativa en /comparar (precio, descuento,
  marca, categoría, género, valoración, stock, colores y tallas), con la
  selección persistida y resaltado del más barato y el mejor valorado.

- ✅ Configuración de la tienda editable desde `/admin/configuracion` (envío,
  umbral de envío gratis, impuestos, datos de contacto, anuncio de la barra
  superior). Migración `0005_settings.sql` — tabla singleton `store_settings`
  con lectura pública y escritura sólo admin. El checkout recalcula siempre en
  servidor; si la migración no se ha corrido, se usan valores por defecto.

### Pendientes detectados en la revisión (2026-07-20)

Bloqueantes para abrir al público:

- ✅ **Páginas de contenido del footer** (ya no hay enlaces rotos): `/ayuda/envios`
  (lee el costo y el umbral de envío gratis de `store_settings`, así que nunca
  contradice al checkout), `/ayuda/devoluciones`, `/ayuda/tallas` (tablas con el
  patrón responsive tarjetas-móvil/tabla-escritorio), `/sobre-nosotros`,
  `/sostenibilidad`, `/contacto` (usa el correo/teléfono del panel) y `/empleo`.
  Maqueta común en `components/shared/content-page.tsx`.
- ✅ **Páginas legales**: `/legal/terminos`, `/legal/privacidad` y
  `/legal/tratamiento-datos` (Ley 1581 de 2012 y Estatuto del Consumidor).
  Enlazadas en la barra inferior del footer y añadidas al `sitemap.ts`.
  ⚠️ **Son una plantilla de partida**: hay que completar `config/legal.ts`
  (razón social, NIT, domicilio, ciudad) y someterlas a revisión legal. Mientras
  falten datos, las tres páginas muestran un aviso visible de "documento sin
  finalizar".
- ✅ **Correos transaccionales**: capa desacoplada en `services/email` con el
  mismo patrón que `services/payments` (interfaz `EmailProvider` + registro;
  proveedor Resend sobre su API REST, sin dependencias nuevas).
  - Plantillas HTML con tablas y estilos en línea (`templates.ts`):
    confirmación de pedido (resumen, totales, dirección) y cambio de estado
    (`processing`, `shipped`, `delivered`, `cancelled`, `refunded`).
  - Enganches: `createOrderAction` (confirmación tras crear el pedido),
    `updateOrderStatus` del panel (aviso de cambio de estado) y el webhook de
    Addi (confirma al aprobarse el pago; avisa de cancelación si se rechaza).
  - **Best-effort por diseño**: `sendEmail` nunca lanza. Sin `RESEND_API_KEY`
    los envíos se omiten y se registran, y la tienda opera igual.
  - Env: `RESEND_API_KEY`, `EMAIL_FROM` (dominio verificado en Resend) y
    `EMAIL_REPLY_TO` (opcional).
  - Verificado: plantillas renderizadas (totales y descuento correctos, envío
    gratis), degradación sin proveedor, y que la consulta `orders → profiles`
    resuelve y los perfiles tienen correo. **Falta un envío real end-to-end**:
    requiere credenciales de Resend y un pedido de prueba.

No bloqueantes:

- ✅ Redes sociales del footer: se acabaron los `href="#"`. `config/site.ts`
  tiene `socialLinks` (todas en `null` por ahora); el footer sólo pinta las
  redes definidas y, si no hay ninguna, oculta la columna "Síguenos". Los
  iconos abren en pestaña nueva con `rel="noopener noreferrer me"`.
- ✅ Canje de cupones real (migración `0006_coupon_redemption.sql`, **el
  usuario debe correrla**). `used_count` no se incrementaba en ningún sitio,
  así que `max_uses` y `per_user_limit` eran decorativos. Ahora: RPC
  `redeem_coupon` (incremento atómico que revalida el tope dentro del propio
  UPDATE) al crear el pedido, `release_coupon` al deshacerlo (pago fallido,
  rechazo de Addi, cancelación del usuario), y `hasCouponQuotaLeft` comprueba
  el límite por usuario contando sus pedidos no cancelados. Si la migración
  aún no está aplicada, el checkout detecta `PGRST202` y deja pasar la compra
  sin canjear (fail-safe, igual que la tienda opera sin 0005). El cupón
  `BIENVENIDO10` quedó acotado: caduca 2026-10-20, máx. 200 usos, 1 por
  usuario. Cubierto por `tests/coupon.test.ts`.
- ⬜ Compra como invitado: hoy hay que tener cuenta. El flujo es correcto
  (el middleware redirige a `/login?redirect=/checkout` y tras entrar se
  vuelve al checkout), así que esto es una decisión de producto, no un fallo.
- ✅ Tests automatizados con **Vitest** (`npm test`, `npm run test:watch`).
  40 tests sobre la lógica pura donde un fallo cuesta dinero o rompe un
  correo: `computeTotals` (envío, umbral, descuentos, impuestos, redondeo a
  pesos enteros), utilidades compartidas (`formatPrice`, `slugify`,
  etiquetas de estado, `isCancellableStatus`) y las plantillas de correo
  (totales, filas condicionales, escapado de HTML, URLs absolutas).
  `vitest.config.ts` inyecta variables de entorno ficticias, porque
  `config/env.ts` valida el entorno al importarse, y sustituye `server-only`
  por un stub. Comprobado por mutación: al aplicar el impuesto sobre el
  subtotal bruto, la suite falla.
  Pendiente: no hay tests de integración ni E2E (Server Actions, RLS y
  checkout completo siguen verificándose a mano).
- ⬜ Addi: el mapeo de endpoints/campos no está probado contra el entorno real.
- ⬜ `NEXT_PUBLIC_SITE_URL` apunta a una URL de deploy con hash; debe ser el
  dominio estable (afecta a `emailRedirectTo`, callbacks de Addi, sitemap y OG).
