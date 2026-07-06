'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';

/**
 * Oculta el footer (con el CTA de newsletter) en flujos enfocados como la
 * cuenta y el checkout, donde no aporta.
 */
export function ConditionalFooter() {
  const pathname = usePathname();
  const hide = pathname.startsWith('/account') || pathname.startsWith('/checkout');
  if (hide) return null;
  return <Footer />;
}
