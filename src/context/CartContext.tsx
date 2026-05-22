"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Product, CartItem, CartState } from "@/types/product";

interface CartContextValue {
  cart: CartState;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = "pits_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({ items: [] });
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch {
        // Invalid stored data, use empty cart
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to sessionStorage on changes
  useEffect(() => {
    if (isHydrated) {
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isHydrated]);

  const addToCart = useCallback((product: Product, quantity: number) => {
    setCart((prev) => {
      const existingIndex = prev.items.findIndex((item) => item.product.id === product.id);
      if (existingIndex >= 0) {
        const newItems = [...prev.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: Math.min(newItems[existingIndex].quantity + quantity, 10),
        };
        return { items: newItems };
      }
      return {
        items: [...prev.items, { product, quantity: Math.min(quantity, 10) }],
      };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => ({
      items: prev.items.filter((item) => item.product.id !== productId),
    }));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => ({
        items: prev.items.filter((item) => item.product.id !== productId),
      }));
      return;
    }
    setCart((prev) => ({
      items: prev.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, 10) }
          : item
      ),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart({ items: [] });
    sessionStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const getItemCount = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.items]);

  const getSubtotal = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart.items]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
