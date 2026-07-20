/**
 * Datos legales del responsable de la tienda.
 *
 * ⚠️ COMPLETAR ANTES DE PUBLICAR. Estos valores aparecen en los términos y
 * condiciones, la política de privacidad y la política de tratamiento de datos.
 * Los textos de esas páginas son una **plantilla de partida**: deben ser
 * revisados por un abogado antes de abrir la tienda al público, sobre todo por
 * la Ley 1581 de 2012 (habeas data) y el Estatuto del Consumidor (Ley 1480 de
 * 2011), que rigen el comercio electrónico en Colombia.
 *
 * Mientras un campo siga con el texto entre corchetes, la página muestra un
 * aviso visible de que el dato está pendiente.
 */
export const legalConfig = {
  /** Razón social del responsable (p. ej. "Átelier Moda S.A.S."). */
  legalName: '[Razón social pendiente]',
  /** NIT con dígito de verificación. */
  taxId: '[NIT pendiente]',
  /** Domicilio de notificaciones. */
  address: '[Dirección pendiente]',
  /** Ciudad y país del domicilio. */
  city: '[Ciudad pendiente], Colombia',
  /**
   * Correo para ejercer derechos de habeas data. Si se deja en null se usa el
   * correo de contacto configurado en /admin/configuracion.
   */
  privacyEmail: null as string | null,
  /** Fecha de la última revisión de los textos legales. */
  lastUpdated: '20 de julio de 2026',
} as const;

/** Indica si un dato legal sigue sin completarse. */
export function isPlaceholder(value: string): boolean {
  return value.includes('[') && value.includes('pendiente');
}

/** true si queda algún dato legal por completar. */
export function hasPendingLegalData(): boolean {
  return [legalConfig.legalName, legalConfig.taxId, legalConfig.address, legalConfig.city].some(
    isPlaceholder,
  );
}
