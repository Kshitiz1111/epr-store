// Ledger Service - Internal dependency for OrderService
import {
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export class LedgerService {
  /**
   * Post income from confirmed sale/order
   */
  static async postSaleIncome(
    saleId: string,
    amount: number,
    paymentMethod: "CASH" | "BANK_TRANSFER" | "FONE_PAY" | "CREDIT",
    performedBy: string
  ): Promise<string> {
    try {
      const entry = {
        date: Timestamp.now(),
        type: "INCOME",
        category: "SALES",
        amount,
        description: `Sale income from order ${saleId}`,
        relatedId: saleId,
        paymentMethod,
        performedBy,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "ledger"), entry);
      return docRef.id;
    } catch (error) {
      console.error("Error posting sale income:", error);
      throw error;
    }
  }
}
