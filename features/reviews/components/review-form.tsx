'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createReviewAction } from '@/features/reviews/actions';
import { cn } from '@/lib/utils';
import type { ReviewEligibility } from '@/features/reviews/queries';

export function ReviewForm({
  productId,
  productSlug,
  eligibility,
}: {
  productId: string;
  productSlug: string;
  eligibility: ReviewEligibility;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(eligibility.own?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState(eligibility.own?.title ?? '');
  const [comment, setComment] = useState(eligibility.own?.comment ?? '');

  if (!eligibility.isLoggedIn) {
    return (
      <div className="border-2 border-dashed border-border p-5 text-sm text-muted-foreground">
        <Link href={`/login?redirect=/producto/${productSlug}`} className="font-bold text-foreground underline">
          Inicia sesión
        </Link>{' '}
        y opina sobre los productos que has comprado.
      </div>
    );
  }

  if (!eligibility.hasPurchased) {
    return (
      <div className="border-2 border-dashed border-border p-5 text-sm text-muted-foreground">
        Podrás dejar tu opinión cuando compres este producto.
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Elige una calificación.');
      return;
    }
    startTransition(async () => {
      const res = await createReviewAction({ productId, rating, title, comment }, productSlug);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success('¡Gracias! Tu opinión se publicará tras revisión.');
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border-2 border-foreground p-5">
      <div>
        <p className="font-display text-sm font-bold uppercase tracking-[0.12em]">
          {eligibility.own ? 'Editar tu opinión' : 'Escribe tu opinión'}
        </p>
        {eligibility.own && !eligibility.own.isApproved && (
          <p className="mt-1 text-xs text-muted-foreground">
            Tu reseña está pendiente de aprobación.
          </p>
        )}
      </div>

      <div className="flex items-center gap-1" role="radiogroup" aria-label="Calificación">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5"
          >
            <Star
              className={cn(
                'size-7 transition-colors',
                (hover || rating) >= n ? 'fill-foreground text-foreground' : 'text-muted-foreground',
              )}
            />
          </button>
        ))}
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título (opcional)"
        maxLength={120}
        className="h-11 rounded-none border-2"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Cuéntanos qué te pareció…"
        maxLength={1000}
        rows={4}
        className="w-full resize-none border-2 border-border bg-transparent p-3 text-sm outline-none focus:border-foreground"
      />

      <Button type="submit" disabled={pending}>
        {pending ? 'Publicando…' : eligibility.own ? 'Actualizar opinión' : 'Publicar opinión'}
      </Button>
    </form>
  );
}
