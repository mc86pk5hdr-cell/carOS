import Link from "next/link";
import { Plus, Car } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getVehiclePhotoUrl } from "@/lib/vehicles";
import { sortByUrgency } from "@/lib/reminders";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import type { ReminderItem } from "@/types/supabase";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const vehicleIds = (vehicles ?? []).map((v) => v.id);
  const [{ data: allReminders }, { data: tyreRecords }] = vehicleIds.length
    ? await Promise.all([
        supabase.from("reminder_items").select("*").in("vehicle_id", vehicleIds),
        supabase
          .from("maintenance_records")
          .select("vehicle_id, date")
          .in("vehicle_id", vehicleIds)
          .eq("category", "tyres")
          .order("date", { ascending: false }),
      ])
    : [{ data: [] as ReminderItem[] }, { data: [] as Array<{ vehicle_id: string; date: string }> }];

  const remindersByVehicle = new Map<string, ReminderItem[]>();
  for (const reminder of allReminders ?? []) {
    const list = remindersByVehicle.get(reminder.vehicle_id) ?? [];
    list.push(reminder);
    remindersByVehicle.set(reminder.vehicle_id, list);
  }

  // Records are sorted newest-first, so the first one per vehicle is the latest tyre change.
  const tyreDateByVehicle = new Map<string, string>();
  for (const record of tyreRecords ?? []) {
    if (!tyreDateByVehicle.has(record.vehicle_id)) {
      tyreDateByVehicle.set(record.vehicle_id, record.date);
    }
  }

  const vehiclesWithExtras = await Promise.all(
    (vehicles ?? []).map(async (vehicle) => ({
      vehicle,
      photoUrl: await getVehiclePhotoUrl(supabase, vehicle.photo_path),
      reminders: sortByUrgency(remindersByVehicle.get(vehicle.id) ?? []),
      tyresReplacedOn: tyreDateByVehicle.get(vehicle.id) ?? null,
    }))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your garage</h1>
          <p className="text-muted-foreground">
            {vehiclesWithExtras.length === 0
              ? "No vehicles yet."
              : `${vehiclesWithExtras.length} vehicle${vehiclesWithExtras.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Button asChild>
          <Link href="/vehicles/new">
            <Plus className="size-4" />
            Add vehicle
          </Link>
        </Button>
      </div>

      {vehiclesWithExtras.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-24 text-center">
          <Car className="size-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Add your first vehicle</p>
            <p className="text-sm text-muted-foreground">
              Track service, renewals, and costs in one place.
            </p>
          </div>
          <Button asChild>
            <Link href="/vehicles/new">
              <Plus className="size-4" />
              Add vehicle
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehiclesWithExtras.map(({ vehicle, photoUrl, reminders, tyresReplacedOn }) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              photoUrl={photoUrl}
              reminders={reminders}
              tyresReplacedOn={tyresReplacedOn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
