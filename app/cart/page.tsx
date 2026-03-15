"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShoppingCart } from "lucide-react";
import { useStoreAuth } from "@/contexts/StoreAuthContext";
import { OrderService } from "@/lib/services/orderService";
import { LoyaltyService } from "@/lib/services/loyaltyService";
import { Order, OrderItem } from "@/lib/types";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { EmptyState } from "@/components/store/EmptyState";
import { QuantitySelector } from "@/components/store/QuantitySelector";
import { OrderSuccessDialog } from "@/components/store/OrderSuccessDialog";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils/order";

export default function CartPage() {
  const router = useRouter();
  const { customer } = useStoreAuth();
  const { cart, updateQuantity, removeItem, clearCart } = useCart();

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

  useEffect(() => {
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

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const calculateTotal = () => Math.max(0, calculateSubtotal() - discount);

  const handlePointsChange = (points: number) => {
    if (!loyaltyRules || !customer) return;
    const subtotal = calculateSubtotal();
    const maxPoints = LoyaltyService.calculateMaxRedeemablePoints(
      loyaltyPoints,
      subtotal,
      loyaltyRules.redeemRate,
      loyaltyRules.minPointsToRedeem
    );
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
      const orderItems: OrderItem[] = cart.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku || "",
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.price * item.quantity,
        imageUrl: item.imageUrl,
      }));
      const orderData: any = {
        customerInfo: { name: formData.name, phone: formData.phone, address: formData.address },
        items: orderItems,
        subtotal,
        discount,
        total,
        paymentMethod: "COD",
        status: "PENDING",
      };
      if (formData.notes?.trim()) orderData.notes = formData.notes.trim();
      if (customer?.id) orderData.customerId = customer.id;
      if (formData.email) orderData.customerInfo.email = formData.email;
      if (pointsToRedeem > 0) orderData.loyaltyPointsUsed = pointsToRedeem;

      const { orderId, orderNumber: newOrderNumber } = await OrderService.createOrder(orderData);
      const createdOrder = await OrderService.getOrder(orderId);
      if (createdOrder) {
        setOrder(createdOrder);
        setOrderNumber(newOrderNumber);
        setOrderPlaced(true);
        localStorage.setItem("lastOrderNumber", newOrderNumber);
        localStorage.setItem("lastOrderPhone", formData.phone);
        clearCart();
      }
    } catch (error: any) {
      alert(error.message || "Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse our products and add items to your cart"
          actionLabel="Continue Shopping"
          actionHref="/"
          actionIcon={ArrowRight}
        />
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
          <span className="text-sm font-normal ml-2" style={{ color: "#888" }}>
            ({cart.length} items)
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item, idx) => (
              <div
                key={item.productId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex gap-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <ShoppingCart className="h-6 w-6" style={{ color: "#ccc" }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="font-semibold text-sm sm:text-base line-clamp-2"
                        style={{ color: "#1a1a1a" }}
                      >
                        {item.productName}
                      </h3>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-all shrink-0"
                        style={{ color: "#ccc" }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs line-through" style={{ color: "#aaa" }}>
                          {formatPrice(item.originalPrice)}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: "#BE2635" }}>
                          -{((1 - item.price / item.originalPrice) * 100).toFixed(0)}% OFF
                        </span>
                      </div>
                    )}
                    <p className="text-sm mt-0.5" style={{ color: "#666" }}>
                      {formatPrice(item.price)} each
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-1.5 hover:bg-gray-100"
                          style={{ color: "#333" }}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span
                          className="w-8 text-center text-sm font-semibold"
                          style={{ color: "#1a1a1a" }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2.5 py-1.5 hover:bg-gray-100"
                          style={{ color: "#333" }}
                          disabled={item.totalStock ? item.quantity >= item.totalStock : false}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="font-bold" style={{ color: "#366346" }}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
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
                <h2 className="font-bold text-lg" style={{ color: "white" }}>
                  Checkout
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Fill in your details to place order
                </p>
              </div>
              <form onSubmit={handleCheckout} className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold" style={{ color: "#333" }}>
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-10 rounded-lg text-sm"
                    style={{ color: "#1a1a1a" }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold" style={{ color: "#333" }}>
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="h-10 rounded-lg text-sm"
                    style={{ color: "#1a1a1a" }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold" style={{ color: "#333" }}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-10 rounded-lg text-sm"
                    style={{ color: "#1a1a1a" }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold" style={{ color: "#333" }}>
                    Delivery Address *
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="h-10 rounded-lg text-sm"
                    style={{ color: "#1a1a1a" }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-semibold" style={{ color: "#333" }}>
                    Notes (Optional)
                  </Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special instructions..."
                    className="flex min-h-[60px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ color: "#1a1a1a" }}
                    rows={2}
                  />
                </div>

                {customer && loyaltyRules && loyaltyPoints >= loyaltyRules.minPointsToRedeem && (
                  <div className="space-y-2 border-t pt-4">
                    <Label
                      htmlFor="loyalty-points"
                      className="text-xs font-semibold"
                      style={{ color: "#333" }}
                    >
                      Use Loyalty Points
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="loyalty-points"
                        type="number"
                        min={0}
                        max={loyaltyPoints}
                        value={pointsToRedeem}
                        onChange={(e) => handlePointsChange(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-10 rounded-lg text-sm"
                        style={{ color: "#1a1a1a" }}
                      />
                      <span className="text-xs whitespace-nowrap" style={{ color: "#666" }}>
                        {loyaltyPoints} pts
                      </span>
                    </div>
                    {pointsToRedeem > 0 && (
                      <p className="text-sm font-medium" style={{ color: "#366346" }}>
                        Discount: {formatPrice(discount)}
                      </p>
                    )}
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#666" }}>Subtotal</span>
                    <span className="font-medium" style={{ color: "#1a1a1a" }}>
                      {formatPrice(calculateSubtotal())}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm" style={{ color: "#366346" }}>
                      <span>Discount</span>
                      <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span style={{ color: "#1a1a1a" }}>Total</span>
                    <span style={{ color: "#BE2635" }}>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>

                <p className="text-xs" style={{ color: "#999" }}>
                  💵 Payment: Cash on Delivery (COD)
                </p>

                <Button
                  type="submit"
                  className="w-full h-12 font-semibold rounded-xl shadow-md active:scale-[0.98] transition-all"
                  style={{ backgroundColor: "#BE2635", color: "white" }}
                  size="lg"
                  disabled={placingOrder}
                >
                  {placingOrder
                    ? "Placing Order..."
                    : `Place Order — ${formatPrice(calculateTotal())}`}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <OrderSuccessDialog
        open={orderPlaced}
        onOpenChange={setOrderPlaced}
        order={order}
        orderNumber={orderNumber}
        isLoggedIn={!!customer}
      />
      <Footer />
    </div>
  );
}
