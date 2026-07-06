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
});

export async function upsertProduct(input: unknown): Promise<Result> {
  await assertStaff();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  const p = parsed.data;

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

  const query = p.id
    ? admin.from('products').update(payload as never).eq('id', p.id)
    : admin.from('products').insert(payload as never);
  const { error } = await query;
  if (error) return { error: 'No fue posible guardar el producto. ¿Nombre duplicado?' };

  revalidatePath('/admin/productos');
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
