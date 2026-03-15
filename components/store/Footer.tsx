"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#1a1a1a" }} className="mt-12">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Image src="/brandlogo.png" alt="Ghimire Kitchen Wares" width={40} height={34} className="h-9 w-auto object-contain brightness-0 invert" />
              <span className="text-xs font-medium tracking-wide" style={{ color: "#aaa" }}>Ghimire Kitchen Wares</span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "#999" }}>
              Your trusted destination for quality kitchen wares. Shop from a wide range of products delivered to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "white" }}>Quick Links</h3>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-sm hover:text-white transition-colors" style={{ color: "#999" }}>Home</Link></li>
              <li><Link href="/cart" className="text-sm hover:text-white transition-colors" style={{ color: "#999" }}>Cart</Link></li>
              <li><Link href="/orders" className="text-sm hover:text-white transition-colors" style={{ color: "#999" }}>My Orders</Link></li>
              <li><Link href="/track" className="text-sm hover:text-white transition-colors" style={{ color: "#999" }}>Track Order</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "white" }}>Account</h3>
            <ul className="space-y-2.5">
              <li><Link href="/login" className="text-sm hover:text-white transition-colors" style={{ color: "#999" }}>Sign In</Link></li>
              <li><Link href="/signup" className="text-sm hover:text-white transition-colors" style={{ color: "#999" }}>Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid #333" }}>
          <p className="text-xs" style={{ color: "#666" }}>
            &copy; {new Date().getFullYear()} Ghimire Kitchen Wares. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
