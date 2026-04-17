import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    addItem: (product: Product, quantity?: number, size?: string, color?: string) => void;
    removeItem: (productId: number, size?: string) => void;
    updateQuantity: (productId: number, quantity: number, size?: string) => void;
    clearCart: () => void;
    toggleCart: () => void;
    total: () => number;
    itemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (
            set: (
                partial:
                    | CartState
                    | Partial<CartState>
                    | ((state: CartState) => CartState | Partial<CartState>),
                replace?: boolean
            ) => void,
            get: () => CartState
        ): CartState => ({
            items: [],
            isOpen: false,

            addItem: (product, quantity = 1, size, color) => {
                set((state) => {
                    const key = `${product.id}-${size}`;
                    const existing = state.items.find(
                        (i) => `${i.product.id}-${i.size}` === key
                    );
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                `${i.product.id}-${i.size}` === key
                                    ? { ...i, quantity: i.quantity + quantity }
                                    : i
                            ),
                        };
                    }
                    return { items: [...state.items, { product, quantity, size, color }] };
                });
            },

            removeItem: (productId, size) => {
                set((state) => ({
                    items: state.items.filter(
                        (i) => !(i.product.id === productId && i.size === size)
                    ),
                }));
            },

            updateQuantity: (productId, quantity, size) => {
                if (quantity <= 0) {
                    get().removeItem(productId, size);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) =>
                        i.product.id === productId && i.size === size
                            ? { ...i, quantity }
                            : i
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),
            toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

            total: () =>
                get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

            itemCount: () =>
                get().items.reduce((sum, i) => sum + i.quantity, 0),
        }),
        { name: "haba-cart" }
    )
);