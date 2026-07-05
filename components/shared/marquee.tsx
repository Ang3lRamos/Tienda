import { cn } from '@/lib/utils';

/**
 * Cinta de texto en movimiento (marquee) estilo editorial.
 * Duplica el contenido para un loop continuo. Respeta prefers-reduced-motion.
 */
export function Marquee({
  items,
  className,
  speed = 'normal',
  separator = '✳',
}: {
  items: string[];
  className?: string;
  speed?: 'normal' | 'fast';
  separator?: string;
}) {
  const track = [...items, ...items];
  return (
    <div className={cn('flex overflow-hidden whitespace-nowrap', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center',
          speed === 'fast' ? 'animate-marquee-fast' : 'animate-marquee',
        )}
      >
        {track.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="px-6 text-xs font-bold tracking-[0.2em] uppercase">
              {item}
            </span>
            <span aria-hidden className="text-xs opacity-50">
              {separator}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
