import type { Metadata } from 'next';
import { getUserAddresses } from '@/features/account/queries';
import { AddressesManager } from '@/features/account/components/addresses-manager';

export const metadata: Metadata = { title: 'Mis direcciones' };

export default async function DireccionesPage() {
  const addresses = await getUserAddresses();
  return <AddressesManager addresses={addresses} />;
}
