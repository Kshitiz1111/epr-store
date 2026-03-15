"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStoreAuth } from "@/contexts/StoreAuthContext";
import { Button } from "@/components/ui/button";
import { OrderService } from "@/lib/services/orderService";
import { Order } from "@/lib/types";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { customer, loading: authLoading } = useStoreAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!customer) { router.push("/login"); return; }
      fetchOrders();
    }
  }, [customer, authLoading]);

  const fetchOrders = async () => {
    if (!customer) return;
    try { setOrders(await OrderService.getCustomerOrders(customer.id)); }
    catch (error) { console.error("Error fetching orders:", error); }
    finally { setLoading(false); }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING": return { color: "#d97706", backgroundColor: "#fffbeb", borderColor: "#fde68a" };
      case "CONFIRMED": return { color: "#15803d", backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" };
      case "SHIPPED": return { color: "#1d4ed8", backgroundColor: "#eff6ff", borderColor: "#bfdbfe" };
      case "CANCELLED": return { color: "#dc2626", backgroundColor: "#fef2f2", borderColor: "#fecaca" };
      case "COMPLETED": return { color: "#366346", backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" };
      default: return { color: "#666", backgroundColor: "#f5f5f5", borderColor: "#e5e5e5" };
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="skeleton h-8 w-40 mb-6" />
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 w-full rounded-xl" />)}</div>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1">
        <h1 className="text-xl md:text-2xl font-bold mb-5" style={{ color: "#1a1a1a" }}>My Orders</h1>
        {orders.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-16 animate-fade-in-up">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingBag className="h-10 w-10" style={{ color: "#ccc" }} />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: "#1a1a1a" }}>No orders yet</h2>
              <p className="text-sm mb-6" style={{ color: "#666" }}>Start shopping to see your orders here</p>
              <Link href="/"><Button className="px-8 h-11 rounded-xl font-semibold" style={{ backgroundColor: "#BE2635", color: "white" }}>Start Shopping <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, idx) => {
              const statusStyle = getStatusStyle(order.status);
              return (
                <button key={order.id} onClick={() => router.push(`/orders/${order.orderNumber}`)} className="w-full text-left bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all active:scale-[0.995] animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base" style={{ color: "#1a1a1a" }}>Order #{order.orderNumber}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "#999" }}>{order.createdAt.toDate().toLocaleString()}</p>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ ...statusStyle, border: `1px solid ${statusStyle.borderColor}` }}>{order.status}</span>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 text-sm">
                    <div><span className="text-xs" style={{ color: "#999" }}>Items</span><p className="font-medium" style={{ color: "#333" }}>{order.items.length}</p></div>
                    <div><span className="text-xs" style={{ color: "#999" }}>Total</span><p className="font-bold" style={{ color: "#BE2635" }}>Rs {order.total.toFixed(0)}</p></div>
                    <div className="hidden sm:block"><span className="text-xs" style={{ color: "#999" }}>Payment</span><p className="font-medium" style={{ color: "#333" }}>{order.paymentMethod}</p></div>
                    <div className="ml-auto"><ArrowRight className="h-4 w-4" style={{ color: "#ccc" }} /></div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
