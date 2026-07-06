import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import type {
  ProductSummary,
  ProductDetail,
  ProductVariantView,
  ProductReviewView,
} from '@/types/product';
import type { StockStatus } from '@/types/database.types';
import { PAGE_SIZE, type CatalogFilters, type FilterOptions } from './types';

/* ------------------------------------------------------------------ *
 * Tipos crudos (lo que devuelve PostgREST con los embeds). Se castea
 * con `as unknown as` porque el parser de tipos no resuelve embeds con
 * tipos escritos a mano; el mapeo abajo produce el tipo de vista final.
 * ------------------------------------------------------------------ */
type RawInventory = { quantity: number; reserved: number; low_stock_threshold: number };
type RawVariant = {
  id: string;
  sku: string;
  color: string | null;
  color_hex: string | null;
  size: string | null;
  price: number | null;
  is_active: boolean;
  inventory: RawInventory | RawInventory[] | null;
};
type RawProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  material: string | null;
  care_instructions: string | null;
  gender: ProductDetail['gender'];
  status: ProductDetail['status'];
  base_price: number;
  compare_at_price: number | null;
  keywords: string[] | null;
  rating_avg: number;
  rating_count: number;
  sold_count: number;
  brands: { name: string; slug: string } | null;
  categories: { name: string; slug: string } | null;
  product_images: { url: string; alt: string | null; is_primary: boolean; position: number }[];
  product_variants: RawVariant[];
};

const PRODUCT_SELECT = `
  id, name, slug, description, material, care_instructions, gender, status,
  base_price, compare_at_price, keywords, rating_avg, rating_count, sold_count,
  brands(name, slug),
  categories(name, slug),
  product_images(url, alt, is_primary, position),
  product_variants(id, sku, color, color_hex, size, price, is_active,
    inventory(quantity, reserved, low_stock_threshold))
`;

/* ------------------------------- helpers ------------------------------ */
function inv(v: RawVariant): RawInventory | null {
  if (!v.inventory) return null;
  return Array.isArray(v.inventory) ? (v.inventory[0] ?? null) : v.inventory;
}
function variantAvailable(v: RawVariant): number {
  const i = inv(v);
  return i ? Math.max(0, i.quantity - i.reserved) : 0;
}
function statusFrom(available: number, threshold: number): StockStatus {
  if (available <= 0) return 'agotado';
  if (available <= threshold) return 'ultimas_unidades';
  return 'disponible';
}
function primaryImage(p: RawProduct) {
  const imgs = [...(p.product_images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
  );
  return imgs[0] ?? null;
}

function toSummary(p: RawProduct): ProductSummary {
  const activeVariants = (p.product_variants ?? []).filter((v) => v.is_active);
  const available = activeVariants.reduce((s, v) => s + variantAvailable(v), 0);
  const threshold = Math.max(
    5,
    ...activeVariants.map((v) => inv(v)?.low_stock_threshold ?? 5),
  );
  const img = primaryImage(p);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.base_price,
    compareAtPrice: p.compare_at_price,
    imageUrl: img?.url ?? null,
    imageAlt: img?.alt ?? null,
    categoryName: p.categories?.name ?? null,
    brandName: p.brands?.name ?? null,
    gender: p.gender,
    isFeatured: false,
    ratingAvg: p.rating_avg,
    ratingCount: p.rating_count,
    stockStatus: statusFrom(available, threshold),
    availableColors: [...new Set(activeVariants.map((v) => v.color).filter(Boolean) as string[])],
    availableSizes: [...new Set(activeVariants.map((v) => v.size).filter(Boolean) as string[])],
  };
}

/* ------------------------------ listado ------------------------------ */
export async function getProducts(
  filters: CatalogFilters,
): Promise<{ products: ProductSummary[]; total: number }> {
  const supabase = await createServerSupabase();

  const needsVariantJoin = Boolean(filters.color || filters.talla);
  const select = needsVariantJoin
    ? PRODUCT_SELECT.replace('product_variants(', 'product_variants!inner(')
    : PRODUCT_SELECT;

  let query = supabase
    .from('products')
    .select(select, { count: 'exact' })
    .eq('status', 'published');

  if (filters.q) {
    query = query.textSearch('search_vector', filters.q, {
      type: 'websearch',
      config: 'spanish',
    });
  }
  if (filters.gender) query = query.eq('gender', filters.gender);
  if (filters.precioMin != null) query = query.gte('base_price', filters.precioMin);
  if (filters.precioMax != null) query = query.lte('base_price', filters.precioMax);
  if (filters.ofertas) query = query.not('compare_at_price', 'is', null);
  if (filters.color) query = query.eq('product_variants.color', filters.color);
  if (filters.talla) query = query.eq('product_variants.size', filters.talla);

  // Slug de categoría/marca → id
  if (filters.categoria) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .match({ slug: filters.categoria })
      .single();
    if (cat) query = query.eq('category_id', (cat as { id: string }).id);
  }
  if (filters.marca) {
    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .match({ slug: filters.marca })
      .single();
    if (brand) query = query.eq('brand_id', (brand as { id: string }).id);
  }

  // Orden
  switch (filters.sort) {
    case 'precio-asc':
      query = query.order('base_price', { ascending: true });
      break;
    case 'precio-desc':
      query = query.order('base_price', { ascending: false });
      break;
    case 'vendidos':
      query = query.order('sold_count', { ascending: false });
      break;
    case 'destacados':
      query = query.order('is_featured', { ascending: false }).order('sold_count', {
        ascending: false,
      });
      break;
    default: // nuevos
      query = query.order('published_at', { ascending: false, nullsFirst: false });
  }

  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data as unknown as RawProduct[]) ?? [];
  return { products: rows.map(toSummary), total: count ?? 0 };
}

