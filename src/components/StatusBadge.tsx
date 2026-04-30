import { cn } from "@/lib/utils";
import type { CustomerStatus } from "@/lib/mock-data";

const styles: Record<CustomerStatus, string> = {
  paid: "bg-cardamom/10 text-cardamom border-cardamom/20",
  pending: "bg-turmeric/10 text-turmeric border-turmeric/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

const labels: Record<CustomerStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
};

export function StatusBadge({ status, className }: { status: CustomerStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wider",
        styles[status],
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", {
        "bg-cardamom": status === "paid",
        "bg-turmeric": status === "pending",
        "bg-destructive": status === "overdue",
      })} />
      {labels[status]}
    </span>
  );
}
