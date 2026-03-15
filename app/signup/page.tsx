"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStoreAuth } from "@/contexts/StoreAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { UserPlus, Eye, EyeOff } from "lucide-react";

export default function StoreSignupPage() {
  const router = useRouter();
  const { signUp, loading } = useStoreAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingUp, setSigningUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.name || !formData.phone || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSigningUp(true);
    try {
      await signUp(formData.email, formData.password, formData.name, formData.phone);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setSigningUp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #fafafa 0%, #fff 50%, #f0fdf4 100%)" }}>
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
            <h1 className="text-xl font-bold mb-1" style={{ color: "#1a1a1a" }}>Create your account</h1>
            <p className="text-sm mb-6" style={{ color: "#666" }}>Sign up to track orders & earn loyalty points</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-xl text-sm animate-fade-in" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" }}>
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold" style={{ color: "#333" }}>Full Name *</Label>
                <Input id="name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="John Doe" className="h-11 rounded-xl text-sm" style={{ color: "#1a1a1a" }} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold" style={{ color: "#333" }}>Phone Number *</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required placeholder="98XXXXXXXX" className="h-11 rounded-xl text-sm" style={{ color: "#1a1a1a" }} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold" style={{ color: "#333" }}>Email *</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="you@example.com" className="h-11 rounded-xl text-sm" style={{ color: "#1a1a1a" }} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold" style={{ color: "#333" }}>Password *</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} placeholder="Min. 6 characters" className="h-11 rounded-xl text-sm pr-10" style={{ color: "#1a1a1a" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#999" }}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold" style={{ color: "#333" }}>Confirm Password *</Label>
                <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required minLength={6} placeholder="Re-enter password" className="h-11 rounded-xl text-sm" style={{ color: "#1a1a1a" }} />
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-semibold rounded-xl shadow-md active:scale-[0.98] transition-all"
                style={{ backgroundColor: "#366346", color: "white" }}
                disabled={signingUp || loading}
              >
                {signingUp ? "Creating Account..." : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <p className="text-sm" style={{ color: "#666" }}>
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold hover:underline" style={{ color: "#BE2635" }}>
                    Sign In
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
