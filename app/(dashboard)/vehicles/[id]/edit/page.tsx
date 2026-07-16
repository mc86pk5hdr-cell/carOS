import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVehiclePhotoUrl } from "@/lib/vehicles";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateVehicle } from "../../actions";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: vehicle } = await supabase.from("vehicles").select("*").eq("id", id).single();

  if (!vehicle) notFound();

  const photoUrl = await getVehiclePhotoUrl(supabase, vehicle.photo_path);
  const action = updateVehicle.bind(null, vehicle.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm
            action={action}
            vehicle={vehicle}
            photoUrl={photoUrl}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
