"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStoreAuth } from "@/contexts/StoreAuthContext";
import { Button } from "@/components/ui/button";
import { OrderService } from "@/lib/services/orderService";
import { Order } from "@/lib/types";
import { printReceipt, downloadReceiptHTML } from "@/lib/utils/receiptGenerator";
import Link from "next/link";
import { Download, Printer, Package, ShoppingCart } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { customer } = useStoreAuth();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrder(); }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const foundOrder = await OrderService.getOrderByNumber(orderNumber);
      if (foundOrder) {
        if (customer && foundOrder.customerId !== customer.id) { router.push("/orders"); return; }
        if (!customer && foundOrder.customerId) { router.push("/track"); return; }
      }
      setOrder(foundOrder);
    } catch (error) { console.error("Error fetching order:", error); }
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

  if (loading) {
    return (<div className="min-h-screen bg-white flex flex-col"><Header /><div className="container mx-auto px-4 py-8 flex-1 max-w-3xl"><div className="skeleton h-8 w-60 mb-2" /><div className="skeleton h-4 w-40 mb-6" /><div className="skeleton h-40 w-full rounded-xl mb-4" /><div className="skeleton h-40 w-full rounded-xl mb-4" /><div className="skeleton h-32 w-full rounded-xl" /></div></div>);
  }

  if (!order) {
    return (<div className="min-h-screen bg-white flex flex-col"><Header /><div className="flex-1 flex items-center justify-center px-4"><div className="text-center"><div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"><Package className="h-7 w-7" style={{ color: "#999" }} /></div><h1 className="text-xl font-bold mb-2" style={{ color: "#1a1a1a" }}>Order not found</h1><p className="text-sm mb-4" style={{ color: "#666" }}>This order may not exist or you may not have access.</p><Link href={customer ? "/orders" : "/track"}><Button style={{ backgroundColor: "#BE2635", color: "white" }} className="rounded-xl">Go Back</Button></Link></div></div><Footer /></div>);
  }

  const statusStyle = getStatusStyle(order.status);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 animate-fade-in">
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: "#1a1a1a" }}>Order #{order.orderNumber}</h1>
            <p className="text-sm mt-0.5" style={{ color: "#999" }}>Placed on {order.createdAt.toDate().toLocaleString()}</p>
          </div>
          <span className="self-start px-3 py-1.5 rounded-full text-xs font-semibold" style={{ ...statusStyle, border: `1px solid ${statusStyle.borderColor}` }}>{order.status}</span>
        </div>

        <div className="space-y-4 animate-fade-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h2 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: "#BE2635" }}>Order Info</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span style={{ color: "#666" }}>Order #</span><span className="font-medium" style={{ color: "#1a1a1a" }}>{order.orderNumber}</span></div>
                <div className="flex justify-between"><span style={{ color: "#666" }}>Status</span><span className="font-medium" style={{ color: "#1a1a1a" }}>{order.status}</span></div>
                <div className="flex justify-between"><span style={{ color: "#666" }}>Payment</span><span className="font-medium" style={{ color: "#1a1a1a" }}>{order.paymentMethod}</span></div>
                {order.loyaltyPointsUsed && order.loyaltyPointsUsed > 0 && <div className="flex justify-between"><span style={{ color: "#666" }}>Points Used</span><span className="font-medium" style={{ color: "#1a1a1a" }}>{order.loyaltyPointsUsed}</span></div>}
                {order.loyaltyPointsEarned && order.loyaltyPointsEarned > 0 && <div className="flex justify-between"><span style={{ color: "#666" }}>Points Earned</span><span className="font-medium" style={{ color: "#366346" }}>+{order.loyaltyPointsEarned}</span></div>}
              </div>
              {order.notes && <div className="mt-3 pt-3 border-t border-gray-100"><span className="text-xs font-semibold uppercase" style={{ color: "#888" }}>Notes</span><p className="text-sm mt-1" style={{ color: "#333" }}>{order.notes}</p></div>}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h2 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: "#366346" }}>Customer Info</h2>
              <div className="space-y-2 text-sm">
                <p><span style={{ color: "#666" }}>Name:</span> <span className="font-medium ml-1" style={{ color: "#1a1a1a" }}>{order.customerInfo.name}</span></p>
                <p><span style={{ color: "#666" }}>Phone:</span> <span className="font-medium ml-1" style={{ color: "#1a1a1a" }}>{order.customerInfo.phone}</span></p>
                {order.customerInfo.email && <p><span style={{ color: "#666" }}>Email:</span> <span className="font-medium ml-1" style={{ color: "#1a1a1a" }}>{order.customerInfo.email}</span></p>}
                <p><span style={{ color: "#666" }}>Address:</span> <span className="font-medium ml-1" style={{ color: "#1a1a1a" }}>{order.customerInfo.address}</span></p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100"><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "#1a1a1a" }}>Items ({order.items.length})</h2></div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-4">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="w-14 h-14 object-cover rounded-lg shrink-0" /> : <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center shrink-0"><ShoppingCart className="h-5 w-5" style={{ color: "#ccc" }} /></div>}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate" style={{ color: "#1a1a1a" }}>{item.productName}</h4>
                    <p className="text-xs" style={{ color: "#999" }}>SKU: {item.sku} · Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: "#1a1a1a" }}>Rs {item.subtotal.toFixed(0)}</p>
                    <p className="text-xs" style={{ color: "#999" }}>Rs {item.unitPrice.toFixed(0)} ea</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h2 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: "#1a1a1a" }}>Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span style={{ color: "#666" }}>Subtotal</span><span className="font-medium" style={{ color: "#1a1a1a" }}>Rs {order.subtotal.toFixed(0)}</span></div>
              {order.discount > 0 && <div className="flex justify-between"><span style={{ color: "#366346" }}>Discount</span><span className="font-medium" style={{ color: "#366346" }}>-Rs {order.discount.toFixed(0)}</span></div>}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100"><span style={{ color: "#1a1a1a" }}>Total</span><span style={{ color: "#BE2635" }}>Rs {order.total.toFixed(0)}</span></div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => printReceipt(order)} className="flex-1 rounded-xl h-11"><Printer className="mr-2 h-4 w-4" />Print Receipt</Button>
            <Button variant="outline" onClick={() => downloadReceiptHTML(order)} className="flex-1 rounded-xl h-11"><Download className="mr-2 h-4 w-4" />Download</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
