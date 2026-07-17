import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Car, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getVehiclePhotoUrl } from "@/lib/vehicles";
import { sortByUrgency } from "@/lib/reminders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleActionsMenu } from "@/components/vehicles/vehicle-actions-menu";
import { ReminderRow } from "@/components/reminders/reminder-row";
import { ReminderFormDialog } from "@/components/reminders/reminder-form-dialog";
import { MaintenanceRow } from "@/components/maintenance/maintenance-row";
import { FUEL_TYPE_OPTIONS, TRANSMISSION_OPTIONS } from "@/lib/constants";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: vehicle } = await supabase.from("vehicles").select("*").eq("id", id).single();

  if (!vehicle) notFound();

  const [photoUrl, { data: reminders }, { data: maintenanceRecords }] = await Promise.all([
    getVehiclePhotoUrl(supabase, vehicle.photo_path),
    supabase.from("reminder_items").select("*").eq("vehicle_id", vehicle.id),
    supabase
      .from("maintenance_records")
      .select("*")
      .eq("vehicle_id", vehicle.id)
      .order("date", { ascending: false }),
  ]);
  const sortedReminders = sortByUrgency(reminders ?? []);
  const fuelLabel = FUEL_TYPE_OPTIONS.find((f) => f.value === vehicle.fuel_type)?.label;
  const transmissionLabel = TRANSMISSION_OPTIONS.find((t) => t.value === vehicle.transmission)?.label;

  const details = (
    [
      ["Engine number", vehicle.engine_number],
      ["Chassis number", vehicle.chassis_number],
      ["Colour", vehicle.color],
      [
        "Purchase date",
        vehicle.purchase_date
          ? new Date(vehicle.purchase_date).toLocaleDateString()
          : null,
      ],
    ] satisfies Array<[string, string | null]>
  ).filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
          {photoUrl ? (
            <Image src={photoUrl} alt={vehicle.name ?? vehicle.model} fill className="object-cover" />
          ) : (
            <Car className="size-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-1 items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {vehicle.name || `${vehicle.make} ${vehicle.model}`}
            </h1>
            <p className="text-muted-foreground">{vehicle.license_plate}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {fuelLabel && <Badge variant="secondary">{fuelLabel}</Badge>}
              {transmissionLabel && <Badge variant="secondary">{transmissionLabel}</Badge>}
              {vehicle.mileage != null && (
                <Badge variant="secondary">
                  {vehicle.mileage.toLocaleString()} {vehicle.mileage_unit}
                </Badge>
              )}
            </div>
          </div>
          <VehicleActionsMenu vehicleId={vehicle.id} />
        </div>
      </div>

      {details.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vehicle details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Reminders</CardTitle>
          <ReminderFormDialog
            vehicleId={vehicle.id}
            trigger={
              <Button size="sm" variant="outline">
                <Plus className="size-4" />
                Add reminder
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          {sortedReminders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reminders yet. Add road tax, insurance, service due dates, and more.
            </p>
          ) : (
            <div className="flex flex-col">
              {sortedReminders.map((item) => (
                <ReminderRow key={item.id} vehicleId={vehicle.id} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Maintenance Log</CardTitle>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/vehicles/${vehicle.id}/maintenance/new`}>
              <Plus className="size-4" />
              Add record
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!maintenanceRecords || maintenanceRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No maintenance records yet. Log a service manually, or scan a receipt.
            </p>
          ) : (
            <div className="flex flex-col">
              {maintenanceRecords.map((record) => (
                <MaintenanceRow key={record.id} vehicleId={vehicle.id} record={record} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
