'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Check, X, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setReviewApproval, deleteReview } from '../actions';
import type { AdminReviewRow } from '../lists';

export function ReviewsManager({ reviews }: { reviews: AdminReviewRow[] }) {
  const [pending, startTransition] = useTransition();

  function approve(id: string, approved: boolean) {
    startTransition(async () => {
      const res = await setReviewApproval(id, approved);
      if (res.error) toast.error(res.error);
      else toast.success(approved ? 'Reseña aprobada' : 'Reseña ocultada');
    });
  }

  function remove(id: string) {
    if (!confirm('¿Eliminar esta reseña?')) return;
    startTransition(async () => {
      const res = await deleteReview(id);
      if (res.error) toast.error(res.error);
      else toast.success('Reseña eliminada');
    });
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">Aún no hay reseñas.</p>;
  }

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <p className="border-2 border-foreground bg-secondary/40 px-4 py-2 text-sm font-bold uppercase">
          {pendingCount} pendiente{pendingCount > 1 ? 's' : ''} de aprobación
        </p>
      )}
      <ul className="space-y-3">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="flex flex-col gap-3 border-2 border-foreground p-4 md:flex-row md:items-start md:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < r.rating ? 'fill-foreground text-foreground' : 'text-muted-foreground'}`}
                    />
                  ))}
                </span>
                <Link
                  href={`/producto/${r.productSlug}`}
                  target="_blank"
                  className="font-display text-sm font-bold uppercase underline-offset-2 hover:underline"
                >
                  {r.productName}
                </Link>
                <span
                  className={`border-2 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase ${
                    r.isApproved ? 'border-border text-muted-foreground' : 'border-foreground'
                  }`}
                >
                  {r.isApproved ? 'Publicada' : 'Pendiente'}
                </span>
              </div>
              {r.title && <p className="text-sm font-medium">{r.title}</p>}
              {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
              <p className="text-xs text-muted-foreground">por {r.author ?? 'Cliente'}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {r.isApproved ? (
                <Button size="sm" variant="ghost" disabled={pending} onClick={() => approve(r.id, false)}>
                  <X className="size-4" /> Ocultar
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled={pending} onClick={() => approve(r.id, true)}>
                  <Check className="size-4" /> Aprobar
                </Button>
              )}
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => remove(r.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
