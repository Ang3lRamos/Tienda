import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'border-2 border-foreground p-5',
        accent && 'bg-foreground text-background',
      )}
    >
      <p
        className={cn(
          'font-display text-[0.65rem] font-bold tracking-[0.16em] uppercase',
          accent ? 'text-background/70' : 'text-muted-foreground',
        )}
      >
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-black tabular-nums">{value}</p>
      {hint && (
        <p className={cn('mt-1 text-xs', accent ? 'text-background/60' : 'text-muted-foreground')}>
          {hint}
        </p>
      )}
    </div>
  );
}
