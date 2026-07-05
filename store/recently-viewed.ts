'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProductSummary } from '@/types/product';

const MAX = 8;

interface RecentlyViewedState {
  items: ProductSummary[];
  track: (item: ProductSummary) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      track: (item) =>
        set((state) => ({
          items: [item, ...state.items.filter((i) => i.id !== item.id)].slice(0, MAX),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'atelier-recent', storage: createJSONStorage(() => localStorage) },
  ),
);
