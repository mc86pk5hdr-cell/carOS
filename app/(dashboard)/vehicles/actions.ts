"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadVehiclePhoto, removeVehiclePhotos } from "@/lib/vehicles";
import { VehicleSchema } from "@/lib/validations/vehicle";
import type { FormState } from "@/lib/validations/auth";

function parseVehicleForm(formData: FormData) {
  return VehicleSchema.safeParse({
    name: formData.get("name") || undefined,
    make: formData.get("make"),
    model: formData.get("model"),
    year: formData.get("year") || undefined,
    licensePlate: formData.get("licensePlate"),
    engineNumber: formData.get("engineNumber") || undefined,
    chassisNumber: formData.get("chassisNumber") || undefined,
    fuelType: formData.get("fuelType") || undefined,
    transmission: formData.get("transmission") || undefined,
    mileage: formData.get("mileage") || undefined,
    mileageUnit: formData.get("mileageUnit") || "km",
    color: formData.get("color") || undefined,
    purchaseDate: formData.get("purchaseDate") || undefined,
    roadTaxExpiry: formData.get("roadTaxExpiry") || undefined,
    insuranceExpiry: formData.get("insuranceExpiry") || undefined,
  });
}

// Road tax / insurance expiry dates live on the vehicle's reminder_items —
// the same entries the reminders UI manages — so there's one source of truth.
async function syncExpiryReminder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  vehicleId: string,
  itemType: "road_tax" | "insurance",
  dueDate: string | undefined
) {
  const { data: existing } = await supabase
    .from("reminder_items")
    .select("id")
    .eq("vehicle_id", vehicleId)
    .eq("item_type", itemType)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabase.from("reminder_items").update({ due_date: dueDate || null }).eq("id", existing.id);
  } else if (dueDate) {
    await supabase.from("reminder_items").insert({
      vehicle_id: vehicleId,
      user_id: userId,
      item_type: itemType,
      due_date: dueDate,
    });
  }
}

export async function createVehicle(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = parseVehicleForm(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const {
    name,
    licensePlate,
    engineNumber,
    chassisNumber,
    fuelType,
    mileageUnit,
    purchaseDate,
    roadTaxExpiry,
    insuranceExpiry,
    ...rest
  } = validated.data;

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .insert({
      user_id: user.id,
      name: name || null,
      license_plate: licensePlate,
      engine_number: engineNumber || null,
      chassis_number: chassisNumber || null,
      fuel_type: fuelType || null,
      mileage_unit: mileageUnit,
      purchase_date: purchaseDate || null,
      ...rest,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { message: "You already have a vehicle with this license plate." };
    }
    return { message: "Something went wrong creating the vehicle. Please try again." };
  }

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      const path = await uploadVehiclePhoto(supabase, user.id, vehicle.id, photo);
      await supabase.from("vehicles").update({ photo_path: path }).eq("id", vehicle.id);
    } catch {
      // Photo upload failure shouldn't block vehicle creation.
    }
  }

  await syncExpiryReminder(supabase, user.id, vehicle.id, "road_tax", roadTaxExpiry);
  await syncExpiryReminder(supabase, user.id, vehicle.id, "insurance", insuranceExpiry);

  revalidatePath("/dashboard");
  redirect(`/vehicles/${vehicle.id}`);
}

export async function updateVehicle(
  vehicleId: string,
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = parseVehicleForm(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const {
    name,
    licensePlate,
    engineNumber,
    chassisNumber,
    fuelType,
    mileageUnit,
    purchaseDate,
    roadTaxExpiry,
    insuranceExpiry,
    ...rest
  } = validated.data;

  const { error } = await supabase
    .from("vehicles")
    .update({
      name: name || null,
      license_plate: licensePlate,
      engine_number: engineNumber || null,
      chassis_number: chassisNumber || null,
      fuel_type: fuelType || null,
      mileage_unit: mileageUnit,
      purchase_date: purchaseDate || null,
      ...rest,
    })
    .eq("id", vehicleId)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { message: "You already have a vehicle with this license plate." };
    }
    return { message: "Something went wrong saving the vehicle. Please try again." };
  }

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      const path = await uploadVehiclePhoto(supabase, user.id, vehicleId, photo);
      await supabase.from("vehicles").update({ photo_path: path }).eq("id", vehicleId);
    } catch {
      // Photo upload failure shouldn't block the rest of the update.
    }
  }

  await syncExpiryReminder(supabase, user.id, vehicleId, "road_tax", roadTaxExpiry);
  await syncExpiryReminder(supabase, user.id, vehicleId, "insurance", insuranceExpiry);

  revalidatePath("/dashboard");
  revalidatePath(`/vehicles/${vehicleId}`);
  redirect(`/vehicles/${vehicleId}`);
}

export async function archiveVehicle(vehicleId: string) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("vehicles")
    .update({ status: "archived" })
    .eq("id", vehicleId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteVehicle(vehicleId: string) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  try {
    await removeVehiclePhotos(supabase, user.id, vehicleId);
  } catch {
    // Best-effort cleanup — don't block the delete on storage errors.
  }

  await supabase.from("vehicles").delete().eq("id", vehicleId).eq("user_id", user.id);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
