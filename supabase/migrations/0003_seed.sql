-- =====================================================================
-- 0003_seed.sql — Datos iniciales (roles, permisos, catálogo demo)
-- =====================================================================

-- Roles
insert into roles (name, description) values
  ('admin',    'Acceso total al panel de administración'),
  ('staff',    'Gestión de catálogo, inventario y pedidos'),
  ('customer', 'Cliente de la tienda')
on conflict (name) do nothing;

-- Permisos (RBAC granular)
insert into permissions (code, description) values
  ('dashboard.view',   'Ver el dashboard'),
  ('products.read',    'Ver productos'),
  ('products.write',   'Crear/editar/eliminar productos'),
  ('inventory.manage', 'Gestionar inventario'),
  ('orders.read',      'Ver pedidos'),
  ('orders.manage',    'Gestionar pedidos'),
  ('customers.read',   'Ver clientes'),
  ('promotions.manage','Gestionar promociones y cupones'),
  ('users.manage',     'Gestionar usuarios y roles'),
  ('settings.manage',  'Configuración de la tienda')
on conflict (code) do nothing;

-- admin => todos los permisos; staff => operativo
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p where r.name = 'admin'
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r join permissions p
  on p.code in ('dashboard.view','products.read','products.write','inventory.manage','orders.read','orders.manage','customers.read')
where r.name = 'staff'
on conflict do nothing;

-- Categorías
insert into categories (name, slug, description, display_order, is_active) values
  ('Camisetas',  'camisetas',  'Camisetas y tops para todo momento', 1, true),
  ('Pantalones', 'pantalones', 'Jeans, chinos y joggers',            2, true),
  ('Chaquetas',  'chaquetas',  'Abrigos y chaquetas para toda estación', 3, true),
  ('Vestidos',   'vestidos',   'Vestidos para cada ocasión',         4, true),
  ('Calzado',    'calzado',    'Tenis, botas y más',                 5, true),
  ('Accesorios', 'accesorios', 'Completa tu look',                   6, true)
on conflict (slug) do nothing;

-- Marcas
insert into brands (name, slug, description, is_active) values
  ('Aurora',   'aurora',   'Moda minimalista contemporánea', true),
  ('Nordik',   'nordik',   'Ropa técnica para clima frío',   true),
  ('Solene',   'solene',   'Elegancia femenina atemporal',   true),
  ('Urbano',   'urbano',   'Streetwear urbano',              true)
on conflict (slug) do nothing;

-- --------------------------------------------------------------------
-- Productos demo con variantes, imágenes e inventario.
-- Se usa un bloque plpgsql para resolver los FK por slug.
-- --------------------------------------------------------------------
do $$
declare
  c_camisetas uuid; c_pantalones uuid; c_chaquetas uuid; c_vestidos uuid; c_calzado uuid;
  b_aurora uuid; b_nordik uuid; b_solene uuid; b_urbano uuid;
  p_id uuid; v_id uuid;
