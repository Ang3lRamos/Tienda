import type { Metadata } from 'next';
import { listCategories } from '@/features/admin/lists';
import { TaxonomyManager } from '@/features/admin/components/taxonomy-manager';

export const metadata: Metadata = { title: 'Categorías' };

export default async function AdminCategoriesPage() {
  const rows = await listCategories();
  return <TaxonomyManager kind="categories" title="Categorías" rows={rows} />;
}
