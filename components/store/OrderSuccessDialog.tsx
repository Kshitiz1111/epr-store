"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Printer, Copy, Check } from "lucide-react";
import { Order } from "@/lib/types";
import { printReceipt, downloadReceiptHTML } from "@/lib/utils/receiptGenerator";
import { formatPrice } from "@/lib/utils/order";

interface OrderSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  orderNumber: string;
  isLoggedIn: boolean;
}

export function OrderSuccessDialog({
  open,
  onOpenChange,
  order,
  orderNumber,
  isLoggedIn,
}: OrderSuccessDialogProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <div
            className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#e8f5e9" }}
          >
            <span className="text-3xl">🎉</span>
          </div>
          <DialogTitle className="text-center text-xl" style={{ color: "#1a1a1a" }}>
            Order Placed!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your order <strong style={{ color: "#1a1a1a" }}>{orderNumber}</strong> has
            been placed successfully
          </DialogDescription>
        </DialogHeader>
        {order && (
          <div className="space-y-4 mt-2">
            <div
              className="p-4 rounded-xl text-sm space-y-1.5"
              style={{ backgroundColor: "#f5f5f0" }}
            >
              <div className="flex justify-between items-center">
                <span style={{ color: "#666" }}>Order Number</span>
                <span
                  className="flex items-center gap-1.5 font-semibold"
                  style={{ color: "#1a1a1a" }}
                >
                  {order.orderNumber}
                  <button
                    onClick={copyOrderNumber}
                    className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                    title="Copy order number"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" style={{ color: "#366346" }} />
                    ) : (
                      <Copy className="h-3.5 w-3.5" style={{ color: "#888" }} />
                    )}
                  </button>
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#666" }}>Total</span>
                <span className="font-semibold" style={{ color: "#BE2635" }}>
                  {formatPrice(order.total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#666" }}>Status</span>
                <span className="font-semibold" style={{ color: "#d97706" }}>
                  {order.status}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => order && printReceipt(order)}
                className="flex-1 rounded-xl"
                size="sm"
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print
              </Button>
              <Button
                variant="outline"
                onClick={() => order && downloadReceiptHTML(order)}
                className="flex-1 rounded-xl"
                size="sm"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download
              </Button>
            </div>
            <div className="flex gap-2">
              {isLoggedIn ? (
                <Button
                  onClick={() => router.push(`/orders/${orderNumber}`)}
                  className="flex-1 rounded-xl"
                  style={{ backgroundColor: "#BE2635", color: "white" }}
                >
                  View Order
                </Button>
              ) : (
                <Button
                  onClick={() => router.push(`/track`)}
                  className="flex-1 rounded-xl"
                  style={{ backgroundColor: "#BE2635", color: "white" }}
                >
                  Track Order
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  router.push("/");
                }}
                className="flex-1 rounded-xl"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
