"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderService } from "@/lib/services/orderService";
import { Order } from "@/lib/types";
import { Search, MapPin } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { OrderStatusBadge } from "@/components/store/OrderStatusBadge";
import { formatPrice } from "@/lib/utils/order";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastOrderNumber = localStorage.getItem("lastOrderNumber");
      const lastOrderPhone = localStorage.getItem("lastOrderPhone");
      if (lastOrderNumber) setOrderNumber(lastOrderNumber);
      if (lastOrderPhone) setPhone(lastOrderPhone);
    }
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    if (!orderNumber) { setError("Please enter your order number"); return; }
    if (!phone && !email) { setError("Please enter your phone number or email"); return; }
    setLoading(true);
    try {
      const foundOrder = await OrderService.getOrderByNumber(orderNumber);
      if (!foundOrder) { setError("Order not found. Please check your order number."); setLoading(false); return; }
      const phoneMatch = phone && foundOrder.customerInfo.phone === phone;
      const emailMatch = email && foundOrder.customerInfo.email === email;
      if (!phoneMatch && !emailMatch) { setError("Order found but phone/email doesn't match."); setLoading(false); return; }
      setOrder(foundOrder);
    } catch (err: any) { setError(err.message || "Failed to track order."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1 max-w-lg">
        <div className="animate-fade-in-up">
          <div className="text-center mb-6">
            <div
              className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center shadow-md"
              style={{ background: "linear-gradient(135deg, #BE2635, #9a1e2b)" }}
            >
              <MapPin className="h-6 w-6" style={{ color: "white" }} />
            </div>
            <h1 className="text-xl font-bold" style={{ color: "#1a1a1a" }}>Track Your Order</h1>
            <p className="text-sm mt-1" style={{ color: "#666" }}>Enter your order details to check status</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
            <form onSubmit={handleTrack} className="space-y-4">
              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-sm animate-fade-in"
                  style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" }}
                >
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="orderNumber" className="text-xs font-semibold" style={{ color: "#333" }}>Order Number *</Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder="ORD-1234567890-123"
                  required
                  className="h-11 rounded-xl text-sm"
                  style={{ color: "#1a1a1a" }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold" style={{ color: "#333" }}>Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="h-11 rounded-xl text-sm"
                  style={{ color: "#1a1a1a" }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold" style={{ color: "#333" }}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-11 rounded-xl text-sm"
                  style={{ color: "#1a1a1a" }}
                />
              </div>
              <p className="text-xs" style={{ color: "#999" }}>* Please provide either phone number or email</p>
              <Button
                type="submit"
                className="w-full h-11 font-semibold rounded-xl shadow-md active:scale-[0.98] transition-all"
                style={{ backgroundColor: "#BE2635", color: "white" }}
                disabled={loading}
              >
                {loading ? "Searching..." : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Track Order
                  </>
                )}
              </Button>
            </form>

            {order && (
              <div className="mt-6 animate-fade-in-up">
                <div className="border-t pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: "#1a1a1a" }}>
                      Order Found
                    </h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="rounded-xl p-4 space-y-2 text-sm mb-4" style={{ backgroundColor: "#f5f5f0" }}>
                    <div className="flex justify-between">
                      <span style={{ color: "#666" }}>Order #</span>
                      <span className="font-semibold" style={{ color: "#1a1a1a" }}>{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#666" }}>Date</span>
                      <span className="font-medium" style={{ color: "#1a1a1a" }}>
                        {order.createdAt.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#666" }}>Total</span>
                      <span className="font-bold" style={{ color: "#BE2635" }}>
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: "#888" }}>Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm bg-white rounded-lg p-2.5 border border-gray-200"
                        >
                          <span style={{ color: "#333" }}>
                            {item.productName} <span style={{ color: "#999" }}>×{item.quantity}</span>
                          </span>
                          <span className="font-medium" style={{ color: "#1a1a1a" }}>
                            {formatPrice(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push(`/orders/${order.orderNumber}`)}
                    className="w-full rounded-xl h-10"
                    style={{ backgroundColor: "#BE2635", color: "white" }}
                  >
                    View Full Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
