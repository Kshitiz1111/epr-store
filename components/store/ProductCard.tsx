"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/lib/types";
import {
  getDisplayCategory,
  getTotalStock,
  hasProductDiscount,
  getEffectivePrice,
} from "@/lib/utils/product";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const totalStock = getTotalStock(product);
  const discount = hasProductDiscount(product);
  const effectivePrice = getEffectivePrice(product);

  return (
    <Link
      href={`/${product.id}`}
      className={`animate-fade-in-up stagger-${Math.min((index % 6) + 1, 6)}`}
    >
      <div className="product-card bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 h-full flex flex-col relative">
        {/* Discount badge */}
        {discount && (
          <span className="discount-badge">
            -{(product.discount || 0).toFixed(0)}%
          </span>
        )}

        {/* Out of stock overlay */}
        {totalStock === 0 && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <span
              className="text-white text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "#333" }}
            >
              Out of Stock
            </span>
          </div>
        )}

        {/* Image */}
        <div className="relative aspect-square bg-gray-50">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-1 rounded-full bg-gray-200 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5" style={{ color: "#bbb" }} />
                </div>
                <span className="text-xs" style={{ color: "#999" }}>No Image</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          {/* Category */}
          <span
            className="text-[10px] font-bold uppercase tracking-wider mb-1"
            style={{ color: "#366346" }}
          >
            {getDisplayCategory(product.category)}
          </span>

          {/* Name */}
          <h3
            className="text-sm font-semibold mb-2 line-clamp-2 leading-snug flex-1"
            style={{ color: "#1a1a1a" }}
          >
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-auto">
            {discount ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold" style={{ color: "#BE2635" }}>
                  Rs {effectivePrice.toFixed(0)}
                </span>
                <span className="text-xs line-through" style={{ color: "#aaa" }}>
                  Rs {product.price.toFixed(0)}
                </span>
              </div>
            ) : (
              <span className="text-base font-bold" style={{ color: "#366346" }}>
                Rs {product.price.toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
