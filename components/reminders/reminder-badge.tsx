import { cn } from "@/lib/utils";
import { getReminderStatus, type ReminderStatus } from "@/lib/reminders";
import { REMINDER_ITEM_TYPES } from "@/lib/constants";
import type { ReminderItem } from "@/types/supabase";

const STATUS_STYLES: Record<ReminderStatus, string> = {
  good: "bg-success/15 text-success border-success/20",
  due_soon: "bg-warning/15 text-warning border-warning/20",
  overdue: "bg-destructive/15 text-destructive border-destructive/20",
  none: "bg-muted text-muted-foreground border-transparent",
};

function formatDaysRemaining(status: ReminderStatus, daysRemaining: number | null): string {
  if (daysRemaining == null) return "No date set";
  if (status === "overdue") return `Overdue by ${Math.abs(daysRemaining)}d`;
  if (daysRemaining === 0) return "Due today";
  return `${daysRemaining}d left`;
}

export function ReminderBadge({ item }: { item: ReminderItem }) {
  const { status, daysRemaining } = getReminderStatus(item.due_date);
  const label = item.item_type === "custom" ? item.label || "Custom" : REMINDER_ITEM_TYPES[item.item_type].label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status]
      )}
    >
      {label}
      <span className="opacity-70">&middot;</span>
      {formatDaysRemaining(status, daysRemaining)}
    </span>
  );
}
