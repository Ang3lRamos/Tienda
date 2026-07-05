'use client';

import { useEffect, useState } from 'react';

/**
 * Devuelve true tras el montaje en cliente. Útil para diferir la lectura de
 * stores persistidos (localStorage) y evitar mismatches de hidratación.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
