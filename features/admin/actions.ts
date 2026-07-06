'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

type Result = { error?: string; success?: boolean };

/** Verifica que el usuario actual sea admin o staff. Lanza si no. */
async function assertStaff(): Promise<string> {
  const supabase = await createServerSupabase();
  const { data: role } = await supabase.rpc('current_role_name');
  if (role !== 'admin' && role !== 'staff') throw new Error('No autorizado');
  return role;
}

/* ------------------------------- Pedidos ------------------------------ */
const orderStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;

export async function updateOrderStatus(orderNumber: string, status: string): Promise<Result> {
  await assertStaff();
  if (!orderStatuses.includes(status as (typeof orderStatuses)[number])) {
    return { error: 'Estado no válido' };
  }
  const admin = createAdminSupabase();
  const { error } = await admin
    .from('orders')
    .update({ status } as never)
    .eq('order_number', orderNumber);
  if (error) return { error: 'No fue posible actualizar el pedido.' };
  revalidatePath('/admin/pedidos');
  return { success: true };
}

/* --------------------------- Categorías/Marcas ------------------------ */
const taxonomySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Nombre requerido'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function upsertTaxonomy(
  kind: 'categories' | 'brands',
  input: unknown,
): Promise<Result> {
  await assertStaff();
  const parsed = taxonomySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  const { id, name, description, isActive } = parsed.data;

  const admin = createAdminSupabase();
  const payload = { name, slug: slugify(name), description: description || null, is_active: isActive };

  const query = id
    ? admin.from(kind).update(payload as never).eq('id', id)
    : admin.from(kind).insert(payload as never);
  const { error } = await query;
  if (error) return { error: 'No fue posible guardar. ¿Nombre duplicado?' };

  revalidatePath(`/admin/${kind === 'categories' ? 'categorias' : 'marcas'}`);
  return { success: true };
}

export async function deleteTaxonomy(kind: 'categories' | 'brands', id: string): Promise<Result> {
  await assertStaff();
  const admin = createAdminSupabase();
  const { error } = await admin.from(kind).delete().eq('id', id);
  if (error) return { error: 'No fue posible eliminar.' };
  revalidatePath(`/admin/${kind === 'categories' ? 'categorias' : 'marcas'}`);
  return { success: true };
}

/* ------------------------------ Productos ----------------------------- */
const imageSchema = z.object({
  url: z.string().url('URL de imagen no válida'),
  alt: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  color: z.string().optional(),
  colorHex: z.string().optional(),
  size: z.string().optional(),
  sku: z.string().min(1, 'SKU requerido'),
  price: z.number().nonnegative().nullable().optional(),
  quantity: z.number().int().nonnegative().default(0),
});

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Nombre requerido'),
  description: z.string().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  brandId: z.string().uuid().nullable().optional(),
  gender: z.enum(['men', 'women', 'unisex', 'kids']).default('unisex'),
  basePrice: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  images: z.array(imageSchema).default([]),
  variants: z.array(variantSchema).default([]),
});

