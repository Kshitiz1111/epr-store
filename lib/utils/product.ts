import { Product } from "@/lib/types";

/**
 * Returns the first category from a comma-separated category string.
 */
export function getDisplayCategory(category: string): string {
  if (!category) return "";
  const parts = category.split(",").map((c) => c.trim()).filter(Boolean);
  return parts[0] || category;
}

/**
 * Extracts all unique categories from a list of products.
 * Handles comma-separated category strings by splitting them.
 */
export function extractCategories(products: Product[]): string[] {
  const cats = new Set<string>();
  products.forEach((p) => {
    if (p.category) {
      p.category.split(",").map((c) => c.trim()).filter(Boolean).forEach((part) => cats.add(part));
    }
  });
  return Array.from(cats).sort();
}

/**
 * Sum total stock across all warehouses for a product.
 */
export function getTotalStock(product: Product): number {
  return Object.values(product.warehouses).reduce((sum, wh) => sum + wh.quantity, 0);
}

/**
 * Whether a product has an active discount.
 */
export function hasProductDiscount(product: Product): boolean {
  return (product.discount ?? 0) > 0;
}

/**
 * Get the effective (discounted) price for a product.
 */
export function getEffectivePrice(product: Product): number {
  if (hasProductDiscount(product)) {
    return product.price * (1 - (product.discount || 0) / 100);
  }
  return product.price;
}

/**
 * Filter products by category (matches any part of comma-separated string).
 */
export function filterByCategory(products: Product[], category: string | null): Product[] {
  if (!category) return products;
  return products.filter((p) => {
    if (!p.category) return false;
    const parts = p.category.split(",").map((c) => c.trim().toLowerCase());
    return parts.includes(category.toLowerCase());
  });
}
