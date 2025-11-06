import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Cart, CartItem } from '../../../shared/types';

interface CartStore extends Cart {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: number, variantId?: string) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number, variantId?: string) => number;
}

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (item) => {
        const state = get();
        const existingItemIndex = state.items.findIndex(
          (i) => i.productId === item.productId && i.variant?.id === item.variant?.id
        );

        let newItems: CartItem[];

        if (existingItemIndex > -1) {
          // Item exists, update quantity
          newItems = [...state.items];
          newItems[existingItemIndex].quantity += item.quantity || 1;
        } else {
          // New item, add to cart
          newItems = [
            ...state.items,
            {
              ...item,
              quantity: item.quantity || 1,
            },
          ];
        }

        set({
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems),
        });
      },

      removeItem: (productId, variantId) => {
        const state = get();
        const newItems = state.items.filter(
          (item) => !(item.productId === productId && item.variant?.id === variantId)
        );

        set({
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems),
        });
      },

      updateQuantity: (productId, quantity, variantId) => {
        const state = get();
        const newItems = state.items
          .map((item) => {
            if (item.productId === productId && item.variant?.id === variantId) {
              return { ...item, quantity: Math.max(0, quantity) };
            }
            return item;
          })
          .filter((item) => item.quantity > 0);

        set({
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems),
        });
      },

      clearCart: () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
        });
      },

      getItemQuantity: (productId, variantId) => {
        const state = get();
        const item = state.items.find(
          (i) => i.productId === productId && i.variant?.id === variantId
        );
        return item?.quantity || 0;
      },
    }),
    {
      name: 'cart-storage',
      skipHydration: false,
    }
  )
);
