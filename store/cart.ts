'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  key: string; // variantId, o productId si no hay variante
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  image: string | null;
  color: string | null;
  size: string | null;
  unitPrice: number;
  maxStock: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, 'quantity' | 'key'>, qty?: number) => void;
  updateQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setItems: (items: CartItem[]) => void;
}

function keyOf(item: { variantId: string | null; productId: string }) {
  return item.variantId ?? item.productId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((state) => {
          const key = keyOf(item);
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            const quantity = Math.min(existing.maxStock, existing.quantity + qty);
            return {
              items: state.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
            };
          }
          const quantity = Math.min(item.maxStock || qty, qty);
          return { items: [...state.items, { ...item, key, quantity }] };
        }),
      updateQty: (key, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.key === key ? { ...i, quantity: Math.max(0, Math.min(i.maxStock, qty)) } : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      remove: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
      setItems: (items) => set({ items }),
    }),
    { name: 'atelier-cart', storage: createJSONStorage(() => localStorage) },
  ),
);

/** Selectores derivados. */
export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
