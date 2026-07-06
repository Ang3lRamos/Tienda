import type { Metadata } from 'next';
import { listProducts, listCategories, listBrands } from '@/features/admin/lists';
import { ProductsManager } from '@/features/admin/components/products-manager';

export const metadata: Metadata = { title: 'Productos' };

export default async function AdminProductsPage() {
  const [rows, categories, brands] = await Promise.all([
    listProducts(),
    listCategories(),
    listBrands(),
  ]);
  return (
    <ProductsManager
      rows={rows}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      brands={brands.map((b) => ({ id: b.id, name: b.name }))}
    />
  );
}