export async function upsertProduct(input: unknown): Promise<Result> {
  await assertStaff();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  const p = parsed.data;

  // SKUs duplicados dentro del mismo producto
  const skus = p.variants.map((v) => v.sku.trim());
  if (new Set(skus).size !== skus.length) return { error: 'Hay SKUs repetidos entre las variantes.' };

  const admin = createAdminSupabase();
  const payload = {
    name: p.name,
    slug: slugify(p.name),
    description: p.description || null,
    category_id: p.categoryId || null,
    brand_id: p.brandId || null,
    gender: p.gender,
    base_price: p.basePrice,
    compare_at_price: p.compareAtPrice ?? null,
    material: p.material || null,
    care_instructions: p.careInstructions || null,
    status: p.status,
    is_featured: p.isFeatured,
    published_at: p.status === 'published' ? new Date().toISOString() : null,
  };

  // 1) Producto (crear o actualizar) → obtener id
  let productId = p.id;
  if (productId) {
    const { error } = await admin.from('products').update(payload as never).eq('id', productId);
    if (error) return { error: 'No fue posible guardar el producto. ¿Nombre duplicado?' };
  } else {
    const { data, error } = await admin
      .from('products')
      .insert(payload as never)
      .select('id')
      .single();
    if (error || !data) return { error: 'No fue posible crear el producto. ¿Nombre duplicado?' };
    productId = (data as { id: string }).id;
  }

  // 2) Variantes + inventario (sincronización)
  const { data: existing } = await admin
    .from('product_variants')
    .select('id')
    .eq('product_id', productId);
  const existingIds = ((existing as { id: string }[]) ?? []).map((v) => v.id);
  const incomingIds = new Set(p.variants.map((v) => v.id).filter(Boolean));
  const toDelete = existingIds.filter((id) => !incomingIds.has(id));
  if (toDelete.length) await admin.from('product_variants').delete().in('id', toDelete);

  for (const v of p.variants) {
    const vPayload = {
      product_id: productId,
      sku: v.sku.trim(),
      color: v.color || null,
      color_hex: v.colorHex || null,
      size: v.size || null,
      price: v.price ?? null,
      is_active: true,
    };
    let variantId = v.id;
    if (variantId) {
      const { error } = await admin.from('product_variants').update(vPayload as never).eq('id', variantId);
      if (error) return { error: `Error en la variante ${v.sku}. ¿SKU duplicado?` };
    } else {
      const { data, error } = await admin
        .from('product_variants')
        .insert(vPayload as never)
        .select('id')
        .single();
      if (error || !data) return { error: `No se pudo crear la variante ${v.sku}. ¿SKU duplicado?` };
      variantId = (data as { id: string }).id;
    }
    await admin
      .from('inventory')
      .upsert({ variant_id: variantId, quantity: v.quantity } as never, { onConflict: 'variant_id' });
  }

  // 3) Imágenes (reemplazo completo)
  await admin.from('product_images').delete().eq('product_id', productId);
  const images = p.images.filter((im) => im.url);
  if (images.length) {
    const hasPrimary = images.some((im) => im.isPrimary);
    const rows = images.map((im, i) => ({
      product_id: productId,
      url: im.url,
      alt: im.alt || null,
      position: i,
      is_primary: hasPrimary ? im.isPrimary : i === 0,
    }));
    await admin.from('product_images').insert(rows as never);
  }

  revalidatePath('/admin/productos');
  revalidatePath('/');
  return { success: true };
}

export async function deleteProduct(id: string): Promise<Result> {
  await assertStaff();
  const admin = createAdminSupabase();
  const { error } = await admin.from('products').delete().eq('id', id);
  if (error) return { error: 'No fue posible eliminar el producto.' };
  revalidatePath('/admin/productos');
  return { success: true };
}

export async function setProductStatus(id: string, status: string): Promise<Result> {
  await assertStaff();
  const admin = createAdminSupabase();
  const { error } = await admin
    .from('products')
    .update({
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
    } as never)
    .eq('id', id);
  if (error) return { error: 'No fue posible actualizar el estado.' };
  revalidatePath('/admin/productos');
  return { success: true };
}

/* ------------------------------ Inventario ---------------------------- */
export async function adjustInventory(
  variantId: string,
  delta: number,
  reason: string,
): Promise<Result> {
  await assertStaff();
  if (!Number.isInteger(delta) || delta === 0) return { error: 'Cantidad no válida' };
  const admin = createAdminSupabase();
  const { error } = await admin.rpc('apply_inventory_movement', {
    p_variant_id: variantId,
    p_type: delta > 0 ? 'in' : 'out',
    p_quantity: delta,
    p_reason: reason || 'ajuste manual',
  });
  if (error) return { error: error.message };
  revalidatePath('/admin/inventario');
  return { success: true };
}

/* ------------------------------- Usuarios ----------------------------- */
export async function setUserRole(userId: string, roleName: string): Promise<Result> {
  const current = await assertStaff();
  if (current !== 'admin') return { error: 'Solo un admin puede cambiar roles.' };
  const admin = createAdminSupabase();
  const { data: role } = await admin.from('roles').select('id').eq('name', roleName).maybeSingle();
  const roleId = (role as { id: string } | null)?.id;
  if (!roleId) return { error: 'Rol no válido' };
  const { error } = await admin
    .from('profiles')
    .update({ role_id: roleId } as never)
    .eq('id', userId);
  if (error) return { error: 'No fue posible actualizar el rol.' };
  revalidatePath('/admin/usuarios');
  return { success: true };
}

