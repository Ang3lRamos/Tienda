import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combina clases de Tailwind resolviendo conflictos. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un número como precio en pesos colombianos (COP). */
export function formatPrice(
  value: number,
  currency = 'COP',
  locale = 'es-CO',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Calcula el porcentaje de descuento entre precio anterior y actual. */
export function discountPercent(base: number, compareAt?: number | null): number {
  if (!compareAt || compareAt <= base) return 0;
  return Math.round(((compareAt - base) / compareAt) * 100);
}

/** Genera un slug URL-safe a partir de un texto. */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '') // elimina diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Etiqueta legible del estado de stock. */
export function stockStatusLabel(status: 'disponible' | 'ultimas_unidades' | 'agotado') {
  return {
    disponible: 'Disponible',
    ultimas_unidades: 'Últimas unidades',
    agotado: 'Agotado',
  }[status];
}
