import type { Metadata } from 'next';
import { listInventory } from '@/features/admin/lists';
import { InventoryManager } from '@/features/admin/components/inventory-manager';

export const metadata: Metadata = { title: 'Inventario' };

export default async function AdminInventoryPage() {
  const rows = await listInventory();
  return <InventoryManager rows={rows} />;
}
