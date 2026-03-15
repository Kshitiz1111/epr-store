"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";

interface CategoryBarProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryBar({ categories, selectedCategory, onSelectCategory }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  if (categories.length === 0) return null;

  // Capitalize first letter of each category for display
  const formatCategory = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
  };

  return (
    <div className="sticky top-[65px] md:top-[81px] z-40 bg-white border-b" style={{ borderColor: "#e5e5e5" }}>
      <div className="container mx-auto px-4">
        <div className="relative flex items-center py-2.5">
          {/* Left scroll button */}
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex shrink-0 p-1.5 rounded-lg hover:bg-red-50 transition-all mr-1"
            style={{ color: "#999" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Scrollable categories */}
          <div ref={scrollRef} className="flex-1 flex items-center gap-2 overflow-x-auto category-scroll scroll-smooth">
            {/* All button */}
            <button
              onClick={() => onSelectCategory(null)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full transition-all whitespace-nowrap"
              style={
                selectedCategory === null
                  ? { backgroundColor: "#BE2635", color: "white" }
                  : { backgroundColor: "#f3f3f3", color: "#333" }
              }
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              All
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className="shrink-0 px-4 py-2 text-sm font-semibold rounded-full transition-all whitespace-nowrap"
                style={
                  selectedCategory === cat
                    ? { backgroundColor: "#BE2635", color: "white" }
                    : { backgroundColor: "#f3f3f3", color: "#333" }
                }
              >
                {formatCategory(cat)}
              </button>
            ))}
          </div>

          {/* Right scroll button */}
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex shrink-0 p-1.5 rounded-lg hover:bg-red-50 transition-all ml-1"
            style={{ color: "#999" }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
