"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductService } from "@/lib/services/productService";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Check, Package } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (productId) fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const productData = await ProductService.getProduct(productId);
      setProduct(productData);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayCategory = (category: string) => {
    if (!category) return "";
    return category.split(",").map((c) => c.trim()).filter(Boolean)[0] || category;
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.productId === productId);

    if (!product) return;

    const totalStock = Object.values(product.warehouses).reduce((sum, wh) => sum + wh.quantity, 0);

    if (totalStock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    const effectivePrice = product.discount && product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price;

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > totalStock) {
        alert(`Cannot add more than ${totalStock} units. You already have ${existingItem.quantity} in cart.`);
        return;
      }
      existingItem.quantity = newQty;
      existingItem.totalStock = totalStock;
    } else {
      if (quantity > totalStock) {
        alert(`Cannot add more than ${totalStock} units.`);
        return;
      }
      cart.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        price: effectivePrice,
        originalPrice: product.discount && product.discount > 0 ? product.price : undefined,
        quantity,
        imageUrl: product.imageUrl,
        totalStock,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-5 w-1/3" />
              <div className="skeleton h-10 w-1/2" />
              <div className="skeleton h-20 w-full" />
              <div className="skeleton h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="h-7 w-7" style={{ color: "#999" }} />
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: "#1a1a1a" }}>Product not found</h1>
            <p className="text-sm mb-4" style={{ color: "#666" }}>This product may have been removed or doesn't exist.</p>
            <Link href="/">
              <Button style={{ backgroundColor: "#BE2635", color: "white" }}>
                Back to Store
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalStock = Object.values(product.warehouses).reduce((sum, wh) => sum + wh.quantity, 0);
  const hasDiscount = product.discount && product.discount > 0;
  const effectivePrice = hasDiscount
    ? product.price * (1 - (product.discount || 0) / 100)
    : product.price;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="hover:underline" style={{ color: "#888" }}>
              Home
            </Link>
            <span style={{ color: "#ccc" }}>/</span>
            <span style={{ color: "#888" }}>{getDisplayCategory(product.category)}</span>
            <span style={{ color: "#ccc" }}>/</span>
            <span className="font-medium truncate" style={{ color: "#333" }}>{product.name}</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 md:py-10 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 max-w-5xl mx-auto">
          {/* Image */}
          <div className="relative animate-fade-in">
            {hasDiscount && (
              <span className="absolute top-3 left-3 z-10 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md" style={{ backgroundColor: "#BE2635" }}>
                -{(product.discount || 0).toFixed(0)}% OFF
              </span>
            )}
            {product.imageUrl ? (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center shadow-sm border border-gray-200">
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2" style={{ color: "#ccc" }} />
                  <span className="text-sm" style={{ color: "#999" }}>No Image</span>
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="animate-fade-in-up space-y-5">
            {/* Category */}
            <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ color: "#366346", backgroundColor: "#e8f5e9" }}>
              {getDisplayCategory(product.category)}
            </span>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: "#1a1a1a" }}>
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-extrabold" style={{ color: "#BE2635" }}>
                    Rs {effectivePrice.toFixed(0)}
                  </span>
                  <span className="text-lg line-through" style={{ color: "#aaa" }}>
                    Rs {product.price.toFixed(0)}
                  </span>
                  <span className="text-sm font-bold px-2 py-0.5 rounded-md" style={{ color: "#BE2635", backgroundColor: "#fce4ec" }}>
                    Save {(product.discount || 0).toFixed(0)}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-extrabold" style={{ color: "#366346" }}>
                  Rs {product.price.toFixed(0)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-gray-200 pt-4">
                <h2 className="text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: "#333" }}>Description</h2>
                <p className="text-sm leading-relaxed" style={{ color: "#555" }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: totalStock > 0 ? "#366346" : "#BE2635" }} />
              <span className="text-sm font-semibold" style={{ color: totalStock > 0 ? "#366346" : "#BE2635" }}>
                {totalStock === 0 ? "Out of Stock" : `${totalStock} in stock`}
              </span>
            </div>

            {/* Add to cart section */}
            {totalStock > 0 && (
              <div className="border-t border-gray-200 pt-5 space-y-4">
                {/* Quantity */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold" style={{ color: "#333" }}>Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2.5 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      style={{ color: "#333" }}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(totalStock, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-14 text-center text-sm font-semibold border-x border-gray-300 py-2.5 outline-none"
                      style={{ color: "#1a1a1a" }}
                      min={1}
                      max={totalStock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(totalStock, quantity + 1))}
                      className="px-3 py-2.5 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      style={{ color: "#333" }}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Add to cart button */}
                <Button
                  onClick={handleAddToCart}
                  className="w-full h-12 text-base font-semibold rounded-xl shadow-md transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: addedToCart ? "#366346" : "#BE2635",
                    color: "white"
                  }}
                  size="lg"
                >
                  {addedToCart ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart — Rs {(effectivePrice * quantity).toFixed(0)}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile sticky add-to-cart bar */}
      {totalStock > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 safe-bottom z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-2.5 py-2 hover:bg-gray-100"
                style={{ color: "#333" }}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-semibold" style={{ color: "#1a1a1a" }}>{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(totalStock, quantity + 1))}
                className="px-2.5 py-2 hover:bg-gray-100"
                style={{ color: "#333" }}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button
              onClick={handleAddToCart}
              className="flex-1 h-11 text-sm font-semibold rounded-xl"
              style={{
                backgroundColor: addedToCart ? "#366346" : "#BE2635",
                color: "white"
              }}
            >
              {addedToCart ? (
                <>
                  <Check className="mr-1.5 h-4 w-4" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-1.5 h-4 w-4" />
                  Add — Rs {(effectivePrice * quantity).toFixed(0)}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
