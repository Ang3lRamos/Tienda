import type { Metadata } from 'next';
import { WishlistGrid } from '@/features/wishlist/components/wishlist-grid';

export const metadata: Metadata = { title: 'Mis favoritos' };

export default function FavoritosPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl">Mis favoritos</h2>
      <WishlistGrid />
    </div>
  );
}
