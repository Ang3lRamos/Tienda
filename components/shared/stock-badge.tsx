import { Badge } from '@/components/ui/badge';
import { stockStatusLabel } from '@/lib/utils';
import type { StockStatus } from '@/types/database.types';

const variantByStatus: Record<
  StockStatus,
  React.ComponentProps<typeof Badge>['variant']
> = {
  disponible: 'success',
  ultimas_unidades: 'warning',
  agotado: 'destructive',
};

/** Etiqueta visual del estado de inventario. */
export function StockBadge({
  status,
  className,
}: {
  status: StockStatus;
  className?: string;
}) {
  return (
    <Badge variant={variantByStatus[status]} className={className}>
      {stockStatusLabel(status)}
    </Badge>
  );
}
