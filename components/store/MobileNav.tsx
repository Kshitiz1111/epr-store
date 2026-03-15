"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Home, ShoppingCart, Package, MapPin, LogOut, LogIn, UserPlus } from "lucide-react";
import { Customer } from "@/lib/types";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSignOut: () => void;
}

export function MobileNav({ isOpen, onClose, customer, onSignOut }: MobileNavProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const navLinks = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/cart", icon: ShoppingCart, label: "Cart" },
    { href: "/orders", icon: Package, label: "My Orders" },
    { href: "/track", icon: MapPin, label: "Track Order" },
  ];

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl animate-slide-in-left flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid #e5e5e5" }}>
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
            <Image src="/brandlogo.png" alt="Ghimire Kitchen Wares" width={40} height={34} className="h-9 w-auto object-contain" />
            <span className="text-[11px] font-medium tracking-wide" style={{ color: "#666" }}>
              Ghimire Kitchen Wares
            </span>
          </Link>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "#999" }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Customer greeting */}
        {customer && (
          <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: "linear-gradient(135deg, #fef2f2, #f0fdf4)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: "#BE2635" }}>
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{customer.name}</p>
                <p className="text-xs" style={{ color: "#888" }}>{customer.email || customer.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl hover:bg-red-50 transition-all active:scale-[0.98]"
                style={{ color: "#333" }}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Auth section */}
        <div className="p-4 safe-bottom" style={{ borderTop: "1px solid #e5e5e5" }}>
          {customer ? (
            <button
              onClick={() => { onSignOut(); onClose(); }}
              className="flex items-center gap-3 w-full px-3 py-3 text-sm font-medium rounded-xl hover:bg-red-50 transition-all"
              style={{ color: "#666" }}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          ) : (
            <div className="space-y-2">
              <Link href="/login" onClick={onClose} className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white rounded-xl transition-all active:scale-[0.98]" style={{ backgroundColor: "#BE2635" }}>
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link href="/signup" onClick={onClose} className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold rounded-xl transition-all active:scale-[0.98]" style={{ color: "#BE2635", border: "2px solid #BE2635" }}>
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
