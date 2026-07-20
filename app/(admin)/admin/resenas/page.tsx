import type { Metadata } from 'next';
import { listReviews } from '@/features/admin/lists';
import { ReviewsManager } from '@/features/admin/components/reviews-manager';

export const metadata: Metadata = { title: 'Reseñas' };

export default async function AdminReviewsPage() {
  const reviews = await listReviews();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl md:text-5xl">Reseñas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aprueba o rechaza las opiniones de los clientes. Solo las aprobadas se muestran en la tienda.
        </p>
      </div>
      <ReviewsManager reviews={reviews} />
    </div>
  );
}
