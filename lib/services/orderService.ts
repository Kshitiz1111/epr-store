// Order Service - Business logic for online order operations
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductService } from "./productService";
import { Order, OrderStatus } from "@/lib/types";
import { LoyaltyService } from "./loyaltyService";
import { LedgerService } from "./ledgerService";

export class OrderService {
  /**
   * Generate unique order number
   */
  static generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Create a new order
   */
  static async createOrder(
    orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">
  ): Promise<{ orderId: string; orderNumber: string }> {
    try {
      const orderNumber = this.generateOrderNumber();
      const now = Timestamp.now();

      // Calculate loyalty points if customer is signed in
      let loyaltyPointsEarned = 0;
      const loyaltyPointsUsed = orderData.loyaltyPointsUsed || 0;

      if (orderData.customerId) {
        const rules = await LoyaltyService.getLoyaltyRules();
        if (rules) {
          // Calculate points earned
          loyaltyPointsEarned = LoyaltyService.calculateEarnedPoints(
            orderData.total,
            rules.earnRate
          );

          // Update customer loyalty points
          if (loyaltyPointsEarned > 0 || loyaltyPointsUsed > 0) {
            await LoyaltyService.updateCustomerPoints(
              orderData.customerId,
              loyaltyPointsEarned - loyaltyPointsUsed
            );
          }
        }
      }

      // Build order document, excluding undefined fields
      type OrderDocument = {
        orderNumber: string;
        customerInfo: Order["customerInfo"];
        items: Order["items"];
        subtotal: number;
        discount: number;
        total: number;
        paymentMethod: Order["paymentMethod"];
        status: OrderStatus;
        loyaltyPointsEarned: number;
        loyaltyPointsUsed: number;
        source: "POS" | "ONLINE";
        createdAt: Timestamp;
        updatedAt: Timestamp;
        customerId?: string;
        notes?: string;
      };

      const orderDoc: OrderDocument = {
        orderNumber,
        customerInfo: orderData.customerInfo,
        items: orderData.items,
        subtotal: orderData.subtotal,
        discount: orderData.discount,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        status: orderData.status,
        loyaltyPointsEarned,
        loyaltyPointsUsed,
        source: "ONLINE", // Tag as online order
        createdAt: now,
        updatedAt: now,
      };

      // Only include customerId if it's defined (not a guest order)
      if (orderData.customerId) {
        orderDoc.customerId = orderData.customerId;
      }

      // Only include optional fields if they're defined
      if (orderData.notes) {
        orderDoc.notes = orderData.notes;
      }

      const orderRef = await addDoc(collection(db, "orders"), orderDoc);

      // Reduce stock immediately when order is placed
      // This ensures other customers see accurate stock availability
      for (const item of orderData.items) {
        try {
          const product = await ProductService.getProduct(item.productId);
          if (product) {
            const warehouseEntries = Object.entries(product.warehouses);
            let remainingQty = item.quantity;

            for (const [warehouseId, warehouseData] of warehouseEntries) {
              if (remainingQty <= 0) break;
              if (warehouseData.quantity > 0) {
                const deductQty = Math.min(warehouseData.quantity, remainingQty);
                await ProductService.updateWarehouseQuantity(
                  item.productId,
                  warehouseId,
                  warehouseData.quantity - deductQty
                );
                remainingQty -= deductQty;
              }
            }

            if (remainingQty > 0) {
              console.warn(
                `Insufficient stock for product ${item.productName} (${item.productId}). ` +
                `Ordered: ${item.quantity}, Could not deduct: ${remainingQty}`
              );
            }
          }
        } catch (stockError) {
          console.error(`Error reducing stock for product ${item.productId}:`, stockError);
          // Don't fail the order if stock update fails
        }
      }

      return { orderId: orderRef.id, orderNumber };
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  /**
   * Get order by order number
   */
  static async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const q = query(collection(db, "orders"), where("orderNumber", "==", orderNumber));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Order;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const orderDoc = await getDoc(doc(db, "orders", orderId));
      if (!orderDoc.exists()) {
        return null;
      }
      return { id: orderDoc.id, ...orderDoc.data() } as Order;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  /**
   * Get all orders with optional filters
   */
  static async getAllOrders(filters?: {
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
    customerId?: string;
  }): Promise<Order[]> {
    try {
      let q = query(collection(db, "orders"));
      const conditions: QueryConstraint[] = [];

      if (filters?.status) {
        conditions.push(where("status", "==", filters.status));
      }

      if (filters?.customerId) {
        conditions.push(where("customerId", "==", filters.customerId));
      }

      let useOrderBy = false;
      if (conditions.length === 0) {
        try {
          q = query(q, orderBy("createdAt", "desc"));
          useOrderBy = true;
        } catch {
          console.warn("Could not apply orderBy, will sort in memory");
        }
      }

      if (conditions.length > 0) {
        q = query(q, ...conditions);
      }

      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const order = { id: doc.id, ...data } as Order;

        if (filters?.startDate || filters?.endDate) {
          const orderDate = order.createdAt.toDate();
          if (filters?.startDate && orderDate < filters.startDate) {
            return;
          }
          if (filters?.endDate && orderDate > filters.endDate) {
            return;
          }
        }

        orders.push(order);
      });

      if (!useOrderBy) {
        orders.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0;
          const bTime = b.createdAt?.toMillis() || 0;
          return bTime - aTime;
        });
      }

      return orders;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === "failed-precondition" || err.message?.includes("index")) {
        console.warn("Composite index missing, fetching without orderBy");
        try {
          let q = query(collection(db, "orders"));
          
          if (filters?.status) {
            q = query(q, where("status", "==", filters.status));
          }

          if (filters?.customerId) {
            q = query(q, where("customerId", "==", filters.customerId));
          }

          const querySnapshot = await getDocs(q);
          const orders: Order[] = [];

          querySnapshot.forEach((doc) => {
            const order = { id: doc.id, ...doc.data() } as Order;

            if (filters?.startDate || filters?.endDate) {
              const orderDate = order.createdAt.toDate();
              if (filters?.startDate && orderDate < filters.startDate) {
                return;
              }
              if (filters?.endDate && orderDate > filters.endDate) {
                return;
              }
            }

            orders.push(order);
          });

          orders.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0;
            const bTime = b.createdAt?.toMillis() || 0;
            return bTime - aTime;
          });

          return orders;
        } catch (fallbackError) {
          console.error("Error fetching orders (fallback):", fallbackError);
          throw fallbackError;
        }
      }
      console.error("Error fetching orders:", error);
      throw error as Error;
    }
  }

  /**
   * Get orders for a specific customer
   */
  static async getCustomerOrders(customerId: string): Promise<Order[]> {
    return this.getAllOrders({ customerId });
  }
}
