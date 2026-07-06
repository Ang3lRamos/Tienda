import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import type { ProfileRow } from '@/types/database.types';

/**
 * Consultas del área de cuenta.
 *
 * IMPORTANTE (patrón del proyecto): las consultas de Supabase se anotan con un
 * tipo de retorno EXPLÍCITO. El parser de tipos de `select()` es muy recursivo
 * y en ciertos contextos (sobre todo en archivos TSX) TypeScript hace bailout a
 * `never`. Al fijar el retorno con `Promise<T>` + `as`, el consumidor recibe
 * siempre el tipo concreto, independientemente de la inferencia interna.
 */

export type AccountProfile = Pick<
  ProfileRow,
  'full_name' | 'email' | 'phone' | 'created_at'
>;

export async function getAccountProfile(
  userId: string,
): Promise<AccountProfile | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('profiles')
    .select('full_name, email, phone, created_at')
    .match({ id: userId })
    .single();
  return (data as AccountProfile | null) ?? null;
}

export async function getCurrentRole(): Promise<string | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.rpc('current_role_name');
  return (data as string | null) ?? null;
}

export interface OrderSummaryRow {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  placedAt: string | null;
  itemCount: number;
}

/** Pedidos del usuario actual (RLS: solo los suyos). */
export async function getUserOrders(): Promise<OrderSummaryRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('orders')
    .select('order_number, status, payment_status, grand_total, placed_at, order_items(id)')
    .order('created_at', { ascending: false });

  const rows =
    (data as unknown as {
      order_number: string;
      status: string;
      payment_status: string;
      grand_total: number;
      placed_at: string | null;
      order_items: { id: string }[];
    }[]) ?? [];

  return rows.map((o) => ({
    orderNumber: o.order_number,
    status: o.status,
    paymentStatus: o.payment_status,
    grandTotal: o.grand_total,
    placedAt: o.placed_at,
    itemCount: (o.order_items ?? []).length,
  }));
}
