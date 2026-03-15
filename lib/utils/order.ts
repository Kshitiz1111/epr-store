/**
 * Returns styling for order status badges.
 */
export function getStatusStyle(status: string): {
  color: string;
  backgroundColor: string;
  borderColor: string;
} {
  switch (status) {
    case "PENDING":
      return { color: "#d97706", backgroundColor: "#fffbeb", borderColor: "#fde68a" };
    case "CONFIRMED":
      return { color: "#15803d", backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" };
    case "SHIPPED":
      return { color: "#1d4ed8", backgroundColor: "#eff6ff", borderColor: "#bfdbfe" };
    case "CANCELLED":
      return { color: "#dc2626", backgroundColor: "#fef2f2", borderColor: "#fecaca" };
    case "COMPLETED":
      return { color: "#366346", backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" };
    default:
      return { color: "#666", backgroundColor: "#f5f5f5", borderColor: "#e5e5e5" };
  }
}

/**
 * Format a number as a Nepali Rupee price string.
 */
export function formatPrice(amount: number): string {
  return `Rs ${amount.toFixed(0)}`;
}
