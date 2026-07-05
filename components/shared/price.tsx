import { cn, formatPrice, discountPercent } from '@/lib/utils';

interface PriceProps {
  value: number;
  compareAt?: number | null;
  className?: string;
  showDiscount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/** Muestra el precio actual, el precio anterior tachado y el % de descuento. */
export function Price({
  value,
  compareAt,
  className,
  showDiscount = true,
  size = 'md',
}: PriceProps) {
  const percent = discountPercent(value, compareAt);
  const onSale = percent > 0;

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  } as const;

  return (
    <div className={cn('flex flex-wrap items-baseline gap-2', className)}>
      <span className={cn('font-medium tabular-nums', sizes[size])}>
        {formatPrice(value)}
      </span>
      {onSale && (
        <>
          <span className="text-sm text-muted-foreground line-through tabular-nums">
            {formatPrice(compareAt!)}
          </span>
          {showDiscount && (
            <span className="bg-foreground px-1.5 py-0.5 text-[0.65rem] font-bold tracking-wider text-background">
              −{percent}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
