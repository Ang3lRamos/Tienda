import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';

/* ------------------------------- Pedidos ------------------------------ */
export interface AdminOrderRow {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  customer: string | null;
  createdAt: string;
}
export async function listOrders(): Promise<AdminOrderRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('orders')
    .select('order_number, status, payment_status, grand_total, created_at, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(100);
  const rows =
    (data as unknown as {
      order_number: string;
      status: string;
      payment_status: string;
      grand_total: number;
      created_at: string;
      profiles: { full_name: string | null; email: string | null } | null;
    }[]) ?? [];
  return rows.map((o) => ({
    orderNumber: o.order_number,
    status: o.status,
    paymentStatus: o.payment_status,
    grandTotal: o.grand_total,
    customer: o.profiles?.full_name ?? o.profiles?.email ?? null,
    createdAt: o.created_at,
  }));
}

/* ------------------------------ Productos ----------------------------- */
export interface AdminProductImage {
  url: string;
  alt: string | null;
  isPrimary: boolean;
}
export interface AdminProductVariant {
  id: string;
  color: string | null;
  colorHex: string | null;
  size: string | null;
  sku: string;
  price: number | null;
  quantity: number;
}
export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  isFeatured: boolean;
  price: number;
  compareAtPrice: number | null;
  categoryId: string | null;
  brandId: string | null;
  categoryName: string | null;
  brandName: string | null;
  gender: string;
  description: string | null;
  material: string | null;
  careInstructions: string | null;
  images: AdminProductImage[];
  variants: AdminProductVariant[];
}
export async function listProducts(): Promise<AdminProductRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('products')
    .select(
      'id, name, slug, status, is_featured, base_price, compare_at_price, category_id, brand_id, gender, description, material, care_instructions, categories(name), brands(name), product_images(url, alt, is_primary, position), product_variants(id, color, color_hex, size, sku, price, is_active, inventory(quantity))',
    )
    .order('created_at', { ascending: false });
  const rows =
    (data as unknown as {
      id: string;
      name: string;
      slug: string;
      status: string;
      is_featured: boolean;
      base_price: number;
      compare_at_price: number | null;
      category_id: string | null;
      brand_id: string | null;
      gender: string;
      description: string | null;
      material: string | null;
      care_instructions: string | null;
      categories: { name: string } | null;
      brands: { name: string } | null;
      product_images: { url: string; alt: string | null; is_primary: boolean; position: number }[];
      product_variants: {
        id: string;
        color: string | null;
        color_hex: string | null;
        size: string | null;
        sku: string;
        price: number | null;
        is_active: boolean;
        inventory: { quantity: number } | { quantity: number }[] | null;
      }[];
    }[]) ?? [];
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    status: p.status,
    isFeatured: p.is_featured,
    price: p.base_price,
    compareAtPrice: p.compare_at_price,
    categoryId: p.category_id,
    brandId: p.brand_id,
    categoryName: p.categories?.name ?? null,
    brandName: p.brands?.name ?? null,
    gender: p.gender,
    description: p.description,
    material: p.material,
    careInstructions: p.care_instructions,
    images: [...(p.product_images ?? [])]
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position)
      .map((im) => ({ url: im.url, alt: im.alt, isPrimary: im.is_primary })),
    variants: (p.product_variants ?? [])
      .filter((v) => v.is_active)
      .map((v) => {
        const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
        return {
          id: v.id,
          color: v.color,
          colorHex: v.color_hex,
          size: v.size,
          sku: v.sku,
          price: v.price,
          quantity: inv?.quantity ?? 0,
        };
      }),
  }));
}

/* --------------------------- Categorías/Marcas ------------------------ */
export interface TaxonomyRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
}
export async function listCategories(): Promise<TaxonomyRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, description, is_active')
    .order('display_order');
  return normalizeTaxonomy(data);
}
export async function listBrands(): Promise<TaxonomyRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('brands')
    .select('id, name, slug, description, is_active')
    .order('name');
  return normalizeTaxonomy(data);
}
function normalizeTaxonomy(data: unknown): TaxonomyRow[] {
  const rows =
    (data as {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      is_active: boolean;
    }[]) ?? [];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    isActive: r.is_active,
  }));
}

/* ------------------------------- Clientes ----------------------------- */
export interface CustomerRow {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  createdAt: string;
}
export async function listCustomers(): Promise<CustomerRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at, roles(name)')
    .order('created_at', { ascending: false })
    .limit(200);
  const rows =
    (data as unknown as {
      id: string;
      full_name: string | null;
      email: string | null;
      created_at: string;
      roles: { name: string } | null;
    }[]) ?? [];
  return rows.map((c) => ({
    id: c.id,
    name: c.full_name,
    email: c.email,
    role: c.roles?.name ?? null,
    createdAt: c.created_at,
  }));
}

