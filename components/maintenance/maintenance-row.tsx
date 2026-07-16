import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { REMINDER_ITEM_TYPES } from "@/lib/constants";
import type { MaintenanceRecord } from "@/types/supabase";

export function MaintenanceRow({
  vehicleId,
  record,
}: {
  vehicleId: string;
  record: MaintenanceRecord;
}) {
  const categoryLabel = REMINDER_ITEM_TYPES[record.category].label;

  return (
    <Link
      href={`/vehicles/${vehicleId}/maintenance/${record.id}`}
      className="flex items-center justify-between gap-4 border-b py-3 last:border-0 hover:bg-accent/50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {new Date(record.date).toLocaleDateString()}
          </span>
          <Badge variant="secondary" className="text-xs">
            {categoryLabel}
          </Badge>
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {record.workshop_name || "No workshop noted"}
        </p>
      </div>
      {record.cost != null && (
        <span className="shrink-0 text-sm font-medium">
          {record.currency} {record.cost.toLocaleString()}
        </span>
      )}
    </Link>
  );
}
