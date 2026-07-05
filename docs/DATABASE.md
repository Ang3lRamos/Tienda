# Modelo de datos

Fuente de verdad: `supabase/migrations/0001_schema.sql`. Todo el modelo está en
PostgreSQL con RLS. Diagrama de relaciones (resumen):

```
auth.users ──1:1── profiles ──*── addresses
                     │  └── role_id ──> roles ──*── role_permissions ──> permissions
                     ├──*── carts ──*── cart_items ──> product_variants
                     ├──*── wishlist ──> products
                     ├──*── orders ──*── order_items
                     ├──*── reviews ──> products
                     └──*── notifications / chatbot_conversations

categories ──*── products ──*── product_variants ──1:1── inventory ──*── inventory_movements
   (self-parent)     │              └── product_images
brands ──────────────┘
promotions / coupons        newsletter_subscribers        activity_logs
```

## Decisiones de diseño

- **Stock por variante:** el inventario vive en `inventory` (1:1 con
  `product_variants`), nunca en `products`. Cada variante tiene su propio SKU,
  color, talla y stock independiente. La vista `products_with_stock` agrega el
  stock por producto y deriva el estado: `disponible` / `ultimas_unidades` /
  `agotado`.
- **Precios:** `products.base_price` es el precio; `compare_at_price` es el
  "precio anterior" (si existe y es mayor, el producto está en oferta). Una
  variante puede sobreescribir el precio con `product_variants.price`.
- **Movimientos de inventario:** `apply_inventory_movement()` actualiza el stock
  y registra el movimiento de forma transaccional (entradas, salidas, ajustes,
  reservas). Alimenta el historial y las alertas de bajo inventario.
- **Snapshot de pedidos:** `order_items` guarda nombre, SKU y precio en el
  momento de la compra, para que el histórico no cambie si el catálogo cambia.
- **Búsqueda inteligente:** `products.search_vector` (tsvector generado con
  pesos A–D sobre nombre, keywords, material y descripción) + índice GIN, y un
  índice trigram sobre `name` para tolerancia a errores tipográficos.
- **RBAC:** `roles` + `permissions` + `role_permissions`; el rol se referencia
  desde `profiles.role_id`. Helper `is_admin()` para las policies.
- **Chatbot:** `chatbot_conversations` + `chatbot_messages` (con `tool_calls` y
  `referenced_products`) sostienen memoria y la analítica del Dashboard de IA.

## Estados (enums)

- `product_status`: draft · published · archived
- `product_gender`: men · women · unisex · kids
- `order_status`: pending · paid · processing · shipped · delivered · cancelled · refunded
- `payment_status`: pending · paid · failed · refunded
- `movement_type`: in · out · adjustment · reservation · release
- `discount_type`: percentage · fixed
- `promotion_scope`: all · category · brand · product

## Regenerar tipos

Tras aplicar migraciones en tu proyecto:
```
npm run db:types   # supabase gen types typescript --local > types/database.types.ts
```
