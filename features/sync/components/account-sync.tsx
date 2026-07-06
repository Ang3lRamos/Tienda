'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { mergeCart, saveCart, mergeWishlist, saveWishlist } from '../actions';

/**
 * Sincroniza carrito y wishlist con Supabase cuando hay sesión:
 * - Al iniciar sesión: fusiona lo local con lo del servidor y rehidrata el store.
 * - En cada cambio posterior: guarda (con debounce) en la BD.
 * Para invitados no hace nada (todo queda en localStorage).
 */
export function AccountSync({ isAuthed }: { isAuthed: boolean }) {
  const synced = useRef(false);

  // Fusión al iniciar sesión.
  useEffect(() => {
    if (!isAuthed) {
      synced.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const localCart = useCartStore
          .getState()
          .items.filter((i) => i.variantId)
          .map((i) => ({ variantId: i.variantId as string, quantity: i.quantity }));
        const cart = await mergeCart(localCart);
        if (!cancelled) useCartStore.getState().setItems(cart);

        const localWish = useWishlistStore.getState().items.map((i) => i.id);
        const wish = await mergeWishlist(localWish);
        if (!cancelled) useWishlistStore.getState().setItems(wish);
      } catch {
        /* si falla, se sigue usando el estado local */
      } finally {
        if (!cancelled) synced.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  // Guardado con debounce ante cambios.
  useEffect(() => {
    if (!isAuthed) return;
    let cartT: ReturnType<typeof setTimeout>;
    let wishT: ReturnType<typeof setTimeout>;

    const unsubCart = useCartStore.subscribe((state) => {
      if (!synced.current) return;
      clearTimeout(cartT);
      const pairs = state.items
        .filter((i) => i.variantId)
        .map((i) => ({ variantId: i.variantId as string, quantity: i.quantity }));
      cartT = setTimeout(() => void saveCart(pairs), 900);
    });

    const unsubWish = useWishlistStore.subscribe((state) => {
      if (!synced.current) return;
      clearTimeout(wishT);
      const ids = state.items.map((i) => i.id);
      wishT = setTimeout(() => void saveWishlist(ids), 900);
    });

    return () => {
      unsubCart();
      unsubWish();
      clearTimeout(cartT);
      clearTimeout(wishT);
    };
  }, [isAuthed]);

  return null;
}
