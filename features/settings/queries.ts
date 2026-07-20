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
}

export const DEFAULT_SETTINGS: StoreSettings = {
  shippingCost: 15000,
  freeShippingThreshold: 200000,
  taxRate: 0,
  storeName: 'Átelier',
  contactEmail: null,
  contactPhone: null,
  announcement: null,
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('store_settings')
    .select(
      'shipping_cost, free_shipping_threshold, tax_rate, store_name, contact_email, contact_phone, announcement',
    )
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
  };

  return {
    shippingCost: Number(s.shipping_cost),
    freeShippingThreshold: Number(s.free_shipping_threshold),
    taxRate: Number(s.tax_rate),
    storeName: s.store_name || DEFAULT_SETTINGS.storeName,
    contactEmail: s.contact_email,
    contactPhone: s.contact_phone,
    announcement: s.announcement,
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
