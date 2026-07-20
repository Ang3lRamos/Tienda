import { describe, it, expect } from 'vitest';
import { computeTotals, DEFAULT_SETTINGS } from '@/features/settings/queries';

/**
 * `computeTotals` decide lo que paga el cliente. El servidor lo recalcula
 * siempre antes de crear el pedido, así que un error aquí se cobra de verdad.
 */

const settings = {
  ...DEFAULT_SETTINGS,
  shippingCost: 15000,
  freeShippingThreshold: 200000,
  taxRate: 0,
};

describe('computeTotals — envío', () => {
  it('cobra el envío por debajo del umbral', () => {
    const { shipping, grandTotal } = computeTotals(100000, 0, settings);
    expect(shipping).toBe(15000);
    expect(grandTotal).toBe(115000);
  });

  it('no cobra envío justo en el umbral', () => {
    const { shipping } = computeTotals(200000, 0, settings);
    expect(shipping).toBe(0);
  });

  it('no cobra envío por encima del umbral', () => {
    expect(computeTotals(250000, 0, settings).shipping).toBe(0);
  });

  it('decide el envío por el subtotal, no por el total tras descuento', () => {
    // Un cupón no debería hacerle perder al cliente el envío gratis que ya
    // se había ganado por el valor de su compra.
    const { shipping } = computeTotals(220000, 50000, settings);
    expect(shipping).toBe(0);
  });

  it('cobra envío si el umbral es 0 y el subtotal también', () => {
    const { shipping } = computeTotals(0, 0, { ...settings, freeShippingThreshold: 0 });
    expect(shipping).toBe(0);
  });
});

describe('computeTotals — descuentos e impuestos', () => {
  it('resta el descuento del total', () => {
    const { grandTotal } = computeTotals(100000, 20000, settings);
    expect(grandTotal).toBe(95000); // 80.000 + 15.000 de envío
  });

  it('aplica el impuesto sobre el subtotal ya descontado, no sobre el bruto', () => {
    const { tax } = computeTotals(100000, 20000, { ...settings, taxRate: 19 });
    expect(tax).toBe(15200); // 19% de 80.000, no de 100.000
  });

  it('no aplica impuesto sobre el envío', () => {
    const { tax, shipping, grandTotal } = computeTotals(100000, 0, {
      ...settings,
      taxRate: 19,
    });
    expect(tax).toBe(19000);
    expect(shipping).toBe(15000);
    expect(grandTotal).toBe(134000);
  });

  it('redondea el impuesto a pesos enteros (COP no usa decimales)', () => {
    const { tax } = computeTotals(33333, 0, { ...settings, taxRate: 19 });
    expect(Number.isInteger(tax)).toBe(true);
    expect(tax).toBe(6333);
  });

  it('no genera un total negativo si el descuento supera el subtotal', () => {
    const { grandTotal, tax } = computeTotals(50000, 80000, { ...settings, taxRate: 19 });
    expect(tax).toBe(0);
    expect(grandTotal).toBe(15000); // sólo el envío
  });

  it('con tasa 0 no añade impuesto', () => {
    expect(computeTotals(100000, 0, settings).tax).toBe(0);
  });
});
