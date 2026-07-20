'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProductSummary } from '@/types/product';

/** Máximo de productos comparables a la vez (la tabla deja de ser legible). */
export const MAX_COMPARE = 4;

export type CompareItem = ProductSummary;

interface CompareState {
  items: CompareItem[];
  /** Añade o quita. Devuelve false si no cabe (ya hay MAX_COMPARE). */
  toggle: (item: CompareItem) => boolean;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.some((i) => i.id === item.id);
        if (exists) {
          set((state) => ({ items: state.items.filter((i) => i.id !== item.id) }));
          return true;
        }
        if (get().items.length >= MAX_COMPARE) return false;
        set((state) => ({ items: [...state.items, item] }));
        return true;
      },
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) })),
      has: (productId) => get().items.some((i) => i.id === productId),
      clear: () => set({ items: [] }),
    }),
    { name: 'atelier-compare', storage: createJSONStorage(() => localStorage) },
  ),
);
