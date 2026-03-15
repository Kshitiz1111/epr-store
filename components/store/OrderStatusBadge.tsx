import { getStatusStyle } from "@/lib/utils/order";

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const style = getStatusStyle(status);
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        ...style,
        border: `1px solid ${style.borderColor}`,
      }}
    >
      {status}
    </span>
  );
}
