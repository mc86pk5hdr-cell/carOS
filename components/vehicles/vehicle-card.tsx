import Image from "next/image";
import Link from "next/link";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { VehicleActionsMenu } from "@/components/vehicles/vehicle-actions-menu";
import { ReminderBadge } from "@/components/reminders/reminder-badge";
import { FUEL_TYPE_OPTIONS } from "@/lib/constants";
import { formatExpiryCountdown, getReminderStatus, type ReminderStatus } from "@/lib/reminders";
import type { ReminderItem, Vehicle } from "@/types/supabase";

const MAX_VISIBLE_REMINDERS = 3;

const COUNTDOWN_STYLES: Record<ReminderStatus, string> = {
  good: "text-success",
  due_soon: "text-warning",
  overdue: "text-destructive",
  none: "text-muted-foreground",
};

// Tyres: routine inspection advised from 5 years, replacement by ~6.
const TYRE_WARN_MONTHS = 60;
const TYRE_REPLACE_MONTHS = 72;

function monthsSince(dateString: string, now: Date = new Date()): number {
  const from = new Date(dateString);
  let months =
    (now.getFullYear() - from.getFullYear()) * 12 + (now.getMonth() - from.getMonth());
  if (now.getDate() < from.getDate()) months -= 1;
  return Math.max(0, months);
}

function formatAge(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return totalMonths <= 1 ? "1 month old" : `${months} months old`;
  if (months === 0) return `${years} ${years === 1 ? "year" : "years"} old`;
  return `${years}y ${months}m old`;
}

export function VehicleCard({
  vehicle,
  photoUrl,
  reminders = [],
  tyresReplacedOn,
}: {
  vehicle: Vehicle;
  photoUrl: string | null;
  reminders?: ReminderItem[];
  tyresReplacedOn?: string | null;
}) {
  const fuelLabel = FUEL_TYPE_OPTIONS.find((f) => f.value === vehicle.fuel_type)?.label;

  const carAgeYears = vehicle.year ? new Date().getFullYear() - vehicle.year : null;

  const tyreMonths = tyresReplacedOn ? monthsSince(tyresReplacedOn) : null;
  const tyreStatus: ReminderStatus =
    tyreMonths == null
      ? "none"
      : tyreMonths >= TYRE_REPLACE_MONTHS
        ? "overdue"
        : tyreMonths >= TYRE_WARN_MONTHS
          ? "due_soon"
          : "good";

  // Road tax and insurance get a dedicated countdown; keep them out of the generic badges.
  const expiryRows = (
    [
      ["Road tax", reminders.find((r) => r.item_type === "road_tax")],
      ["Insurance", reminders.find((r) => r.item_type === "insurance")],
    ] as Array<[string, ReminderItem | undefined]>
  ).filter((entry): entry is [string, ReminderItem] => Boolean(entry[1]?.due_date));

  const shownIds = new Set(expiryRows.map(([, item]) => item.id));
  const otherReminders = reminders.filter((r) => !shownIds.has(r.id));
  const visibleReminders = otherReminders.slice(0, MAX_VISIBLE_REMINDERS);
  const remainingCount = otherReminders.length - visibleReminders.length;

  return (
    <Card className="group relative overflow-hidden p-0">
      <div className="absolute top-2 right-2 z-10">
        <VehicleActionsMenu vehicleId={vehicle.id} />
      </div>
      <Link href={`/vehicles/${vehicle.id}`} className="block">
        <div className="relative flex h-36 items-center justify-center bg-muted">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={vehicle.name ?? vehicle.model}
              fill
              className="object-cover"
            />
          ) : (
            <Car className="size-10 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div>
            <h3 className="truncate font-semibold leading-tight">
              {vehicle.name || `${vehicle.make} ${vehicle.model}`}
            </h3>
            <p className="truncate text-sm text-muted-foreground">{vehicle.license_plate}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {fuelLabel && (
              <Badge variant="secondary" className="text-xs">
                {fuelLabel}
              </Badge>
            )}
            {vehicle.mileage != null && (
              <Badge variant="secondary" className="text-xs">
                {vehicle.mileage.toLocaleString()} {vehicle.mileage_unit}
              </Badge>
            )}
            {carAgeYears != null && carAgeYears >= 1 && (
              <Badge variant="secondary" className="text-xs">
                {carAgeYears} {carAgeYears === 1 ? "year" : "years"} old
              </Badge>
            )}
          </div>
          {(expiryRows.length > 0 || tyreMonths != null) && (
            <div className="flex flex-col gap-1 border-t pt-2">
              {expiryRows.map(([label, item]) => {
                const { status } = getReminderStatus(item.due_date);
                return (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={cn("font-medium", COUNTDOWN_STYLES[status])}>
                      {formatExpiryCountdown(item.due_date)}
                    </span>
                  </div>
                );
              })}
              {tyreMonths != null && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tyres</span>
                  <span className={cn("font-medium", COUNTDOWN_STYLES[tyreStatus])}>
                    {formatAge(tyreMonths)}
                  </span>
                </div>
              )}
            </div>
          )}
          {visibleReminders.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t pt-2">
              {visibleReminders.map((item) => (
                <ReminderBadge key={item.id} item={item} />
              ))}
              {remainingCount > 0 && (
                <span className="inline-flex items-center px-1 text-xs text-muted-foreground">
                  +{remainingCount} more
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
