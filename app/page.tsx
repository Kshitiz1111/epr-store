"use client";

import { useEffect, useState, useMemo } from "react";
import { ProductService } from "@/lib/services/productService";
import { Product } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Fuse from "fuse.js";
import { Search, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { CategoryBar } from "@/components/store/CategoryBar";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductSkeleton } from "@/components/store/ProductSkeleton";
import { extractCategories, filterByCategory } from "@/lib/utils/product";

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setError(null);
      const productList = await ProductService.getAllProducts();
      setProducts(productList.filter((p) => p.isActive));
    } catch (error: any) {
      console.error("Error fetching products:", error);
      if (error?.code === "permission-denied" || error?.message?.includes("permission")) {
        setError("Unable to load products. Please check Firestore security rules to allow public read access to products.");
      } else {
        setError("Failed to load products. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => extractCategories(products), [products]);

  const filteredProducts = useMemo(() => {
    let result = filterByCategory(products, selectedCategory);

    if (searchQuery.trim()) {
      const fuse = new Fuse(result, {
        keys: ["name", "sku", "category", "description"],
        threshold: 0.3,
      });
      result = fuse.search(searchQuery).map((r) => r.item);
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Hero banner */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #BE2635 0%, #9a1e2b 40%, #366346 100%)" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="container max-w-7xl mx-auto px-4 py-8 md:py-14 relative">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex-1 text-center md:text-left">
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight mb-3"
                style={{ color: "white" }}
              >
                Quality Kitchen Wares
                <br />
                <span style={{ color: "rgba(255,255,255,0.9)" }}>Delivered to Your Door</span>
              </h1>
              <p
                className="text-sm md:text-base max-w-md mx-auto md:mx-0 mb-5"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                Browse our curated collection of premium kitchen products. From cookware to utensils
                — everything your kitchen needs.
              </p>
              {/* Search */}
              <div className="relative max-w-md mx-auto md:mx-0">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "#999" }}
                />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white border-0 rounded-xl shadow-lg text-sm"
                  style={{ color: "#1a1a1a" }}
                  id="hero-search"
                />
              </div>
            </div>
            <div className="hidden md:block shrink-0">
              <Image
                src="/heroimage.png"
                alt="Ghimire Kitchen Wares"
                width={250}
                height={250}
                className="w-80 h-auto object-contain drop-shadow-2xl opacity-90"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category bar */}
      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Products section */}
      <main className="container mx-auto px-4 py-6 flex-1">
        {/* Results info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: "#666" }}>
            {loading ? (
              "Loading..."
            ) : (
              <>
                <span className="font-semibold" style={{ color: "#1a1a1a" }}>
                  {filteredProducts.length}
                </span>{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
                {selectedCategory && (
                  <span>
                    {" "}
                    in{" "}
                    <span className="font-medium" style={{ color: "#BE2635" }}>
                      {selectedCategory}
                    </span>
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {loading ? (
          <ProductSkeleton />
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="font-semibold mb-2" style={{ color: "#BE2635" }}>
                Error Loading Products
              </p>
              <p className="text-sm mb-4" style={{ color: "#9a1e2b" }}>
                {error}
              </p>
              <Button onClick={fetchProducts} style={{ backgroundColor: "#BE2635", color: "white" }}>
                Try Again
              </Button>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="h-7 w-7" style={{ color: "#999" }} />
            </div>
            <p className="font-medium mb-1" style={{ color: "#333" }}>
              No products found
            </p>
            <p className="text-sm" style={{ color: "#888" }}>
              {searchQuery ? "Try a different search term" : "Check back later for new products"}
            </p>
            {(searchQuery || selectedCategory) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