/* --------------------------- opciones de filtro ---------------------- */
export async function getFilterOptions(): Promise<FilterOptions> {
  const supabase = await createServerSupabase();

  const [cats, brands, variants, prices] = await Promise.all([
    supabase.from('categories').select('name, slug').eq('is_active', true).order('display_order'),
    supabase.from('brands').select('name, slug').eq('is_active', true).order('name'),
    supabase.from('product_variants').select('color, size').eq('is_active', true),
    supabase.from('products').select('base_price').eq('status', 'published'),
  ]);

  const variantRows = (variants.data as unknown as { color: string | null; size: string | null }[]) ?? [];
  const priceRows = (prices.data as unknown as { base_price: number }[]) ?? [];
  const priceValues = priceRows.map((p) => p.base_price);

  return {
    categories: (cats.data as unknown as { name: string; slug: string }[]) ?? [],
    brands: (brands.data as unknown as { name: string; slug: string }[]) ?? [],
    colors: [...new Set(variantRows.map((v) => v.color).filter(Boolean) as string[])].sort(),
    sizes: [...new Set(variantRows.map((v) => v.size).filter(Boolean) as string[])].sort(),
    priceRange: {
      min: priceValues.length ? Math.min(...priceValues) : 0,
      max: priceValues.length ? Math.max(...priceValues) : 0,
    },
  };
}

/* --------------------------- detalle producto ------------------------ */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .match({ slug })
    .single();

  const p = data as unknown as RawProduct | null;
  if (!p || p.status !== 'published') return null;

  const activeVariants = (p.product_variants ?? []).filter((v) => v.is_active);
  const variants: ProductVariantView[] = activeVariants.map((v) => {
    const available = variantAvailable(v);
    const threshold = inv(v)?.low_stock_threshold ?? 5;
    return {
      id: v.id,
      sku: v.sku,
      color: v.color,
      colorHex: v.color_hex,
      size: v.size,
      price: v.price,
      available,
      stockStatus: statusFrom(available, threshold),
    };
  });
  const totalAvailable = variants.reduce((s, v) => s + v.available, 0);
  const threshold = Math.max(5, ...activeVariants.map((v) => inv(v)?.low_stock_threshold ?? 5));

  const colorMap = new Map<string, string | null>();
  for (const v of activeVariants) if (v.color) colorMap.set(v.color, v.color_hex);

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    material: p.material,
    careInstructions: p.care_instructions,
    gender: p.gender,
    status: p.status,
    price: p.base_price,
    compareAtPrice: p.compare_at_price,
    brandName: p.brands?.name ?? null,
    brandSlug: p.brands?.slug ?? null,
    categoryName: p.categories?.name ?? null,
    categorySlug: p.categories?.slug ?? null,
    keywords: p.keywords ?? [],
    ratingAvg: p.rating_avg,
    ratingCount: p.rating_count,
    soldCount: p.sold_count,
    images: [...(p.product_images ?? [])]
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position)
      .map((i) => ({ url: i.url, alt: i.alt, isPrimary: i.is_primary })),
    variants,
    availableColors: [...colorMap.entries()].map(([name, hex]) => ({ name, hex })),
    availableSizes: [...new Set(activeVariants.map((v) => v.size).filter(Boolean) as string[])],
    totalAvailable,
    stockStatus: statusFrom(totalAvailable, threshold),
  };
}

/** Resúmenes de producto por ids (para reconstruir la wishlist desde la BD). */
export async function getProductSummariesByIds(ids: string[]): Promise<ProductSummary[]> {
  if (ids.length === 0) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .in('id', ids)
    .eq('status', 'published');
  const rows = (data as unknown as RawProduct[]) ?? [];
  return rows.map(toSummary);
}

/* ---------------------------- categorías ----------------------------- */
export async function getCategories(): Promise<
  { name: string; slug: string; imageUrl: string | null; description: string | null }[]
> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('categories')
    .select('name, slug, image_url, description')
    .eq('is_active', true)
    .order('display_order');
  const rows =
    (data as unknown as {
      name: string;
      slug: string;
      image_url: string | null;
      description: string | null;
    }[]) ?? [];
  return rows.map((c) => ({
    name: c.name,
    slug: c.slug,
    imageUrl: c.image_url,
    description: c.description,
  }));
}

/* --------------------------- relacionados ---------------------------- */
export async function getRelatedProducts(
  categorySlug: string | null,
  excludeId: string,
  limit = 4,
): Promise<ProductSummary[]> {
  if (!categorySlug) return [];
  const { products } = await getProducts({ categoria: categorySlug, sort: 'vendidos' });
  return products.filter((p) => p.id !== excludeId).slice(0, limit);
}

/* ----------------------------- reseñas ------------------------------- */
export async function getProductReviews(productId: string): Promise<ProductReviewView[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('reviews')
    .select('id, rating, title, comment, created_at, profiles(full_name)')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  const rows =
    (data as unknown as {
      id: string;
      rating: number;
      title: string | null;
      comment: string | null;
      created_at: string;
      profiles: { full_name: string | null } | null;
    }[]) ?? [];

  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    authorName: r.profiles?.full_name ?? 'Cliente',
    createdAt: r.created_at,
  }));
}
