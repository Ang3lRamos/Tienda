import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  discountPercent,
  slugify,
  orderStatusLabel,
  paymentStatusLabel,
  isCancellableStatus,
} from '@/lib/utils';

describe('formatPrice', () => {
  it('formatea COP sin decimales', () => {
    // El separador es un espacio duro (U+00A0), no un espacio normal.
    expect(formatPrice(15000)).toMatch(/^\$\s?15\.000$/);
  });

  it('no arrastra decimales', () => {
    expect(formatPrice(1234.56)).not.toMatch(/,\d/);
  });

  it('formatea el cero', () => {
    expect(formatPrice(0)).toMatch(/^\$\s?0$/);
  });
});

describe('discountPercent', () => {
  it('calcula el porcentaje de rebaja', () => {
    expect(discountPercent(80000, 100000)).toBe(20);
  });

  it('devuelve 0 sin precio de comparación', () => {
    expect(discountPercent(80000, null)).toBe(0);
    expect(discountPercent(80000)).toBe(0);
  });

  it('devuelve 0 si el precio de comparación no es mayor', () => {
    expect(discountPercent(100000, 100000)).toBe(0);
    expect(discountPercent(100000, 90000)).toBe(0);
  });
});

describe('slugify', () => {
  it('quita acentos y pasa a minúsculas', () => {
    expect(slugify('Camisa Água Añil')).toBe('camisa-agua-anil');
  });

  it('colapsa separadores y recorta los extremos', () => {
    expect(slugify('  Pantalón   cargo__beige  ')).toBe('pantalon-cargo-beige');
  });

  it('descarta signos', () => {
    expect(slugify('¡Oferta! 50% (nuevo)')).toBe('oferta-50-nuevo');
  });
});

describe('etiquetas de estado', () => {
  it('traduce los estados de pedido', () => {
    expect(orderStatusLabel('shipped')).toBe('Enviado');
    expect(orderStatusLabel('cancelled')).toBe('Cancelado');
  });

  it('traduce los estados de pago', () => {
    expect(paymentStatusLabel('paid')).toBe('Pagado');
  });

  it('devuelve el valor original si el estado es desconocido', () => {
    expect(orderStatusLabel('inventado')).toBe('inventado');
  });
});

describe('isCancellableStatus', () => {
  it('permite cancelar sólo antes de que salga el pedido', () => {
    expect(isCancellableStatus('pending')).toBe(true);
    expect(isCancellableStatus('processing')).toBe(true);
  });

  it('no permite cancelar un pedido ya enviado o cerrado', () => {
    expect(isCancellableStatus('shipped')).toBe(false);
    expect(isCancellableStatus('delivered')).toBe(false);
    expect(isCancellableStatus('cancelled')).toBe(false);
  });
});
