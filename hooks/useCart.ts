"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CartItem,
  getCart,
  setCart,
  clearCart as clearCartUtil,
  updateCartItemQuantity,
  removeCartItem,
} from "@/lib/utils/cart";

/**
 * Custom hook for cart state management.
 * Listens to `cart-updated` events and keeps state in sync.
 */
export function useCart() {
  const [cart, setCartState] = useState<CartItem[]>([]);

  // Load cart on mount and listen for updates
  useEffect(() => {
    setCartState(getCart());

    const handleCartUpdate = () => setCartState(getCart());
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    updateCartItemQuantity(productId, quantity);
    setCartState(getCart());
  }, []);

  const removeItem = useCallback((productId: string) => {
    removeCartItem(productId);
    setCartState(getCart());
  }, []);

  const clearCart = useCallback(() => {
    clearCartUtil();
    setCartState([]);
  }, []);

  const updateCart = useCallback((newCart: CartItem[]) => {
    setCart(newCart);
    setCartState(newCart);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    updateQuantity,
    removeItem,
    clearCart,
    updateCart,
    subtotal,
    itemCount,
  };
}