/* ----------------------------- Promociones ---------------------------- */
export async function togglePromotion(id: string, isActive: boolean): Promise<Result> {
  await assertStaff();
  const admin = createAdminSupabase();
  const { error } = await admin
    .from('promotions')
    .update({ is_active: isActive } as never)
    .eq('id', id);
  if (error) return { error: 'No fue posible actualizar la promoción.' };
  revalidatePath('/admin/promociones');
  return { success: true };
}

const isoOrNull = (v?: string) => (v ? new Date(v).toISOString() : null);

const promotionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Nombre requerido'),
  description: z.string().optional(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().nonnegative(),
  scope: z.enum(['all', 'category', 'brand', 'product']).default('all'),
  targetId: z.string().uuid().nullable().optional(),
  bannerImageUrl: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function upsertPromotion(input: unknown): Promise<Result> {
  await assertStaff();
  const parsed = promotionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  const p = parsed.data;
  const admin = createAdminSupabase();
  const payload = {
    name: p.name,
    description: p.description || null,
    type: p.type,
    value: p.value,
    scope: p.scope,
    target_id: p.scope === 'all' ? null : p.targetId || null,
    banner_image_url: p.bannerImageUrl || null,
    starts_at: isoOrNull(p.startsAt),
    ends_at: isoOrNull(p.endsAt),
    is_active: p.isActive,
  };
  const query = p.id
    ? admin.from('promotions').update(payload as never).eq('id', p.id)
    : admin.from('promotions').insert(payload as never);
  const { error } = await query;
  if (error) return { error: 'No fue posible guardar la promoción.' };
  revalidatePath('/admin/promociones');
  revalidatePath('/');
  return { success: true };
}

export async function deletePromotion(id: string): Promise<Result> {
  await assertStaff();
  const admin = createAdminSupabase();
  const { error } = await admin.from('promotions').delete().eq('id', id);
  if (error) return { error: 'No fue posible eliminar la promoción.' };
  revalidatePath('/admin/promociones');
  return { success: true };
}

/* ------------------------------- Cupones ------------------------------ */
const couponSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(3, 'Código de al menos 3 caracteres'),
  description: z.string().optional(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().nonnegative(),
  minPurchase: z.number().nonnegative().default(0),
  maxUses: z.number().int().positive().nullable().optional(),
  perUserLimit: z.number().int().positive().default(1),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function upsertCoupon(input: unknown): Promise<Result> {
  await assertStaff();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  const c = parsed.data;
  const admin = createAdminSupabase();
  const payload = {
    code: c.code.trim().toUpperCase(),
    description: c.description || null,
    type: c.type,
    value: c.value,
    min_purchase: c.minPurchase,
    max_uses: c.maxUses ?? null,
    per_user_limit: c.perUserLimit,
    starts_at: isoOrNull(c.startsAt),
    ends_at: isoOrNull(c.endsAt),
    is_active: c.isActive,
  };
  const query = c.id
    ? admin.from('coupons').update(payload as never).eq('id', c.id)
    : admin.from('coupons').insert(payload as never);
  const { error } = await query;
  if (error) return { error: 'No fue posible guardar el cupón. ¿Código duplicado?' };
  revalidatePath('/admin/promociones');
  return { success: true };
}

export async function deleteCoupon(id: string): Promise<Result> {
  await assertStaff();
  const admin = createAdminSupabase();
  const { error } = await admin.from('coupons').delete().eq('id', id);
  if (error) return { error: 'No fue posible eliminar el cupón.' };
  revalidatePath('/admin/promociones');
  return { success: true };
}

export async function toggleCoupon(id: string, isActive: boolean): Promise<Result> {
  await assertStaff();
  const admin = createAdminSupabase();
  const { error } = await admin.from('coupons').update({ is_active: isActive } as never).eq('id', id);
  if (error) return { error: 'No fue posible actualizar el cupón.' };
  revalidatePath('/admin/promociones');
  return { success: true };
}
