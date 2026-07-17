"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Sparkles } from "lucide-react";
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
import { FUEL_TYPE_OPTIONS, MILEAGE_UNIT_OPTIONS, TRANSMISSION_OPTIONS } from "@/lib/constants";
import { detectVehicle } from "@/app/(dashboard)/vehicles/detect-vehicle-action";
import type { FormState } from "@/lib/validations/auth";
import type { Vehicle } from "@/types/supabase";

type VehicleFormAction = (state: FormState, formData: FormData) => Promise<FormState>;

export function VehicleForm({
  action,
  vehicle,
  photoUrl,
  submitLabel,
}: {
  action: VehicleFormAction;
  vehicle?: Vehicle;
  photoUrl?: string | null;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [preview, setPreview] = useState<string | null>(photoUrl ?? null);
  const [detecting, startDetecting] = useTransition();
  const [detectError, setDetectError] = useState<string | undefined>();

  const nameRef = useRef<HTMLInputElement>(null);
  const licensePlateRef = useRef<HTMLInputElement>(null);
  const makeRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);

  function computeName() {
    if (!nameRef.current) return;
    const parts = [yearRef.current?.value, makeRef.current?.value, modelRef.current?.value].filter(
      Boolean
    );
    nameRef.current.value = parts.join(" ");
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));

    // Only auto-detect when adding a new vehicle — editing shouldn't overwrite fields.
    if (vehicle) return;

    setDetectError(undefined);
    const formData = new FormData();
    formData.append("photo", file);
    startDetecting(async () => {
      const result = await detectVehicle(formData);
      if (!result.success) {
        setDetectError(result.message);
        return;
      }
      const { data } = result;
      if (data.licensePlate && licensePlateRef.current && !licensePlateRef.current.value) {
        licensePlateRef.current.value = data.licensePlate;
      }
      if (data.make && makeRef.current && !makeRef.current.value) {
        makeRef.current.value = data.make;
      }
      if (data.model && modelRef.current && !modelRef.current.value) {
        modelRef.current.value = data.model;
      }
      if (data.year && yearRef.current && !yearRef.current.value) {
        yearRef.current.value = String(data.year);
      }
      if (data.color && colorRef.current && !colorRef.current.value) {
        colorRef.current.value = data.color;
      }
      computeName();
    });
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
          {!vehicle && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3.5" />
              {detecting
                ? "Detecting make, model, and more…"
                : "We'll try to auto-fill the details below from this photo."}
            </p>
          )}
          {detectError && <p className="text-sm text-destructive">{detectError}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            ref={nameRef}
            id="name"
            name="name"
            readOnly
            className="bg-muted text-muted-foreground"
            defaultValue={
              vehicle?.name ??
              [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(" ")
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="licensePlate">License Plate</Label>
          <Input
            ref={licensePlateRef}
            id="licensePlate"
            name="licensePlate"
            defaultValue={vehicle?.license_plate ?? ""}
            required
          />
          {state?.errors?.licensePlate && (
            <p className="text-sm text-destructive">{state.errors.licensePlate[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="make">Make</Label>
          <Input
            ref={makeRef}
            id="make"
            name="make"
            defaultValue={vehicle?.make ?? ""}
            onChange={computeName}
            required
          />
          {state?.errors?.make && (
            <p className="text-sm text-destructive">{state.errors.make[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="model">Model</Label>
          <Input
            ref={modelRef}
            id="model"
            name="model"
            defaultValue={vehicle?.model ?? ""}
            onChange={computeName}
            required
          />
          {state?.errors?.model && (
            <p className="text-sm text-destructive">{state.errors.model[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="year">Year</Label>
          <Input
            ref={yearRef}
            id="year"
            name="year"
            type="number"
            defaultValue={vehicle?.year ?? ""}
            onChange={computeName}
          />
          {state?.errors?.year && (
            <p className="text-sm text-destructive">{state.errors.year[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="color">Colour</Label>
          <Input ref={colorRef} id="color" name="color" defaultValue={vehicle?.color ?? ""} />
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="transmission">Transmission</Label>
          <Select name="transmission" defaultValue={vehicle?.transmission ?? undefined}>
            <SelectTrigger id="transmission" className="w-full">
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent>
              {TRANSMISSION_OPTIONS.map((opt) => (
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
