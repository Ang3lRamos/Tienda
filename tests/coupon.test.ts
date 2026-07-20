import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * `hasCouponQuotaLeft` cuenta los pedidos vivos del usuario con un cupón y los
 * compara con el límite por usuario. Se mockea el cliente de Supabase para
 * probar la lógica sin tocar la BD.
 */

const count = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: async () => ({
    from: () => ({
      select: () => ({
        match: () => ({
          neq: () => count(),
        }),
      }),
    }),
  }),
}));

const { hasCouponQuotaLeft } = await import('@/features/checkout/queries');

beforeEach(() => count.mockReset());

describe('hasCouponQuotaLeft', () => {
  it('permite siempre si el límite es null (ilimitado)', async () => {
    expect(await hasCouponQuotaLeft('c1', 'u1', null)).toBe(true);
    // Ni siquiera consulta la BD cuando no hay límite.
    expect(count).not.toHaveBeenCalled();
  });

  it('permite si el usuario aún no llega al límite', async () => {
    count.mockResolvedValue({ count: 0 });
    expect(await hasCouponQuotaLeft('c1', 'u1', 1)).toBe(true);
  });

  it('bloquea cuando el usuario ya alcanzó el límite', async () => {
    count.mockResolvedValue({ count: 1 });
    expect(await hasCouponQuotaLeft('c1', 'u1', 1)).toBe(false);
  });

  it('bloquea si lo superó (límite mayor que 1)', async () => {
    count.mockResolvedValue({ count: 3 });
    expect(await hasCouponQuotaLeft('c1', 'u1', 3)).toBe(false);
  });

  it('trata un count nulo como cero usos', async () => {
    count.mockResolvedValue({ count: null });
    expect(await hasCouponQuotaLeft('c1', 'u1', 2)).toBe(true);
  });
});
