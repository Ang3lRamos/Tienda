import type { Metadata } from 'next';
import { getUserAddresses } from '@/features/account/queries';
import { CheckoutForm } from '@/features/checkout/components/checkout-form';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

export default async function CheckoutPage() {
  const addresses = await getUserAddresses();
  return <CheckoutForm addresses={addresses} />;
}
