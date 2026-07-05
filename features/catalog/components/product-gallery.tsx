'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductImageView } from '@/types/product';

/** Galería con miniaturas y zoom al mover el cursor. */
export function ProductGallery({
  images,
  name,
}: {
  images: ProductImageView[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const ref = useRef<HTMLDivElement>(null);

  const current = images[active];

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-3 md:flex-col">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={cn(
                'relative aspect-square w-16 shrink-0 overflow-hidden border-2 bg-muted transition-colors',
                i === active ? 'border-foreground' : 'border-transparent hover:border-border',
              )}
            >
              <Image src={img.url} alt={img.alt ?? name} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Imagen principal */}
      <div
        ref={ref}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        className="relative aspect-4/5 flex-1 cursor-zoom-in overflow-hidden bg-muted"
      >
        {current ? (
          <Image
            src={current.url}
            alt={current.alt ?? name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className={cn('object-cover transition-transform duration-200', zoom && 'scale-150')}
            style={{ transformOrigin: origin }}
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <ImageIcon className="size-10" />
          </div>
        )}
      </div>
    </div>
  );
}
