import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionIcon: ActionIcon,
  onAction,
}: EmptyStateProps) {
  const button = actionLabel ? (
    <Button
      className="px-8 h-11 rounded-xl font-semibold"
      style={{ backgroundColor: "#BE2635", color: "white" }}
      onClick={onAction}
    >
      {actionLabel}
      {ActionIcon && <ActionIcon className="ml-2 h-4 w-4" />}
    </Button>
  ) : null;

  return (
    <div className="flex-1 flex items-center justify-center py-16 animate-fade-in-up">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="h-10 w-10" style={{ color: "#ccc" }} />
        </div>
        <h2 className="text-lg font-bold mb-2" style={{ color: "#1a1a1a" }}>
          {title}
        </h2>
        <p className="text-sm mb-6" style={{ color: "#666" }}>
          {description}
        </p>
        {button && actionHref ? <Link href={actionHref}>{button}</Link> : button}
      </div>
    </div>
  );
}
