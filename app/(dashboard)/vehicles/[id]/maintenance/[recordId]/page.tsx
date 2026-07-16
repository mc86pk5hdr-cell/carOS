import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAttachmentUrl } from "@/lib/maintenance";
import { REMINDER_ITEM_TYPES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceActionsMenu } from "@/components/maintenance/maintenance-actions-menu";
import { AttachmentList } from "@/components/maintenance/attachment-list";

export default async function MaintenanceDetailPage({
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

  const { data: attachmentRows } = await supabase
    .from("maintenance_attachments")
    .select("*")
    .eq("maintenance_record_id", recordId);

  const attachments = await Promise.all(
    (attachmentRows ?? []).map(async (attachment) => ({
      ...attachment,
      url: await getAttachmentUrl(supabase, attachment.file_path),
    }))
  );

  const details: Array<[string, string]> = (
    [
      ["Invoice number", record.invoice_number],
      ["Mileage", record.mileage != null ? record.mileage.toLocaleString() : null],
      ["Labour cost", record.labour_cost != null ? `${record.currency} ${record.labour_cost}` : null],
      ["Parts replaced", record.parts_replaced],
      [
        "Next recommended service",
        record.next_recommended_service_date
          ? new Date(record.next_recommended_service_date).toLocaleDateString()
          : null,
      ],
    ] satisfies Array<[string, string | null]>
  ).filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {new Date(record.date).toLocaleDateString()}
          </h1>
          <p className="text-muted-foreground">{record.workshop_name || "No workshop noted"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{REMINDER_ITEM_TYPES[record.category].label}</Badge>
            {record.cost != null && (
              <Badge variant="secondary">
                {record.currency} {record.cost.toLocaleString()}
              </Badge>
            )}
          </div>
        </div>
        <MaintenanceActionsMenu vehicleId={vehicleId} recordId={record.id} />
      </div>

      {details.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
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

      {record.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm">{record.notes}</p>
          </CardContent>
        </Card>
      )}

      {attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <AttachmentList attachments={attachments} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
