"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStoreAuth } from "@/contexts/StoreAuthContext";
import { ShoppingCart, Menu, LogOut } from "lucide-react";
import { MobileNav } from "./MobileNav";

export function Header() {
  const { customer, signOut } = useStoreAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartCount(count);
      } catch { setCartCount(0); }
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart-updated", updateCartCount);
    const interval = setInterval(updateCartCount, 2000);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart-updated", updateCartCount);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm"
          }`}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #BE2635, #BE2635 70%, #366346)" }} />

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 transition-colors"
              style={{ color: "#333" }}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/brandlogo.png"
                alt="Ghimire Kitchen Wares"
                width={48}
                height={40}
                className="h-9 md:h-11 w-auto object-contain"
                priority
              />
              <div className="hidden sm:block">
                <span className="text-xs font-medium tracking-wide leading-none" style={{ color: "#666" }}>
                  Ghimire Kitchen Wares
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-red-50" style={{ color: "#333" }}>
                Home
              </Link>
              <Link href="/orders" className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-red-50" style={{ color: "#333" }}>
                My Orders
              </Link>
              <Link href="/track" className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-red-50" style={{ color: "#333" }}>
                Track Order
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Desktop auth */}
              <div className="hidden md:flex items-center gap-2">
                {customer ? (
                  <button
                    onClick={signOut}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg hover:bg-red-50 transition-all"
                    style={{ color: "#666" }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link href="/login" className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-red-50 transition-all" style={{ color: "#333" }}>
                      Sign In
                    </Link>
                    <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all" style={{ backgroundColor: "#BE2635" }}>
                      Sign Up
                    </Link>
                  </>
                )}
              </div>

              {/* Cart button */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-lg hover:bg-red-50 transition-all"
                style={{ color: "#333" }}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 animate-fade-in" style={{ backgroundColor: "#BE2635" }}>
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        customer={customer}
        onSignOut={signOut}
      />
    </>
  );
}
