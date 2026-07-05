-- =====================================================================
-- 0002_rls.sql — Row Level Security (RLS) y automatismos de auth
-- =====================================================================

-- --------------------------------------------------------------------
-- Helpers de rol (SECURITY DEFINER para evitar recursión en policies)
-- --------------------------------------------------------------------
create or replace function public.current_role_name()
returns text language sql stable security definer set search_path = public as $$
  select r.name
  from profiles p
  join roles r on r.id = p.role_id
  where p.id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() in ('admin', 'staff'), false);
$$;

-- --------------------------------------------------------------------
-- Alta automática de perfil al registrarse (auth.users -> profiles)
-- Asigna el rol 'customer' por defecto.
-- --------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_customer_role uuid;
begin
  select id into v_customer_role from roles where name = 'customer' limit 1;
  insert into public.profiles (id, email, full_name, role_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    v_customer_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------------------------------
-- Activar RLS en todas las tablas
-- --------------------------------------------------------------------
alter table roles                   enable row level security;
alter table permissions             enable row level security;
alter table role_permissions        enable row level security;
alter table profiles                enable row level security;
alter table addresses               enable row level security;
alter table categories              enable row level security;
alter table brands                  enable row level security;
alter table products                enable row level security;
alter table product_variants        enable row level security;
alter table product_images          enable row level security;
alter table inventory               enable row level security;
alter table inventory_movements     enable row level security;
alter table promotions              enable row level security;
alter table coupons                 enable row level security;
alter table carts                   enable row level security;
alter table cart_items              enable row level security;
alter table wishlist                enable row level security;
alter table recently_viewed         enable row level security;
alter table orders                  enable row level security;
alter table order_items             enable row level security;
alter table reviews                 enable row level security;
alter table chatbot_conversations   enable row level security;
alter table chatbot_messages        enable row level security;
alter table notifications           enable row level security;
alter table activity_logs           enable row level security;
alter table newsletter_subscribers  enable row level security;

-- =====================================================================
-- CATÁLOGO PÚBLICO — lectura para todos; escritura sólo admin/staff
-- =====================================================================
create policy "cat_public_read" on categories for select using (true);
create policy "cat_admin_write" on categories for all using (public.is_admin()) with check (public.is_admin());

create policy "brand_public_read" on brands for select using (true);
create policy "brand_admin_write" on brands for all using (public.is_admin()) with check (public.is_admin());

-- Productos: público ve sólo 'published'; admin ve todo y escribe.
create policy "prod_public_read"  on products for select using (status = 'published' or public.is_admin());
create policy "prod_admin_write"  on products for all using (public.is_admin()) with check (public.is_admin());

create policy "variant_public_read" on product_variants for select using (true);
create policy "variant_admin_write" on product_variants for all using (public.is_admin()) with check (public.is_admin());

create policy "img_public_read" on product_images for select using (true);
create policy "img_admin_write" on product_images for all using (public.is_admin()) with check (public.is_admin());

create policy "inv_public_read" on inventory for select using (true);
create policy "inv_admin_write" on inventory for all using (public.is_admin()) with check (public.is_admin());

create policy "mov_admin_all" on inventory_movements for all using (public.is_admin()) with check (public.is_admin());

-- Promociones/cupones: lectura pública de activos; gestión admin.
create policy "promo_public_read" on promotions for select using (is_active or public.is_admin());
create policy "promo_admin_write" on promotions for all using (public.is_admin()) with check (public.is_admin());

create policy "coupon_admin_all" on coupons for all using (public.is_admin()) with check (public.is_admin());
-- (La validación de cupón para clientes se hace vía función RPC SECURITY DEFINER.)

-- =====================================================================
-- RBAC — sólo admin gestiona roles/permisos
-- =====================================================================
create policy "roles_admin_all" on roles for all using (public.is_admin()) with check (public.is_admin());
create policy "perms_admin_all" on permissions for all using (public.is_admin()) with check (public.is_admin());
create policy "roleperms_admin_all" on role_permissions for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- PERFILES — cada quien el suyo; admin todos
-- =====================================================================
create policy "profile_self_read"   on profiles for select using (id = auth.uid() or public.is_admin());
create policy "profile_self_update" on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profile_admin_all"   on profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "addr_owner_all" on addresses for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- =====================================================================
-- CARRITO / WISHLIST / RECIENTES — privados del dueño
-- =====================================================================
create policy "cart_owner_all" on carts for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "cartitem_owner_all" on cart_items for all
  using (exists (select 1 from carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_admin())))
  with check (exists (select 1 from carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_admin())));

create policy "wishlist_owner_all" on wishlist for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

create policy "recent_owner_all" on recently_viewed for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- =====================================================================
-- PEDIDOS — el cliente ve/crea los suyos; admin todo
-- =====================================================================
create policy "order_owner_read"   on orders for select using (user_id = auth.uid() or public.is_admin());
create policy "order_owner_insert" on orders for insert with check (user_id = auth.uid());
create policy "order_admin_all"    on orders for all using (public.is_admin()) with check (public.is_admin());

create policy "orderitem_owner_read" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "orderitem_admin_all" on order_items for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- RESEÑAS — lectura pública de aprobadas; el autor gestiona la suya
-- =====================================================================
create policy "review_public_read" on reviews for select using (is_approved or user_id = auth.uid() or public.is_admin());
create policy "review_author_write" on reviews for insert with check (user_id = auth.uid());
create policy "review_author_update" on reviews for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "review_admin_all" on reviews for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- CHATBOT — el dueño ve su conversación; admin analítica global
-- =====================================================================
create policy "chatconv_owner_all" on chatbot_conversations for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or user_id is null or public.is_admin());

create policy "chatmsg_owner_all" on chatbot_messages for all
  using (exists (select 1 from chatbot_conversations c where c.id = conversation_id and (c.user_id = auth.uid() or public.is_admin())))
  with check (exists (select 1 from chatbot_conversations c where c.id = conversation_id and (c.user_id = auth.uid() or c.user_id is null or public.is_admin())));

-- =====================================================================
-- NOTIFICACIONES / LOGS / NEWSLETTER
-- =====================================================================
create policy "notif_owner_all" on notifications for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "logs_admin_read" on activity_logs for select using (public.is_admin());
create policy "logs_insert_any" on activity_logs for insert with check (true);

create policy "news_public_insert" on newsletter_subscribers for insert with check (true);
create policy "news_admin_read"    on newsletter_subscribers for select using (public.is_admin());