begin
  select id into c_camisetas from categories where slug='camisetas';
  select id into c_pantalones from categories where slug='pantalones';
  select id into c_chaquetas from categories where slug='chaquetas';
  select id into c_vestidos from categories where slug='vestidos';
  select id into c_calzado from categories where slug='calzado';
  select id into b_aurora from brands where slug='aurora';
  select id into b_nordik from brands where slug='nordik';
  select id into b_solene from brands where slug='solene';
  select id into b_urbano from brands where slug='urbano';

  -- 1) Camiseta Oversize (con precio anterior => en oferta)
  insert into products (name, slug, description, category_id, brand_id, gender, base_price, compare_at_price, material, care_instructions, keywords, status, is_featured, published_at, sold_count)
  values ('Camiseta Oversize Essential', 'camiseta-oversize-essential',
          'Camiseta oversize de algodón premium con caída relajada.', c_camisetas, b_urbano, 'unisex',
          89900, 119900, '100% algodón orgánico', 'Lavar a máquina en frío. No usar secadora.',
          array['camiseta','oversize','basica','algodon','negro','blanco'], 'published', true, now(), 240)
  returning id into p_id;
  insert into product_images (product_id, url, alt, position, is_primary) values
    (p_id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 'Camiseta oversize negra', 0, true);
  insert into product_variants (product_id, sku, color, color_hex, size) values
    (p_id, 'CAM-OVS-BLK-S', 'Negro', '#111111', 'S') returning id into v_id;
  insert into inventory (variant_id, quantity) values (v_id, 25);
  insert into product_variants (product_id, sku, color, color_hex, size) values
    (p_id, 'CAM-OVS-BLK-M', 'Negro', '#111111', 'M') returning id into v_id;
  insert into inventory (variant_id, quantity) values (v_id, 3);   -- últimas unidades
  insert into product_variants (product_id, sku, color, color_hex, size) values
    (p_id, 'CAM-OVS-WHT-M', 'Blanco', '#FFFFFF', 'M') returning id into v_id;
  insert into inventory (variant_id, quantity) values (v_id, 40);

  -- 2) Jeans Slim
  insert into products (name, slug, description, category_id, brand_id, gender, base_price, material, care_instructions, keywords, status, is_featured, published_at, sold_count)
  values ('Jeans Slim Fit Indigo', 'jeans-slim-fit-indigo',
          'Jeans slim de denim elástico, comodidad todo el día.', c_pantalones, b_aurora, 'men',
          159900, '98% algodón, 2% elastano', 'Lavar del revés.',
          array['jeans','pantalon','denim','slim','32','azul'], 'published', true, now(), 180)
  returning id into p_id;
  insert into product_images (product_id, url, alt, position, is_primary) values
    (p_id, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', 'Jeans slim azul', 0, true);
  insert into product_variants (product_id, sku, color, color_hex, size) values
    (p_id, 'JNS-SLM-IND-30', 'Indigo', '#2A3F5F', '30') returning id into v_id;
  insert into inventory (variant_id, quantity) values (v_id, 15);
  insert into product_variants (product_id, sku, color, color_hex, size) values
    (p_id, 'JNS-SLM-IND-32', 'Indigo', '#2A3F5F', '32') returning id into v_id;
  insert into inventory (variant_id, quantity) values (v_id, 0);   -- agotado talla 32
  insert into product_variants (product_id, sku, color, color_hex, size) values
    (p_id, 'JNS-SLM-IND-34', 'Indigo', '#2A3F5F', '34') returning id into v_id;
  insert into inventory (variant_id, quantity) values (v_id, 22);

  -- 3) Chaqueta Impermeable (clima frío)
  insert into products (name, slug, description, category_id, brand_id, gender, base_price, compare_at_price, material, care_instructions, keywords, status, is_featured, published_at, sold_count)
  values ('Chaqueta Impermeable Nordik', 'chaqueta-impermeable-nordik',
          'Chaqueta técnica impermeable y cortavientos, ideal para clima frío y lluvia.', c_chaquetas, b_nordik, 'unisex',
          329900, 399900, 'Nylon ripstop con membrana impermeable', 'Limpieza en seco recomendada.',
          array['chaqueta','impermeable','cortavientos','frio','lluvia','abrigo'], 'published', true, now(), 95)
  returning id into p_id;
  insert into product_images (product_id, url, alt, position, is_primary) values
    (p_id, 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800', 'Chaqueta impermeable', 0, true);
  insert into product_variants (product_id, sku, color, color_hex, size) values
    (p_id, 'CHQ-IMP-GRN-M', 'Verde', '#3B5323', 'M') returning id into v_id;
  insert into inventory (variant_id, quantity) values (v_id, 12);
  insert into product_variants (product_id, sku, color, color_hex, size) values
    (p_id, 'CHQ-IMP-BLK-L', 'Negro', '#111111', 'L') returning id into v_id;
  insert into inventory (variant_id, quantity) values (v_id, 8);

  -- 4) Vestido Rojo
  insert into products (name, slug, description, category_id, brand_id, gender, base_price, material, care_instructions, keywords, status, is_featured, published_at, sold_count)
  values ('Vestido Midi Rojo Solene', 'vestido-midi-rojo-solene',
          'Vestido midi rojo de corte elegante para ocasiones especiales.', c_vestidos, b_solene, 'women',
          219900, 'Poliéster satinado', 'Lavar a mano.',
          array['vestido','rojo','midi','mujer','elegante','fiesta'], 'published', true, now(), 130)
  returning id into p_id;
  insert into product_images (product_id, url, alt, position, is_primary) values
    (p_id, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', 'Vestido rojo midi', 0, true);
  insert into product_variants (product_id, sku, color, color_hex, size) values
    (p_id, 'VST-MID-RED-S', 'Rojo', '#C1121F', 'S') returning id into v_id;
  insert into inventory (variant_id, quantity) values (v_id, 10);
  insert into product_variants (product_id, sku, color, color_hex, size) values
    (p_id, 'VST-MID-RED-M', 'Rojo', '#C1121F', 'M') returning id into v_id;
  insert into inventory (variant_id, quantity) values (v_id, 2);   -- últimas unidades

  -- 5) Tenis Urbanos (best-seller)
  insert into products (name, slug, description, category_id, brand_id, gender, base_price, material, care_instructions, keywords, status, is_featured, published_at, sold_count)
  values ('Tenis Urbanos Classic', 'tenis-urbanos-classic',
          'Tenis urbanos versátiles que combinan con todo.', c_calzado, b_urbano, 'unisex',
          249900, 'Cuero sintético y malla', 'Limpiar con paño húmedo.',
          array['tenis','zapatos','calzado','urbano','blanco','sneakers'], 'published', true, now(), 420)
  returning id into p_id;
  insert into product_images (product_id, url, alt, position, is_primary) values
    (p_id, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800', 'Tenis urbanos blancos', 0, true);
  insert into product_variants (product_id, sku, color, color_hex, size) values
    (p_id, 'TEN-URB-WHT-40', 'Blanco', '#FFFFFF', '40') returning id into v_id;
  insert into inventory (variant_id, quantity) values (v_id, 30);
  insert into product_variants (product_id, sku, color, color_hex, size) values
    (p_id, 'TEN-URB-WHT-42', 'Blanco', '#FFFFFF', '42') returning id into v_id;
  insert into inventory (variant_id, quantity) values (v_id, 18);
end $$;

-- Promoción activa de ejemplo
insert into promotions (name, description, type, value, scope, is_active, starts_at, ends_at)
values ('Rebajas de Temporada', 'Hasta 25% en prendas seleccionadas', 'percentage', 25, 'all', true, now() - interval '1 day', now() + interval '30 days');

-- Cupón de bienvenida
insert into coupons (code, description, type, value, min_purchase, is_active)
values ('BIENVENIDO10', '10% de descuento en tu primera compra', 'percentage', 10, 0, true)
on conflict (code) do nothing;
