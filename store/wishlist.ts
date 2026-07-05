'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProductSummary } from '@/types/product';

/** Item de wishlist: subconjunto de ProductSummary suficiente para la tarjeta. */
export type WishlistItem = ProductSummary;

interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.id === item.id);
          return {
            items: exists
              ? state.items.filter((i) => i.id !== item.id)
              : [item, ...state.items],
          };
        }),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) })),
      has: (productId) => get().items.some((i) => i.id === productId),
      clear: () => set({ items: [] }),
    }),
    { name: 'atelier-wishlist', storage: createJSONStorage(() => localStorage) },
  ),
);
