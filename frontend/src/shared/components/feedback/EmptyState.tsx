import { FileX } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No records found",
  description = "There are no items to display right now.",
  action,
  className,
  icon,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {icon ?? <FileX className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
