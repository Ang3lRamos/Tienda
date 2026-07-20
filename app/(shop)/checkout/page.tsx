import type { Metadata } from 'next';
import { getUserAddresses } from '@/features/account/queries';
import { getStoreSettings } from '@/features/settings/queries';
import { CheckoutForm } from '@/features/checkout/components/checkout-form';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

export default async function CheckoutPage() {
  const [addresses, settings] = await Promise.all([getUserAddresses(), getStoreSettings()]);

  return (
    <CheckoutForm
      addresses={addresses}
      shippingCost={settings.shippingCost}
      freeShippingThreshold={settings.freeShippingThreshold}
      taxRate={settings.taxRate}
    />
  );
}
