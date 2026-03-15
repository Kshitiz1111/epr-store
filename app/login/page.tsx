"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStoreAuth } from "@/contexts/StoreAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function StoreLoginPage() {
  const router = useRouter();
  const { signIn, loading } = useStoreAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSigningIn(true);
    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #fafafa 0%, #fff 50%, #fef2f2 100%)" }}>
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/brandlogo.png"
              alt="Ghimire Kitchen Wares"
              width={80}
              height={66}
              className="h-16 w-auto mx-auto mb-3 object-contain"
              priority
            />
            <p className="text-xs font-medium tracking-wide" style={{ color: "#888" }}>Ghimire Kitchen Wares</p>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-xl font-bold mb-1" style={{ color: "#1a1a1a" }}>Welcome back</h1>
            <p className="text-sm mb-6" style={{ color: "#666" }}>Sign in to track orders & earn loyalty points</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-xl text-sm animate-fade-in" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" }}>
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold" style={{ color: "#333" }}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-11 rounded-xl text-sm"
                  style={{ color: "#1a1a1a" }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold" style={{ color: "#333" }}>Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-11 rounded-xl text-sm pr-10"
                    style={{ color: "#1a1a1a" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#999" }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-semibold rounded-xl shadow-md active:scale-[0.98] transition-all"
                style={{ backgroundColor: "#BE2635", color: "white" }}
                disabled={signingIn || loading}
              >
                {signingIn ? "Signing In..." : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <p className="text-sm" style={{ color: "#666" }}>
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="font-semibold hover:underline" style={{ color: "#BE2635" }}>
                    Sign Up
                  </Link>
                </p>
                <Link href="/" className="inline-block mt-2 text-sm hover:underline transition-colors" style={{ color: "#999" }}>
                  Continue as guest →
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
