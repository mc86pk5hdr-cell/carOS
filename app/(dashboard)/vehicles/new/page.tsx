import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createVehicle } from "../actions";

export default function NewVehiclePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add a vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm action={createVehicle} submitLabel="Add vehicle" />
        </CardContent>
      </Card>
    </div>
  );
}
