import { NewMaintenanceFlow } from "@/components/maintenance/new-maintenance-flow";

export default async function NewMaintenanceRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-2xl">
      <NewMaintenanceFlow vehicleId={id} />
    </div>
  );
}
