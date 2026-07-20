-- =====================================================================
-- 0006 — Canje de cupones
--
-- `coupons.used_count` existía desde 0001 pero nadie lo incrementaba: se
-- leía al validar y se mostraba en el panel, así que `max_uses` no se
-- alcanzaba nunca y el límite era decorativo.
--
-- El incremento debe ser atómico: dos compras simultáneas con el mismo
-- cupón podrían superar el tope si se hiciera con un read-modify-write
-- desde la aplicación. Por eso se resuelve en una sola sentencia SQL, que
-- además vuelve a comprobar el límite dentro del propio UPDATE.
-- =====================================================================

-- Canjea un cupón. Devuelve true si se pudo (y lo incrementa), false si ya
-- estaba agotado, inactivo o fuera de vigencia.
create or replace function public.redeem_coupon(p_coupon_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated int;
begin
  update coupons
     set used_count = used_count + 1
   where id = p_coupon_id
     and is_active
     and (starts_at is null or starts_at <= now())
     and (ends_at   is null or ends_at   >= now())
     and (max_uses  is null or used_count < max_uses);

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

comment on function public.redeem_coupon(uuid) is
  'Incrementa used_count de forma atómica respetando max_uses y la vigencia. false si el cupón ya no es canjeable.';

-- Devuelve el canje al deshacer una compra (pago fallido o pedido
-- eliminado), para que el cupón no quede consumido sin venta detrás.
create or replace function public.release_coupon(p_coupon_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update coupons
     set used_count = greatest(0, used_count - 1)
   where id = p_coupon_id;
$$;

comment on function public.release_coupon(uuid) is
  'Revierte un canje al anular la compra. Nunca deja used_count negativo.';

-- Sólo el backend autenticado necesita invocarlas.
revoke all on function public.redeem_coupon(uuid)  from anon;
revoke all on function public.release_coupon(uuid) from anon;

-- Consulta del límite por usuario: cuántos pedidos vivos tiene ya este
-- usuario con este cupón (los cancelados no cuentan).
create index if not exists idx_orders_coupon_user on orders(coupon_id, user_id);
