'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatPrice } from '@/lib/utils';
import type { SalesPoint } from '../queries';

export function SalesChart({ data }: { data: SalesPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            width={70}
            tickFormatter={(v) => formatPrice(Number(v))}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-secondary)' }}
            formatter={(v) => [formatPrice(Number(v)), 'Ingresos']}
            contentStyle={{
              background: 'var(--color-background)',
              border: '2px solid var(--color-foreground)',
              borderRadius: 0,
              fontSize: 12,
            }}
          />
          <Bar dataKey="ingresos" fill="var(--color-foreground)" radius={0} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
