"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { Trash2, Download, Printer, Minus, Plus, ShoppingBag, ArrowRight, ShoppingCart, Copy, Check } from "lucide-react";
import { useStoreAuth } from "@/contexts/StoreAuthContext";
import { OrderService } from "@/lib/services/orderService";
import { LoyaltyService } from "@/lib/services/loyaltyService";
import { printReceipt, downloadReceiptHTML } from "@/lib/utils/receiptGenerator";
import { Order, OrderItem } from "@/lib/types";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";

interface CartItem {
  productId: string;
  productName: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  imageUrl?: string;
  totalStock?: number;
}

export default function CartPage() {
  const router = useRouter();
  const { customer } = useStoreAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    address: customer?.address || "",
    notes: "",
  });
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyRules, setLoyaltyRules] = useState<any>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(cartData);
    if (customer) loadLoyaltyData();
  }, [customer]);

  const loadLoyaltyData = async () => {
    if (!customer) return;
    try {
      const points = await LoyaltyService.getCustomerPoints(customer.id);
      setLoyaltyPoints(points);
      const rules = await LoyaltyService.getLoyaltyRules();
      setLoyaltyRules(rules);
    } catch (error) {
      console.error("Error loading loyalty data:", error);
    }
  };

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const newCart = cart.map((item) => {
      if (item.productId === productId) {
        const maxQty = item.totalStock || Infinity;
        return { ...item, quantity: Math.min(maxQty, Math.max(1, quantity)) };
      }
      return item;
    });
    updateCart(newCart);
  };

  const removeItem = (productId: string) => {
    updateCart(cart.filter((item) => item.productId !== productId));
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const calculateTotal = () => Math.max(0, calculateSubtotal() - discount);

  const handlePointsChange = (points: number) => {
    if (!loyaltyRules || !customer) return;
    const subtotal = calculateSubtotal();
    const maxPoints = LoyaltyService.calculateMaxRedeemablePoints(loyaltyPoints, subtotal, loyaltyRules.redeemRate, loyaltyRules.minPointsToRedeem);
    const pointsToUse = Math.min(Math.max(0, points), maxPoints);
    setPointsToRedeem(pointsToUse);
    setDiscount(LoyaltyService.calculateDiscount(pointsToUse, loyaltyRules.redeemRate, subtotal));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacingOrder(true);
    try {
      const subtotal = calculateSubtotal();
      const total = calculateTotal();
      const orderItems: OrderItem[] = cart.map(item => ({
        productId: item.productId, productName: item.productName, sku: item.sku || "",
        quantity: item.quantity, unitPrice: item.price, subtotal: item.price * item.quantity, imageUrl: item.imageUrl,
      }));
      const orderData: any = {
        customerInfo: { name: formData.name, phone: formData.phone, address: formData.address },
        items: orderItems, subtotal, discount, total, paymentMethod: "COD", status: "PENDING",
      };
      if (formData.notes?.trim()) orderData.notes = formData.notes.trim();
      if (customer?.id) orderData.customerId = customer.id;
      if (formData.email) orderData.customerInfo.email = formData.email;
      if (pointsToRedeem > 0) orderData.loyaltyPointsUsed = pointsToRedeem;
      const { orderId, orderNumber: newOrderNumber } = await OrderService.createOrder(orderData);
      const createdOrder = await OrderService.getOrder(orderId);
      if (createdOrder) {
        setOrder(createdOrder); setOrderNumber(newOrderNumber); setOrderPlaced(true);
        localStorage.setItem("lastOrderNumber", newOrderNumber);
        localStorage.setItem("lastOrderPhone", formData.phone);
        updateCart([]);
      }
    } catch (error: any) {
      alert(error.message || "Failed to place order. Please try again.");
    } finally { setPlacingOrder(false); }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center py-12 animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10" style={{ color: "#ccc" }} />
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: "#1a1a1a" }}>Your cart is empty</h1>
            <p className="text-sm mb-6" style={{ color: "#666" }}>Browse our products and add items to your cart</p>
            <Link href="/">
              <Button className="px-8 h-11 rounded-xl font-semibold" style={{ backgroundColor: "#BE2635", color: "white" }}>
                Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1">
        <h1 className="text-xl md:text-2xl font-bold mb-5" style={{ color: "#1a1a1a" }}>
          Shopping Cart
          <span className="text-sm font-normal ml-2" style={{ color: "#888" }}>({cart.length} items)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item, idx) => (
              <div key={item.productId} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex gap-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <ShoppingCart className="h-6 w-6" style={{ color: "#ccc" }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm sm:text-base line-clamp-2" style={{ color: "#1a1a1a" }}>{item.productName}</h3>
                      <button onClick={() => removeItem(item.productId)} className="p-1.5 hover:bg-red-50 rounded-lg transition-all shrink-0" style={{ color: "#ccc" }}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs line-through" style={{ color: "#aaa" }}>Rs {item.originalPrice.toFixed(0)}</span>
                        <span className="text-xs font-semibold" style={{ color: "#BE2635" }}>-{((1 - item.price / item.originalPrice) * 100).toFixed(0)}% OFF</span>
                      </div>
                    )}
                    <p className="text-sm mt-0.5" style={{ color: "#666" }}>Rs {item.price.toFixed(0)} each</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-gray-100" style={{ color: "#333" }}><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-8 text-center text-sm font-semibold" style={{ color: "#1a1a1a" }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-gray-100" style={{ color: "#333" }} disabled={item.totalStock ? item.quantity >= item.totalStock : false}><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <p className="font-bold" style={{ color: "#366346" }}>Rs {(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4" style={{ background: "linear-gradient(135deg, #BE2635, #9a1e2b)" }}>
                <h2 className="font-bold text-lg" style={{ color: "white" }}>Checkout</h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>Fill in your details to place order</p>
              </div>
              <form onSubmit={handleCheckout} className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold" style={{ color: "#333" }}>Full Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="h-10 rounded-lg text-sm" style={{ color: "#1a1a1a" }} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold" style={{ color: "#333" }}>Phone Number *</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="h-10 rounded-lg text-sm" style={{ color: "#1a1a1a" }} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold" style={{ color: "#333" }}>Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-10 rounded-lg text-sm" style={{ color: "#1a1a1a" }} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold" style={{ color: "#333" }}>Delivery Address *</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required className="h-10 rounded-lg text-sm" style={{ color: "#1a1a1a" }} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-semibold" style={{ color: "#333" }}>Notes (Optional)</Label>
                  <textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any special instructions..." className="flex min-h-[60px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" style={{ color: "#1a1a1a" }} rows={2} />
                </div>

                {customer && loyaltyRules && loyaltyPoints >= loyaltyRules.minPointsToRedeem && (
                  <div className="space-y-2 border-t pt-4">
                    <Label htmlFor="loyalty-points" className="text-xs font-semibold" style={{ color: "#333" }}>Use Loyalty Points</Label>
                    <div className="flex items-center gap-2">
                      <Input id="loyalty-points" type="number" min={0} max={loyaltyPoints} value={pointsToRedeem} onChange={(e) => handlePointsChange(parseInt(e.target.value) || 0)} placeholder="0" className="h-10 rounded-lg text-sm" style={{ color: "#1a1a1a" }} />
                      <span className="text-xs whitespace-nowrap" style={{ color: "#666" }}>{loyaltyPoints} pts</span>
                    </div>
                    {pointsToRedeem > 0 && <p className="text-sm font-medium" style={{ color: "#366346" }}>Discount: Rs {discount.toFixed(0)}</p>}
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#666" }}>Subtotal</span>
                    <span className="font-medium" style={{ color: "#1a1a1a" }}>Rs {calculateSubtotal().toFixed(0)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm" style={{ color: "#366346" }}>
                      <span>Discount</span><span className="font-medium">-Rs {discount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span style={{ color: "#1a1a1a" }}>Total</span>
                    <span style={{ color: "#BE2635" }}>Rs {calculateTotal().toFixed(0)}</span>
                  </div>
                </div>

                <p className="text-xs" style={{ color: "#999" }}>💵 Payment: Cash on Delivery (COD)</p>

                <Button type="submit" className="w-full h-12 font-semibold rounded-xl shadow-md active:scale-[0.98] transition-all" style={{ backgroundColor: "#BE2635", color: "white" }} size="lg" disabled={placingOrder}>
                  {placingOrder ? "Placing Order..." : `Place Order — Rs ${calculateTotal().toFixed(0)}`}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={orderPlaced} onOpenChange={setOrderPlaced}>
        <DialogContent className="max-w-md mx-4 rounded-2xl">
          <DialogHeader>
            <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: "#e8f5e9" }}>
              <span className="text-3xl">🎉</span>
            </div>
            <DialogTitle className="text-center text-xl" style={{ color: "#1a1a1a" }}>Order Placed!</DialogTitle>
            <DialogDescription className="text-center">
              Your order <strong style={{ color: "#1a1a1a" }}>{orderNumber}</strong> has been placed successfully
            </DialogDescription>
          </DialogHeader>
          {order && (
            <div className="space-y-4 mt-2">
              <div className="p-4 rounded-xl text-sm space-y-1.5" style={{ backgroundColor: "#f5f5f0" }}>
                <div className="flex justify-between items-center"><span style={{ color: "#666" }}>Order Number</span><span className="flex items-center gap-1.5 font-semibold" style={{ color: "#1a1a1a" }}>{order.orderNumber}<button onClick={copyOrderNumber} className="p-1 rounded-md hover:bg-gray-200 transition-colors" title="Copy order number">{copied ? <Check className="h-3.5 w-3.5" style={{ color: "#366346" }} /> : <Copy className="h-3.5 w-3.5" style={{ color: "#888" }} />}</button></span></div>
                <div className="flex justify-between"><span style={{ color: "#666" }}>Total</span><span className="font-semibold" style={{ color: "#BE2635" }}>Rs {order.total.toFixed(0)}</span></div>
                <div className="flex justify-between"><span style={{ color: "#666" }}>Status</span><span className="font-semibold" style={{ color: "#d97706" }}>{order.status}</span></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => order && printReceipt(order)} className="flex-1 rounded-xl" size="sm"><Printer className="mr-1.5 h-3.5 w-3.5" />Print</Button>
                <Button variant="outline" onClick={() => order && downloadReceiptHTML(order)} className="flex-1 rounded-xl" size="sm"><Download className="mr-1.5 h-3.5 w-3.5" />Download</Button>
              </div>
              <div className="flex gap-2">
                {customer ? (
                  <Button onClick={() => router.push(`/orders/${orderNumber}`)} className="flex-1 rounded-xl" style={{ backgroundColor: "#BE2635", color: "white" }}>View Order</Button>
                ) : (
                  <Button onClick={() => router.push(`/track`)} className="flex-1 rounded-xl" style={{ backgroundColor: "#BE2635", color: "white" }}>Track Order</Button>
                )}
                <Button variant="outline" onClick={() => { setOrderPlaced(false); router.push("/"); }} className="flex-1 rounded-xl">Continue Shopping</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
