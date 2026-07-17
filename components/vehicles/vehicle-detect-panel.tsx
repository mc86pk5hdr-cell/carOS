"use client";

import { useState, useTransition } from "react";
import { Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { detectVehicle } from "@/app/(dashboard)/vehicles/detect-vehicle-action";
import type { VehicleDetection } from "@/lib/ai/vehicle-detection";

export function VehicleDetectPanel({
  onDetected,
}: {
  onDetected: (data: VehicleDetection, file: File) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function handleDetect() {
    if (!file) {
      setError("Choose a vehicle photo first.");
      return;
    }
    setError(undefined);
    const formData = new FormData();
    formData.append("photo", file);
    startTransition(async () => {
      const result = await detectVehicle(formData);
      if (result.success) {
        onDetected(result.data, file);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-5" />
          Auto-fill from a photo
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Upload a photo of the vehicle — Claude will try to identify the make, model, year,
          colour, and plate. Review everything before saving.
        </p>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={handleDetect} disabled={pending || !file} className="self-start">
          <Upload className="size-4" />
          {pending ? "Detecting…" : "Detect vehicle"}
        </Button>
      </CardContent>
    </Card>
  );
}
