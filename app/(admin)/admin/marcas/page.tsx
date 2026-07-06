import type { Metadata } from 'next';
import { listBrands } from '@/features/admin/lists';
import { TaxonomyManager } from '@/features/admin/components/taxonomy-manager';

export const metadata: Metadata = { title: 'Marcas' };

export default async function AdminBrandsPage() {
  const rows = await listBrands();
  return <TaxonomyManager kind="brands" title="Marcas" rows={rows} />;
}
