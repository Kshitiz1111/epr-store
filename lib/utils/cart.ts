import { Product } from "@/lib/types";
import { getEffectivePrice, getTotalStock, hasProductDiscount } from "./product";

export interface CartItem {
  productId: string;
  productName: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  imageUrl?: string;
  totalStock?: number;
}

const CART_KEY = "cart";

function dispatchCartEvent() {
  window.dispatchEvent(new Event("cart-updated"));
}

/**
 * Read cart from localStorage.
 */
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

/**
 * Write cart to localStorage and dispatch update event.
 */
export function setCart(cart: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  dispatchCartEvent();
}

/**
 * Clear the entire cart.
 */
export function clearCart(): void {
  setCart([]);
}

/**
 * Add a product to the cart (or increase quantity of existing item).
 * Returns an error message string if the operation fails, or null on success.
 */
export function addToCart(product: Product, quantity: number): string | null {
  const cart = getCart();
  const existingItem = cart.find((item) => item.productId === product.id);
  const totalStock = getTotalStock(product);

  if (totalStock <= 0) {
    return "This product is out of stock.";
  }

  const effectivePrice = getEffectivePrice(product);

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > totalStock) {
      return `Cannot add more than ${totalStock} units. You already have ${existingItem.quantity} in cart.`;
    }
    existingItem.quantity = newQty;
    existingItem.totalStock = totalStock;
  } else {
    if (quantity > totalStock) {
      return `Cannot add more than ${totalStock} units.`;
    }
    cart.push({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      price: effectivePrice,
      originalPrice: hasProductDiscount(product) ? product.price : undefined,
      quantity,
      imageUrl: product.imageUrl,
      totalStock,
    });
  }

  setCart(cart);
  return null;
}

/**
 * Update quantity for a specific cart item.
 */
export function updateCartItemQuantity(productId: string, quantity: number): void {
  const cart = getCart().map((item) => {
    if (item.productId === productId) {
      const maxQty = item.totalStock || Infinity;
      return { ...item, quantity: Math.min(maxQty, Math.max(1, quantity)) };
    }
    return item;
  });
  setCart(cart);
}

/**
 * Remove an item from the cart.
 */
export function removeCartItem(productId: string): void {
  setCart(getCart().filter((item) => item.productId !== productId));
}
