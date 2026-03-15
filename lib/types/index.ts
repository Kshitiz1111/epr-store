// Core TypeScript types for the Store application
import { Timestamp } from "firebase/firestore";

// Product & Inventory Types
export type ProductWarehouse = {
  quantity: number;
  position: string; // e.g., "Row A - Shelf 2"
  minQuantity: number; // Low stock threshold
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  costPrice?: number;
  discount?: number;
  imageUrl?: string;
  warehouses: {
    [warehouseId: string]: ProductWarehouse;
  };
  trackTrace: {
    qrCodeUrl: string;
    history: Array<{
      action: string;
      from?: string;
      to?: string;
      performedBy: string;
      timestamp: Timestamp;
    }>;
  };
  attributes?: Record<string, string>;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// Customer Types
export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  totalSpent: number;
  totalDue?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// Payment Types
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "FONE_PAY" | "CREDIT" | "CHEQUE";

// Order Types
export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "CANCELLED" | "COMPLETED";

export type OrderItem = {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "COD" | "BANK_TRANSFER" | "FONE_PAY";
  status: OrderStatus;
  loyaltyPointsUsed?: number;
  loyaltyPointsEarned?: number;
  notes?: string;
  source?: "POS" | "ONLINE";
  performedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  confirmedAt?: Timestamp;
  shippedAt?: Timestamp;
  cancelledAt?: Timestamp;
};

// Loyalty Types
export type LoyaltyRules = {
  earnRate: number;
  redeemRate: number;
  minPointsToRedeem: number;
  updatedAt: Timestamp;
};

// Ledger Types (used internally by OrderService)
export type LedgerEntryType = "INCOME" | "EXPENSE" | "ASSET" | "LIABILITY";
export type LedgerCategory =
  | "SALES"
  | "PURCHASE"
  | "SALARY"
  | "RENT"
  | "UTILITY"
  | "VENDOR_PAY"
  | "ADVANCE"
  | "COMMISSION"
  | "SALES_RETURN"
  | "PURCHASE_RETURN"
  | "OTHER";

export type LedgerEntry = {
  id: string;
  date: Timestamp;
  type: LedgerEntryType;
  category: LedgerCategory;
  amount: number;
  description: string;
  relatedId?: string;
  paymentMethod: PaymentMethod;
  performedBy: string;
  createdAt: Timestamp;
};
