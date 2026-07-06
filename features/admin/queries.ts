import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';

export interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  totalStock: number;
  outOfStock: number;
  lowStock: number;
  totalCustomers: number;
  totalOrders: number;
  monthOrders: number;
  monthRevenue: number;
  totalRevenue: number;
}

export interface TopProduct {
  name: string;
  soldCount: number;
}

export interface SalesPoint {
  date: string; // dd/MM
  ingresos: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createServerSupabase();

  const [{ count: totalProducts }, { count: publishedProducts }, { count: totalCustomers }, stock, orders] =
    await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('products_with_stock').select('stock_status, available_stock'),
      supabase.from('orders').select('grand_total, created_at, status'),
    ]);

  const stockRows =
    (stock.data as unknown as { stock_status: string; available_stock: number }[]) ?? [];
  const orderRows =
    (orders.data as unknown as { grand_total: number; created_at: string; status: string }[]) ?? [];

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthOrders = orderRows.filter((o) => new Date(o.created_at) >= startOfMonth);

  return {
    totalProducts: totalProducts ?? 0,
    publishedProducts: publishedProducts ?? 0,
    totalStock: stockRows.reduce((s, r) => s + (r.available_stock ?? 0), 0),
    outOfStock: stockRows.filter((r) => r.stock_status === 'agotado').length,
    lowStock: stockRows.filter((r) => r.stock_status === 'ultimas_unidades').length,
    totalCustomers: totalCustomers ?? 0,
    totalOrders: orderRows.length,
    monthOrders: monthOrders.length,
    monthRevenue: monthOrders.reduce((s, o) => s + o.grand_total, 0),
    totalRevenue: orderRows.reduce((s, o) => s + o.grand_total, 0),
  };
}

export async function getTopProducts(): Promise<TopProduct[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('products')
    .select('name, sold_count')
    .order('sold_count', { ascending: false })
    .limit(5);
  const rows = (data as unknown as { name: string; sold_count: number }[]) ?? [];
  return rows.map((r) => ({ name: r.name, soldCount: r.sold_count }));
}

/** Ingresos por día en los últimos 14 días (para la gráfica). */
export async function getSalesSeries(): Promise<SalesPoint[]> {
  const supabase = await createServerSupabase();
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from('orders')
    .select('grand_total, created_at')
    .gte('created_at', since.toISOString());

  const rows = (data as unknown as { grand_total: number; created_at: string }[]) ?? [];
  const byDay = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    byDay.set(key(d), 0);
  }
  for (const o of rows) {
    const k = key(new Date(o.created_at));
    if (byDay.has(k)) byDay.set(k, (byDay.get(k) ?? 0) + o.grand_total);
  }
  return [...byDay.entries()].map(([date, ingresos]) => ({ date, ingresos }));
}

function key(d: Date) {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}
