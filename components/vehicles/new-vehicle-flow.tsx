"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { VehicleDetectPanel } from "@/components/vehicles/vehicle-detect-panel";
import { createVehicle } from "@/app/(dashboard)/vehicles/actions";
import type { VehicleDetection } from "@/lib/ai/vehicle-detection";

export function NewVehicleFlow() {
  const [detection, setDetection] = useState<VehicleDetection | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <VehicleDetectPanel
        onDetected={(data, file) => {
          setDetection(data);
          setPhotoFile(file);
          setFormKey((key) => key + 1);
        }}
      />
      <Card>
        <CardHeader>
          <CardTitle>Add a vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm
            key={formKey}
            action={createVehicle}
            detection={detection}
            initialPhoto={photoFile}
            submitLabel="Add vehicle"
          />
        </CardContent>
      </Card>
    </div>
  );
}
