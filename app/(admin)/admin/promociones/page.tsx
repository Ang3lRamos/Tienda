import type { Metadata } from 'next';
import {
  listPromotions,
  listCoupons,
  listCategories,
  listBrands,
} from '@/features/admin/lists';
import { PromotionsManager } from '@/features/admin/components/promotions-manager';
import { CouponsManager } from '@/features/admin/components/coupons-manager';

export const metadata: Metadata = { title: 'Promociones' };

export default async function AdminPromotionsPage() {
  const [promotions, coupons, categories, brands] = await Promise.all([
    listPromotions(),
    listCoupons(),
    listCategories(),
    listBrands(),
  ]);

  return (
    <div className="space-y-10">
      <h1 className="text-4xl md:text-5xl">Promociones y cupones</h1>
      <PromotionsManager
        rows={promotions}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
      />
      <CouponsManager rows={coupons} />
    </div>
  );
}
