import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';

/**
 * Configuración de la tienda editable desde el panel (tabla `store_settings`).
 *
 * Devuelve SIEMPRE un objeto válido: si la migración 0005 todavía no se ha
 * ejecutado (o la tabla está vacía), se usan los valores por defecto, de modo
 * que el checkout sigue funcionando exactamente como antes.
 */

export interface StoreSettings {
  shippingCost: number;
  freeShippingThreshold: number;
  /** Porcentaje sobre el subtotal tras descuentos. 0 = sin impuestos. */
  taxRate: number;
  storeName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  announcement: string | null;
  // Datos del responsable para las páginas legales (Ley 1581 de 2012).
  legalName: string | null;
  taxId: string | null;
  legalAddress: string | null;
  legalCity: string | null;
  /** Correo de habeas data; si es null, se usa `contactEmail`. */
  privacyEmail: string | null;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  shippingCost: 15000,
  freeShippingThreshold: 200000,
  taxRate: 0,
  storeName: 'Átelier',
  contactEmail: null,
  contactPhone: null,
  announcement: null,
  legalName: null,
  taxId: null,
  legalAddress: null,
  legalCity: null,
  privacyEmail: null,
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = await createServerSupabase();
  // `select('*')` (en vez de columnas explícitas) tolera que la migración 0007
  // aún no esté aplicada: si faltan las columnas legales, llegan como undefined
  // y se resuelven a null, sin perder los datos de envío que sí existen.
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .match({ id: 1 })
    .maybeSingle();

  if (error || !data) return DEFAULT_SETTINGS;

  const s = data as unknown as {
    shipping_cost: number;
    free_shipping_threshold: number;
    tax_rate: number;
    store_name: string;
    contact_email: string | null;
    contact_phone: string | null;
    announcement: string | null;
    legal_name?: string | null;
    tax_id?: string | null;
    legal_address?: string | null;
    legal_city?: string | null;
    privacy_email?: string | null;
  };

  return {
    shippingCost: Number(s.shipping_cost),
    freeShippingThreshold: Number(s.free_shipping_threshold),
    taxRate: Number(s.tax_rate),
    storeName: s.store_name || DEFAULT_SETTINGS.storeName,
    contactEmail: s.contact_email,
    contactPhone: s.contact_phone,
    announcement: s.announcement,
    legalName: s.legal_name ?? null,
    taxId: s.tax_id ?? null,
    legalAddress: s.legal_address ?? null,
    legalCity: s.legal_city ?? null,
    privacyEmail: s.privacy_email ?? null,
  };
}

/** Calcula envío e impuestos con la configuración vigente. */
export function computeTotals(
  subtotal: number,
  discount: number,
  settings: StoreSettings,
): { shipping: number; tax: number; grandTotal: number } {
  const taxable = Math.max(0, subtotal - discount);
  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCost;
  const tax = Math.round((taxable * settings.taxRate) / 100);
  return { shipping, tax, grandTotal: taxable + shipping + tax };
}
