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
import { OrderStatusBadge } from "@/components/store/OrderStatusBadge";
import { EmptyState } from "@/components/store/EmptyState";
import { formatPrice } from "@/lib/utils/order";

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="skeleton h-8 w-40 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1">
        <h1 className="text-xl md:text-2xl font-bold mb-5" style={{ color: "#1a1a1a" }}>
          My Orders
        </h1>
        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="Start shopping to see your orders here"
            actionLabel="Start Shopping"
            actionHref="/"
            actionIcon={ArrowRight}
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order, idx) => (
              <button
                key={order.id}
                onClick={() => router.push(`/orders/${order.orderNumber}`)}
                className="w-full text-left bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all active:scale-[0.995] animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base" style={{ color: "#1a1a1a" }}>
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "#999" }}>
                      {order.createdAt.toDate().toLocaleString()}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-4 sm:gap-6 text-sm">
                  <div>
                    <span className="text-xs" style={{ color: "#999" }}>Items</span>
                    <p className="font-medium" style={{ color: "#333" }}>{order.items.length}</p>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: "#999" }}>Total</span>
                    <p className="font-bold" style={{ color: "#BE2635" }}>
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-xs" style={{ color: "#999" }}>Payment</span>
                    <p className="font-medium" style={{ color: "#333" }}>{order.paymentMethod}</p>
                  </div>
                  <div className="ml-auto">
                    <ArrowRight className="h-4 w-4" style={{ color: "#ccc" }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