/* ------------------------------ Inventario ---------------------------- */
export interface InventoryRowView {
  variantId: string;
  productName: string;
  sku: string;
  label: string;
  quantity: number;
  available: number;
  threshold: number;
}
export async function listInventory(): Promise<InventoryRowView[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('product_variants')
    .select('id, sku, color, size, products(name), inventory(quantity, reserved, low_stock_threshold)')
    .order('sku');
  const rows =
    (data as unknown as {
      id: string;
      sku: string;
      color: string | null;
      size: string | null;
      products: { name: string } | null;
      inventory:
        | { quantity: number; reserved: number; low_stock_threshold: number }
        | { quantity: number; reserved: number; low_stock_threshold: number }[]
        | null;
    }[]) ?? [];
  return rows.map((r) => {
    const inv = Array.isArray(r.inventory) ? r.inventory[0] : r.inventory;
    const quantity = inv?.quantity ?? 0;
    const reserved = inv?.reserved ?? 0;
    return {
      variantId: r.id,
      productName: r.products?.name ?? 'Producto',
      sku: r.sku,
      label: [r.color, r.size].filter(Boolean).join(' / ') || '—',
      quantity,
      available: Math.max(0, quantity - reserved),
      threshold: inv?.low_stock_threshold ?? 5,
    };
  });
}

/* ----------------------------- Promociones ---------------------------- */
export interface PromotionRowView {
  id: string;
  name: string;
  description: string | null;
  type: string;
  value: number;
  scope: string;
  targetId: string | null;
  bannerImageUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}
export async function listPromotions(): Promise<PromotionRowView[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('promotions')
    .select('id, name, description, type, value, scope, target_id, banner_image_url, starts_at, ends_at, is_active')
    .order('created_at', { ascending: false });
  const rows =
    (data as unknown as {
      id: string;
      name: string;
      description: string | null;
      type: string;
      value: number;
      scope: string;
      target_id: string | null;
      banner_image_url: string | null;
      starts_at: string | null;
      ends_at: string | null;
      is_active: boolean;
    }[]) ?? [];
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    type: p.type,
    value: p.value,
    scope: p.scope,
    targetId: p.target_id,
    bannerImageUrl: p.banner_image_url,
    startsAt: p.starts_at,
    endsAt: p.ends_at,
    isActive: p.is_active,
  }));
}

export interface CouponRowView {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  minPurchase: number;
  maxUses: number | null;
  usedCount: number;
  perUserLimit: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}
export async function listCoupons(): Promise<CouponRowView[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('coupons')
    .select('id, code, description, type, value, min_purchase, max_uses, used_count, per_user_limit, starts_at, ends_at, is_active')
    .order('created_at', { ascending: false });
  const rows =
    (data as unknown as {
      id: string;
      code: string;
      description: string | null;
      type: string;
      value: number;
      min_purchase: number;
      max_uses: number | null;
      used_count: number;
      per_user_limit: number;
      starts_at: string | null;
      ends_at: string | null;
      is_active: boolean;
    }[]) ?? [];
  return rows.map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description,
    type: c.type,
    value: c.value,
    minPurchase: c.min_purchase,
    maxUses: c.max_uses,
    usedCount: c.used_count,
    perUserLimit: c.per_user_limit,
    startsAt: c.starts_at,
    endsAt: c.ends_at,
    isActive: c.is_active,
  }));
}

/* ------------------------------- Chat IA ------------------------------ */
export interface ChatAnalytics {
  totalConversations: number;
  totalMessages: number;
  userMessages: number;
  topProducts: { name: string; count: number }[];
}
export async function getChatAnalytics(): Promise<ChatAnalytics> {
  const supabase = await createServerSupabase();
  const [{ count: conv }, messages] = await Promise.all([
    supabase.from('chatbot_conversations').select('id', { count: 'exact', head: true }),
    supabase.from('chatbot_messages').select('role, referenced_products').limit(1000),
  ]);
  const rows =
    (messages.data as unknown as { role: string; referenced_products: string[] }[]) ?? [];

  const counts = new Map<string, number>();
  for (const m of rows)
    for (const pid of m.referenced_products ?? [])
      counts.set(pid, (counts.get(pid) ?? 0) + 1);

  // Resolver nombres de los productos más referenciados.
  const topIds = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  let topProducts: { name: string; count: number }[] = [];
  if (topIds.length) {
    const { data: prods } = await supabase
      .from('products')
      .select('id, name')
      .in('id', topIds.map(([id]) => id));
    const nameById = new Map(
      ((prods as unknown as { id: string; name: string }[]) ?? []).map((p) => [p.id, p.name]),
    );
    topProducts = topIds.map(([id, count]) => ({ name: nameById.get(id) ?? 'Producto', count }));
  }

  return {
    totalConversations: conv ?? 0,
    totalMessages: rows.length,
    userMessages: rows.filter((m) => m.role === 'user').length,
    topProducts,
  };
}
