"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FUEL_TYPE_OPTIONS, MILEAGE_UNIT_OPTIONS } from "@/lib/constants";
import type { FormState } from "@/lib/validations/auth";
import type { Vehicle } from "@/types/supabase";
import type { VehicleDetection } from "@/lib/ai/vehicle-detection";

type VehicleFormAction = (state: FormState, formData: FormData) => Promise<FormState>;

export function VehicleForm({
  action,
  vehicle,
  photoUrl,
  detection,
  initialPhoto,
  submitLabel,
}: {
  action: VehicleFormAction;
  vehicle?: Vehicle;
  photoUrl?: string | null;
  detection?: VehicleDetection | null;
  initialPhoto?: File | null;
  submitLabel: string;
}) {
  async function boundAction(state: FormState, formData: FormData): Promise<FormState> {
    const existingPhoto = formData.get("photo");
    if ((!existingPhoto || (existingPhoto instanceof File && existingPhoto.size === 0)) && initialPhoto) {
      formData.set("photo", initialPhoto);
    }
    return action(state, formData);
  }

  const [state, formAction, pending] = useActionState(boundAction, undefined);
  const [preview, setPreview] = useState<string | null>(
    photoUrl ?? (initialPhoto ? URL.createObjectURL(initialPhoto) : null)
  );

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
          {preview ? (
            <Image src={preview} alt="" fill unoptimized className="object-cover" />
          ) : (
            <Camera className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="photo">Vehicle photo</Label>
          <Input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="max-w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nickname">Nickname</Label>
          <Input id="nickname" name="nickname" defaultValue={vehicle?.nickname ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="regNumber">Registration number</Label>
          <Input
            id="regNumber"
            name="regNumber"
            defaultValue={vehicle?.reg_number ?? detection?.regNumber ?? ""}
            required
          />
          {state?.errors?.regNumber && (
            <p className="text-sm text-destructive">{state.errors.regNumber[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="make">Make</Label>
          <Input id="make" name="make" defaultValue={vehicle?.make ?? detection?.make ?? ""} required />
          {state?.errors?.make && (
            <p className="text-sm text-destructive">{state.errors.make[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" defaultValue={vehicle?.model ?? detection?.model ?? ""} required />
          {state?.errors?.model && (
            <p className="text-sm text-destructive">{state.errors.model[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            defaultValue={vehicle?.year ?? detection?.year ?? ""}
          />
          {state?.errors?.year && (
            <p className="text-sm text-destructive">{state.errors.year[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="color">Colour</Label>
          <Input id="color" name="color" defaultValue={vehicle?.color ?? detection?.color ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fuelType">Fuel type</Label>
          <Select name="fuelType" defaultValue={vehicle?.fuel_type ?? undefined}>
            <SelectTrigger id="fuelType" className="w-full">
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              {FUEL_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="mileage">Mileage</Label>
            <Input
              id="mileage"
              name="mileage"
              type="number"
              defaultValue={vehicle?.mileage ?? ""}
            />
          </div>
          <div className="flex w-24 flex-col gap-2">
            <Label htmlFor="mileageUnit">Unit</Label>
            <Select name="mileageUnit" defaultValue={vehicle?.mileage_unit ?? "km"}>
              <SelectTrigger id="mileageUnit" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MILEAGE_UNIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="purchaseDate">Purchase date</Label>
          <Input
            id="purchaseDate"
            name="purchaseDate"
            type="date"
            defaultValue={vehicle?.purchase_date ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="vin">VIN</Label>
          <Input id="vin" name="vin" defaultValue={vehicle?.vin ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="engineNumber">Engine number</Label>
          <Input
            id="engineNumber"
            name="engineNumber"
            defaultValue={vehicle?.engine_number ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="chassisNumber">Chassis number</Label>
          <Input
            id="chassisNumber"
            name="chassisNumber"
            defaultValue={vehicle?.chassis_number ?? ""}
          />
        </div>
      </div>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
