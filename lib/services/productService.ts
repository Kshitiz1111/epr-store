// Product Service - Operations for the store
import { collection, doc, getDoc, getDocs, query, orderBy, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/types";

export class ProductService {
  /**
   * Get a product by ID
   */
  static async getProduct(productId: string): Promise<Product | null> {
    try {
      const productDoc = await getDoc(doc(db, "products", productId));
      if (productDoc.exists()) {
        return { id: productDoc.id, ...productDoc.data() } as Product;
      }
      return null;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  /**
   * Get all products
   */
  static async getAllProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
      return products;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  /**
   * Get products by warehouse
   */
  static async getProductsByWarehouse(warehouseId: string): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts.filter(
        (product) => product.warehouses[warehouseId] && product.warehouses[warehouseId].quantity > 0
      );
    } catch (error) {
      console.error("Error fetching products by warehouse:", error);
      throw error;
    }
  }

  /**
   * Update product quantity in warehouse
   */
  static async updateWarehouseQuantity(
    productId: string,
    warehouseId: string,
    quantity: number,
    position?: string
  ): Promise<void> {
    try {
      const product = await this.getProduct(productId);
      if (!product) throw new Error("Product not found");

      const warehouseData = product.warehouses[warehouseId] || {
        quantity: 0,
        position: position || "",
        minQuantity: 0,
      };

      await updateDoc(doc(db, "products", productId), {
        [`warehouses.${warehouseId}`]: {
          ...warehouseData,
          quantity,
          position: position || warehouseData.position,
        },
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating warehouse quantity:", error);
      throw error;
    }
  }
}
