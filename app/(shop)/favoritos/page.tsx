import type { Metadata } from 'next';
import { WishlistGrid } from '@/features/wishlist/components/wishlist-grid';

export const metadata: Metadata = { title: 'Favoritos' };

export default function FavoritosPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6">
      <header className="mb-10">
        <p className="kicker text-muted-foreground">Tu selección</p>
        <h1 className="mt-2 text-5xl md:text-7xl">Favoritos</h1>
      </header>
      <WishlistGrid />
    </div>
  );
}
