import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ShopifyProduct } from "./shopify";

// Local, Lovable Cloud–only cart. No Shopify calls.
// Persists to localStorage; checkout will be wired to Stripe/Paddle later.

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  addManyItems: (items: Array<Omit<CartItem, "lineId">>) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
}

function makeLineId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,

      addItem: async (item) => {
        set({ isLoading: true });
        try {
          const items = get().items;
          const existing = items.find((i) => i.variantId === item.variantId);
          if (existing) {
            set({
              items: items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            });
          } else {
            set({ items: [...items, { ...item, lineId: makeLineId() }] });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      addManyItems: async (newItems) => {
        set({ isLoading: true });
        try {
          const items = [...get().items];
          for (const item of newItems) {
            const idx = items.findIndex((i) => i.variantId === item.variantId);
            if (idx >= 0) {
              items[idx] = { ...items[idx], quantity: items[idx].quantity + item.quantity };
            } else {
              items.push({ ...item, lineId: makeLineId() });
            }
          }
          set({ items });
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        set({
          items: get().items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        });
      },

      removeItem: async (variantId) => {
        const next = get().items.filter((i) => i.variantId !== variantId);
        if (next.length === 0) get().clearCart();
        else set({ items: next });
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => "/checkout",
      syncCart: async () => {
        /* no-op on local cart */
      },
    }),
    {
      name: "frass-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, cartId: s.cartId, checkoutUrl: s.checkoutUrl }),
    },
  ),
);
