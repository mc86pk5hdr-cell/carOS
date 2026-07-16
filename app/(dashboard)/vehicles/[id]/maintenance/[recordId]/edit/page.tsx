import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateMaintenanceRecord } from "@/app/(dashboard)/vehicles/maintenance-actions";

export default async function EditMaintenanceRecordPage({
  params,
}: {
  params: Promise<{ id: string; recordId: string }>;
}) {
  const { id: vehicleId, recordId } = await params;
  const supabase = await createClient();

  const { data: record } = await supabase
    .from("maintenance_records")
    .select("*")
    .eq("id", recordId)
    .single();

  if (!record) notFound();

  const action = updateMaintenanceRecord.bind(null, record.id, vehicleId);

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit maintenance record</CardTitle>
        </CardHeader>
        <CardContent>
          <MaintenanceForm action={action} record={record} submitLabel="Save changes" />
        </CardContent>
      </Card>
    </div>
  );
}
