-- =====================================================================
-- 0004 — Pasarela de pagos (Addi y futuros proveedores)
-- Añade a `orders` el método y la referencia externa del pago.
-- Ejecuta este archivo en tu proyecto Supabase (SQL Editor o CLI).
-- =====================================================================

alter table orders
  add column if not exists payment_method    text not null default 'cod',
  add column if not exists payment_reference text,
  add column if not exists payment_provider  text;

comment on column orders.payment_method    is 'Método elegido: cod | addi | card | pse';
comment on column orders.payment_reference is 'Identificador del pago en la pasarela (p. ej. applicationId de Addi)';
comment on column orders.payment_provider  is 'Proveedor que procesó el pago (p. ej. addi)';

create index if not exists idx_orders_payment_reference on orders(payment_reference);
