import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { OrderStatus, PaymentStatus } from '@/types/database.types';

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
    // El guion bajo se conserva aquí para que el paso siguiente pueda
    // convertirlo en separador; si se eliminase antes, "cargo__beige"
    // quedaría como "cargobeige" en vez de "cargo-beige".
    .replace(/[^a-z0-9\s_-]/g, '')
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

/** Etiqueta en español del estado de un pedido. */
export function orderStatusLabel(status: string): string {
  const map: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    processing: 'En preparación',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  };
  return map[status as OrderStatus] ?? status;
}

/** Etiqueta en español del estado de pago. */
export function paymentStatusLabel(status: string): string {
  const map: Record<PaymentStatus, string> = {
    pending: 'Pago pendiente',
    paid: 'Pagado',
    failed: 'Fallido',
    refunded: 'Reembolsado',
  };
  return map[status as PaymentStatus] ?? status;
}

/** Indica si un pedido todavía puede cancelarlo el cliente. */
export function isCancellableStatus(status: string): boolean {
  return status === 'pending' || status === 'processing';
}
