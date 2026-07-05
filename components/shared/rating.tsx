import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  count?: number;
  className?: string;
  size?: number;
}

/** Estrellas de valoración (0–5), con relleno parcial según el promedio. */
export function Rating({ value, count, className, size = 14 }: RatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex" aria-label={`Valoración ${value} de 5`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, value - i));
          return (
            <span key={i} className="relative" style={{ width: size, height: size }}>
              <Star size={size} className="absolute text-muted-foreground/40" />
              <span
                className="absolute overflow-hidden"
                style={{ width: `${fill * 100}%`, height: size }}
              >
                <Star size={size} className="fill-foreground text-foreground" />
              </span>
            </span>
          );
        })}
      </div>
      {typeof count === 'number' && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
