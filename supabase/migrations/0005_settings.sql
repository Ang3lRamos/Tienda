-- =====================================================================
-- 0005 — Configuración de la tienda editable desde el panel
-- Tabla "singleton" (una sola fila, id = 1) con los parámetros de negocio
-- que hoy estaban fijos en el código: envío, impuestos y textos.
-- Ejecuta este archivo en tu proyecto Supabase (SQL Editor o CLI).
-- =====================================================================

create table if not exists store_settings (
  id                      int primary key default 1 check (id = 1),
  shipping_cost           numeric(12,2) not null default 15000,
  free_shipping_threshold numeric(12,2) not null default 200000,
  tax_rate                numeric(5,2)  not null default 0,      -- % sobre el subtotal
  store_name              text not null default 'Átelier',
  contact_email           text,
  contact_phone           text,
  announcement            text,                                   -- barra superior
  updated_at              timestamptz not null default now()
);

comment on column store_settings.tax_rate    is 'Porcentaje aplicado al subtotal tras descuentos (0 = sin impuestos)';
comment on column store_settings.announcement is 'Primer mensaje de la barra de anuncios de la tienda';

-- Fila única inicial.
insert into store_settings (id) values (1) on conflict (id) do nothing;

-- updated_at automático (la función ya existe desde 0001).
drop trigger if exists trg_store_settings_updated on store_settings;
create trigger trg_store_settings_updated before update on store_settings
  for each row execute function set_updated_at();

-- RLS: cualquiera puede leer (la tienda necesita los costes de envío);
-- solo un admin puede escribir.
alter table store_settings enable row level security;

drop policy if exists "settings_public_read" on store_settings;
create policy "settings_public_read" on store_settings
  for select using (true);

drop policy if exists "settings_admin_write" on store_settings;
create policy "settings_admin_write" on store_settings
  for all using (public.is_admin()) with check (public.is_admin());
