import Image from "next/image";
import Link from "next/link";
import { Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { VehicleActionsMenu } from "@/components/vehicles/vehicle-actions-menu";
import { ReminderBadge } from "@/components/reminders/reminder-badge";
import { FUEL_TYPE_OPTIONS } from "@/lib/constants";
import type { ReminderItem, Vehicle } from "@/types/supabase";

const MAX_VISIBLE_REMINDERS = 3;

export function VehicleCard({
  vehicle,
  photoUrl,
  reminders = [],
}: {
  vehicle: Vehicle;
  photoUrl: string | null;
  reminders?: ReminderItem[];
}) {
  const fuelLabel = FUEL_TYPE_OPTIONS.find((f) => f.value === vehicle.fuel_type)?.label;
  const visibleReminders = reminders.slice(0, MAX_VISIBLE_REMINDERS);
  const remainingCount = reminders.length - visibleReminders.length;

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
              alt={vehicle.nickname ?? vehicle.model}
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
              {vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
            </h3>
            <p className="truncate text-sm text-muted-foreground">
              {vehicle.year ? `${vehicle.year} ` : ""}
              {vehicle.make} {vehicle.model} &middot; {vehicle.reg_number}
            </p>
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
          </div>
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
