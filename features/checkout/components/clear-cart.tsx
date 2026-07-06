'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';

/** Vacía el carrito al montarse (se usa en la página de confirmación). */
export function ClearCart() {
  const clear = useCartStore((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
