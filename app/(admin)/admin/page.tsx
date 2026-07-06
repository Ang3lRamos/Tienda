import type { Metadata } from 'next';
import { getDashboardStats, getTopProducts, getSalesSeries } from '@/features/admin/queries';
import { StatCard } from '@/features/admin/components/stat-card';
import { SalesChart } from '@/features/admin/components/sales-chart';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function AdminDashboardPage() {
  const [stats, topProducts, sales] = await Promise.all([
    getDashboardStats(),
    getTopProducts(),
    getSalesSeries(),
  ]);

  const maxSold = Math.max(1, ...topProducts.map((p) => p.soldCount));

  return (
    <div className="space-y-8">
      <div>
        <p className="kicker text-muted-foreground">Resumen</p>
        <h1 className="mt-1 text-4xl md:text-5xl">Dashboard</h1>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ingresos totales" value={formatPrice(stats.totalRevenue)} accent />
        <StatCard label="Ventas del mes" value={stats.monthOrders} hint={formatPrice(stats.monthRevenue)} />
        <StatCard label="Pedidos totales" value={stats.totalOrders} />
        <StatCard label="Clientes" value={stats.totalCustomers} />
        <StatCard label="Productos" value={stats.totalProducts} hint={`${stats.publishedProducts} publicados`} />
        <StatCard label="Stock disponible" value={stats.totalStock} hint="unidades" />
        <StatCard label="Poco stock" value={stats.lowStock} hint="últimas unidades" />
        <StatCard label="Agotados" value={stats.outOfStock} />
      </div>

      {/* Gráfica + top productos */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="border-2 border-foreground p-5">
          <h2 className="mb-4 text-xl">Ingresos · últimos 14 días</h2>
          <SalesChart data={sales} />
        </div>
        <div className="border-2 border-foreground p-5">
          <h2 className="mb-4 text-xl">Más vendidos</h2>
          <ul className="space-y-4">
            {topProducts.map((p) => (
              <li key={p.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="line-clamp-1 font-medium uppercase">{p.name}</span>
                  <span className="tabular-nums text-muted-foreground">{p.soldCount}</span>
                </div>
                <div className="mt-1.5 h-2 bg-secondary">
                  <div
                    className="h-full bg-foreground"
                    style={{ width: `${(p.soldCount / maxSold) * 100}%` }}
                  />
                </div>
              </li>
            ))}
            {topProducts.length === 0 && (
              <li className="text-sm text-muted-foreground">Sin datos aún.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
