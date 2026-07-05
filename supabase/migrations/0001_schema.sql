  -- =====================================================================
  -- 0001_schema.sql — Esquema principal de la tienda de moda
  -- Tienda online de ropa · PostgreSQL (Supabase)
  -- =====================================================================
  -- Convenciones:
  --   * Todas las PK son uuid (gen_random_uuid()).
  --   * created_at / updated_at en timestamptz.
  --   * updated_at se mantiene con el trigger set_updated_at().
  --   * Los precios se guardan en numeric(12,2) (moneda con 2 decimales).
  --   * El stock NUNCA se guarda en products: vive en inventory por variante.
  -- =====================================================================

  -- --------------------------------------------------------------------
  -- Extensiones
  -- --------------------------------------------------------------------
  create extension if not exists "pgcrypto";      -- gen_random_uuid()
  create extension if not exists "citext";        -- emails case-insensitive
  create extension if not exists "pg_trgm";       -- búsqueda difusa (fuzzy)

  -- --------------------------------------------------------------------
  -- Tipos enumerados
  -- --------------------------------------------------------------------
  create type product_status  as enum ('draft', 'published', 'archived');
  create type product_gender  as enum ('men', 'women', 'unisex', 'kids');
  create type order_status     as enum ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
  create type payment_status   as enum ('pending', 'paid', 'failed', 'refunded');
  create type movement_type    as enum ('in', 'out', 'adjustment', 'reservation', 'release');
  create type discount_type    as enum ('percentage', 'fixed');
  create type promotion_scope  as enum ('all', 'category', 'brand', 'product');
  create type chat_role        as enum ('system', 'user', 'assistant', 'tool');
  create type notification_type as enum ('order', 'promotion', 'stock', 'system', 'account');

  -- --------------------------------------------------------------------
  -- Helper: trigger para updated_at
  -- --------------------------------------------------------------------
  create or replace function set_updated_at()
  returns trigger language plpgsql as $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$;

  -- =====================================================================
  -- RBAC: roles, permisos y perfiles
  -- =====================================================================

  create table roles (
    id          uuid primary key default gen_random_uuid(),
    name        text not null unique,            -- 'admin', 'staff', 'customer'
    description text,
    created_at  timestamptz not null default now()
  );

  create table permissions (
    id          uuid primary key default gen_random_uuid(),
    code        text not null unique,            -- 'products.write', 'orders.read'...
    description text,
    created_at  timestamptz not null default now()
  );

  create table role_permissions (
    role_id       uuid not null references roles(id) on delete cascade,
    permission_id uuid not null references permissions(id) on delete cascade,
    primary key (role_id, permission_id)
  );

  -- profiles = espejo público de auth.users (Supabase gestiona credenciales)
  create table profiles (
    id         uuid primary key references auth.users(id) on delete cascade,
    role_id    uuid references roles(id) on delete set null,
    email      citext,
    full_name  text,
    phone      text,
    avatar_url text,
    is_active  boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  create trigger trg_profiles_updated before update on profiles
    for each row execute function set_updated_at();

  create table addresses (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references profiles(id) on delete cascade,
    label       text,                            -- 'Casa', 'Oficina'
    recipient   text not null,
    line1       text not null,
    line2       text,
    city        text not null,
    state       text,
    postal_code text,
    country     text not null default 'CO',
    phone       text,
    is_default  boolean not null default false,
    created_at  timestamptz not null default now()
  );
  create index idx_addresses_user on addresses(user_id);

  -- =====================================================================
  -- Catálogo: categorías, marcas, productos, variantes, imágenes
  -- =====================================================================

  create table categories (
    id            uuid primary key default gen_random_uuid(),
    name          text not null,
    slug          text not null unique,
    description   text,
    image_url     text,
    parent_id     uuid references categories(id) on delete set null,
    is_active     boolean not null default true,
    display_order int not null default 0,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
  );
  create trigger trg_categories_updated before update on categories
    for each row execute function set_updated_at();
  create index idx_categories_parent on categories(parent_id);

  create table brands (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    slug        text not null unique,
    description text,
    logo_url    text,
    is_active   boolean not null default true,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
  );
  create trigger trg_brands_updated before update on brands
    for each row execute function set_updated_at();

  create table products (
    id                 uuid primary key default gen_random_uuid(),
    name               text not null,
    slug               text not null unique,
    description        text,
    category_id        uuid references categories(id) on delete set null,
    brand_id           uuid references brands(id) on delete set null,
    gender             product_gender not null default 'unisex',
    base_price         numeric(12,2) not null check (base_price >= 0),
    compare_at_price   numeric(12,2) check (compare_at_price >= 0), -- precio anterior
    material           text,
    care_instructions  text,
    keywords           text[] not null default '{}',
    status             product_status not null default 'draft',
    is_featured        boolean not null default false,
    rating_avg         numeric(3,2) not null default 0,
    rating_count       int not null default 0,
    sold_count         int not null default 0,
    published_at       timestamptz,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now(),
    -- Vector de búsqueda inteligente (nombre + keywords + material + descripción).
    -- Se mantiene con un trigger (evita el requisito IMMUTABLE de las columnas
    -- generadas, que falla con to_tsvector según la config de la instancia).
    search_vector tsvector
  );
  create trigger trg_products_updated before update on products
    for each row execute function set_updated_at();

  -- Mantiene search_vector en cada insert/update de los campos relevantes.
  create or replace function products_search_vector_update()
  returns trigger language plpgsql as $$
  begin
    new.search_vector :=
      setweight(to_tsvector('spanish', coalesce(new.name, '')), 'A') ||
      setweight(to_tsvector('spanish', coalesce(array_to_string(new.keywords, ' '), '')), 'B') ||
      setweight(to_tsvector('spanish', coalesce(new.material, '')), 'C') ||
      setweight(to_tsvector('spanish', coalesce(new.description, '')), 'D');
    return new;
  end;
  $$;
  create trigger trg_products_search_vector
    before insert or update of name, keywords, material, description on products
    for each row execute function products_search_vector_update();
  create index idx_products_category on products(category_id);
  create index idx_products_brand    on products(brand_id);
  create index idx_products_status    on products(status);
  create index idx_products_gender    on products(gender);
  create index idx_products_featured  on products(is_featured) where is_featured;
  create index idx_products_price      on products(base_price);
  create index idx_products_search     on products using gin(search_vector);
  create index idx_products_name_trgm  on products using gin(name gin_trgm_ops);

  create table product_variants (
    id         uuid primary key default gen_random_uuid(),
    product_id uuid not null references products(id) on delete cascade,
    sku        text not null unique,
    barcode    text unique,
    color      text,
    color_hex  text,                              -- p.ej. '#000000'
    size       text,                              -- 'S','M','L','XL','32','42'
    price      numeric(12,2) check (price >= 0),   -- override opcional del precio base
    image_url  text,                              -- imagen específica de la variante
    is_active  boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (product_id, color, size)
  );
  create trigger trg_variants_updated before update on product_variants
    for each row execute function set_updated_at();
  create index idx_variants_product on product_variants(product_id);
  create index idx_variants_color   on product_variants(color);
  create index idx_variants_size    on product_variants(size);

  create table product_images (
    id         uuid primary key default gen_random_uuid(),
    product_id uuid not null references products(id) on delete cascade,
    variant_id uuid references product_variants(id) on delete set null,
    url        text not null,
    alt        text,
    position   int not null default 0,
    is_primary boolean not null default false,
    created_at timestamptz not null default now()
  );
  create index idx_images_product on product_images(product_id);

  -- =====================================================================
  -- Inventario
  -- =====================================================================

  -- Stock 1:1 por variante. quantity = físico; reserved = en carritos/pedidos.
  create table inventory (
    id                  uuid primary key default gen_random_uuid(),
    variant_id          uuid not null unique references product_variants(id) on delete cascade,
    quantity            int not null default 0 check (quantity >= 0),
    reserved            int not null default 0 check (reserved >= 0),
    low_stock_threshold int not null default 5,
    updated_at          timestamptz not null default now()
  );
  create trigger trg_inventory_updated before update on inventory
    for each row execute function set_updated_at();

  create table inventory_movements (
    id                uuid primary key default gen_random_uuid(),
    variant_id        uuid not null references product_variants(id) on delete cascade,
    type              movement_type not null,
    quantity          int not null,               -- positivo=entrada, negativo=salida
    previous_quantity int not null,
    new_quantity      int not null,
    reason            text,
    reference         text,                        -- p.ej. nº de pedido
    created_by        uuid references profiles(id) on delete set null,
    created_at        timestamptz not null default now()
  );
  create index idx_movements_variant on inventory_movements(variant_id);
  create index idx_movements_created on inventory_movements(created_at desc);

  -- =====================================================================
  -- Promociones y cupones
  -- =====================================================================

  create table promotions (
    id               uuid primary key default gen_random_uuid(),
    name             text not null,
    description      text,
    type             discount_type not null,
    value            numeric(12,2) not null check (value >= 0),
    scope            promotion_scope not null default 'all',
    target_id        uuid,                          -- category_id / brand_id / product_id
    banner_image_url text,
    starts_at        timestamptz,
    ends_at          timestamptz,
    is_active        boolean not null default true,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
  );
  create trigger trg_promotions_updated before update on promotions
    for each row execute function set_updated_at();
  create index idx_promotions_active on promotions(is_active, starts_at, ends_at);

  create table coupons (
    id              uuid primary key default gen_random_uuid(),
    code            text not null unique,
    description     text,
    type            discount_type not null,
    value           numeric(12,2) not null check (value >= 0),
    min_purchase    numeric(12,2) not null default 0,
    max_uses        int,                            -- null = ilimitado
    used_count      int not null default 0,
    per_user_limit  int not null default 1,
    starts_at       timestamptz,
    ends_at         timestamptz,
    is_active       boolean not null default true,
    created_at      timestamptz not null default now()
  );

  -- =====================================================================
  -- Carrito y favoritos
  -- =====================================================================

  create table carts (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid unique references profiles(id) on delete cascade,
    session_id text,                               -- carritos anónimos (invitado)
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  create trigger trg_carts_updated before update on carts
    for each row execute function set_updated_at();
  create index idx_carts_session on carts(session_id);

  create table cart_items (
    id         uuid primary key default gen_random_uuid(),
    cart_id    uuid not null references carts(id) on delete cascade,
    variant_id uuid not null references product_variants(id) on delete cascade,
    quantity   int not null default 1 check (quantity > 0),
    added_at   timestamptz not null default now(),
    unique (cart_id, variant_id)
  );
  create index idx_cart_items_cart on cart_items(cart_id);

  create table wishlist (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null references profiles(id) on delete cascade,
    product_id uuid not null references products(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique (user_id, product_id)
  );
  create index idx_wishlist_user on wishlist(user_id);

  create table recently_viewed (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null references profiles(id) on delete cascade,
    product_id uuid not null references products(id) on delete cascade,
    viewed_at  timestamptz not null default now(),
    unique (user_id, product_id)
  );
  create index idx_recently_viewed_user on recently_viewed(user_id, viewed_at desc);

  -- =====================================================================
  -- Pedidos
  -- =====================================================================

  create table orders (
    id               uuid primary key default gen_random_uuid(),
    user_id          uuid references profiles(id) on delete set null,
    order_number     text not null unique,          -- 'ORD-2026-000123'
    status           order_status not null default 'pending',
    payment_status   payment_status not null default 'pending',
    subtotal         numeric(12,2) not null default 0,
    discount_total   numeric(12,2) not null default 0,
    shipping_total   numeric(12,2) not null default 0,
    tax_total        numeric(12,2) not null default 0,
    grand_total      numeric(12,2) not null default 0,
    coupon_id        uuid references coupons(id) on delete set null,
    shipping_address jsonb,
    billing_address  jsonb,
    notes            text,
    placed_at        timestamptz,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
  );
  create trigger trg_orders_updated before update on orders
    for each row execute function set_updated_at();
  create index idx_orders_user   on orders(user_id);
  create index idx_orders_status on orders(status);
  create index idx_orders_created on orders(created_at desc);

  -- Los ítems guardan un SNAPSHOT: aunque el producto cambie/desaparezca,
  -- el histórico del pedido permanece intacto.
  create table order_items (
    id            uuid primary key default gen_random_uuid(),
    order_id      uuid not null references orders(id) on delete cascade,
    variant_id    uuid references product_variants(id) on delete set null,
    product_name  text not null,
    variant_label text,                             -- 'Negro / M'
    sku           text,
    unit_price    numeric(12,2) not null,
    quantity      int not null check (quantity > 0),
    line_total    numeric(12,2) not null,
    created_at    timestamptz not null default now()
  );
  create index idx_order_items_order on order_items(order_id);

  -- =====================================================================
  -- Reseñas / opiniones
  -- =====================================================================

  create table reviews (
    id          uuid primary key default gen_random_uuid(),
    product_id  uuid not null references products(id) on delete cascade,
    user_id     uuid not null references profiles(id) on delete cascade,
    order_id    uuid references orders(id) on delete set null,
    rating      int not null check (rating between 1 and 5),
    title       text,
    comment     text,
    is_approved boolean not null default false,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    unique (product_id, user_id)
  );
  create trigger trg_reviews_updated before update on reviews
    for each row execute function set_updated_at();
  create index idx_reviews_product on reviews(product_id);

  -- =====================================================================
  -- Chatbot IA (conversaciones + mensajes)
  -- =====================================================================

  create table chatbot_conversations (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid references profiles(id) on delete set null,
    session_id text,
    title      text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  create trigger trg_chat_conv_updated before update on chatbot_conversations
    for each row execute function set_updated_at();
  create index idx_chat_conv_user on chatbot_conversations(user_id);

  create table chatbot_messages (
    id                uuid primary key default gen_random_uuid(),
    conversation_id   uuid not null references chatbot_conversations(id) on delete cascade,
    role              chat_role not null,
    content           text,
    tool_calls        jsonb,                        -- función(es) invocadas por el modelo
    referenced_products uuid[] not null default '{}', -- para analítica de "más consultados"
    tokens            int,
    created_at        timestamptz not null default now()
  );
  create index idx_chat_msg_conv on chatbot_messages(conversation_id);
  create index idx_chat_msg_refs on chatbot_messages using gin(referenced_products);

  -- =====================================================================
  -- Notificaciones, logs y newsletter
  -- =====================================================================

  create table notifications (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null references profiles(id) on delete cascade,
    type       notification_type not null default 'system',
    title      text not null,
    body       text,
    data       jsonb,
    is_read    boolean not null default false,
    created_at timestamptz not null default now()
  );
  create index idx_notifications_user on notifications(user_id, is_read);

  create table activity_logs (
    id          uuid primary key default gen_random_uuid(),
    actor_id    uuid references profiles(id) on delete set null,
    action      text not null,                     -- 'product.created'
    entity_type text,
    entity_id   uuid,
    metadata    jsonb,
    ip_address  inet,
    created_at  timestamptz not null default now()
  );
  create index idx_activity_actor on activity_logs(actor_id);
  create index idx_activity_created on activity_logs(created_at desc);

  create table newsletter_subscribers (
    id         uuid primary key default gen_random_uuid(),
    email      citext not null unique,
    is_active  boolean not null default true,
    created_at timestamptz not null default now()
  );

  -- =====================================================================
  -- Vistas de conveniencia
  -- =====================================================================

  -- Stock agregado por producto + estado del inventario derivado.
  create or replace view products_with_stock as
  select
    p.*,
    coalesce(sum(i.quantity), 0)               as total_stock,
    coalesce(sum(i.quantity - i.reserved), 0)  as available_stock,
    case
      when coalesce(sum(i.quantity - i.reserved), 0) <= 0 then 'agotado'
      when coalesce(sum(i.quantity - i.reserved), 0) <= coalesce(max(i.low_stock_threshold), 5) then 'ultimas_unidades'
      else 'disponible'
    end as stock_status
  from products p
  left join product_variants v on v.product_id = p.id
  left join inventory i        on i.variant_id  = v.id
  group by p.id;

  -- =====================================================================
  -- Función: registrar movimiento de inventario y actualizar stock
  -- (transaccional; se usa desde Server Actions del panel admin)
  -- =====================================================================
  create or replace function apply_inventory_movement(
    p_variant_id uuid,
    p_type       movement_type,
    p_quantity   int,
    p_reason     text default null,
    p_reference  text default null,
    p_actor      uuid default null
  ) returns inventory language plpgsql as $$
  declare
    v_prev int;
    v_new  int;
    v_row  inventory;
  begin
    select quantity into v_prev from inventory where variant_id = p_variant_id for update;
    if not found then
      insert into inventory(variant_id, quantity) values (p_variant_id, 0)
      returning quantity into v_prev;
    end if;

    v_new := v_prev + p_quantity;   -- p_quantity ya viene con signo
    if v_new < 0 then
      raise exception 'Stock insuficiente: resultado %', v_new;
    end if;

    update inventory set quantity = v_new where variant_id = p_variant_id
      returning * into v_row;

    insert into inventory_movements(variant_id, type, quantity, previous_quantity, new_quantity, reason, reference, created_by)
    values (p_variant_id, p_type, p_quantity, v_prev, v_new, p_reason, p_reference, p_actor);

    return v_row;
  end;
  $$;
