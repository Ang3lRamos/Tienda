import type { StoreSettings } from '@/features/settings/queries';

/**
 * Datos legales del responsable de la tienda.
 *
 * Se editan desde el panel (Configuración → tabla `store_settings`), no aquí.
 * Este módulo solo resuelve esos datos para las páginas legales, aplicando
 * textos de relleno cuando aún no se han completado, y expone la fecha de
 * última revisión de los textos.
 *
 * ⚠️ Los textos de términos, privacidad y tratamiento de datos son una
 * **plantilla de partida** y deben ser revisados por un abogado antes de abrir
 * la tienda (Ley 1581 de 2012 de habeas data y Ley 1480 de 2011, Estatuto del
 * Consumidor). Mientras falten los datos del responsable, las páginas muestran
 * un aviso visible.
 */

/** Fecha de la última revisión de los textos legales. */
export const LEGAL_LAST_UPDATED = '20 de julio de 2026';

export interface LegalData {
  legalName: string;
  taxId: string;
  address: string;
  city: string;
  /** Correo para ejercer derechos de habeas data (puede ser null). */
  privacyEmail: string | null;
  /** true si algún dato del responsable sigue sin completarse. */
  pending: boolean;
}

const PLACEHOLDERS = {
  legalName: '[Razón social pendiente]',
  taxId: '[NIT pendiente]',
  address: '[Dirección pendiente]',
  city: '[Ciudad pendiente], Colombia',
} as const;

/**
 * Resuelve los datos legales a partir de la configuración de la tienda,
 * rellenando con textos de relleno los que falten. `privacyEmail` cae al correo
 * de contacto general si no se definió uno específico.
 */
export function resolveLegalData(settings: StoreSettings): LegalData {
  const legalName = settings.legalName?.trim() || null;
  const taxId = settings.taxId?.trim() || null;
  const address = settings.legalAddress?.trim() || null;
  const city = settings.legalCity?.trim() || null;

  return {
    legalName: legalName ?? PLACEHOLDERS.legalName,
    taxId: taxId ?? PLACEHOLDERS.taxId,
    address: address ?? PLACEHOLDERS.address,
    city: city ?? PLACEHOLDERS.city,
    privacyEmail: settings.privacyEmail?.trim() || settings.contactEmail?.trim() || null,
    pending: !legalName || !taxId || !address || !city,
  };
}
