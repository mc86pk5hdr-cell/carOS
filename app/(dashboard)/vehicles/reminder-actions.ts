"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ReminderSchema } from "@/lib/validations/reminder";

export type ReminderFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
    }
  | undefined;

function parseReminderForm(formData: FormData) {
  return ReminderSchema.safeParse({
    itemType: formData.get("itemType"),
    label: formData.get("label") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    dueMileage: formData.get("dueMileage") || undefined,
    lastServiceDate: formData.get("lastServiceDate") || undefined,
    intervalDays: formData.get("intervalDays") || undefined,
    intervalMileage: formData.get("intervalMileage") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function createReminder(
  vehicleId: string,
  _state: ReminderFormState,
  formData: FormData
): Promise<ReminderFormState> {
  const validated = parseReminderForm(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { itemType, label, dueDate, dueMileage, lastServiceDate, intervalDays, intervalMileage, notes } =
    validated.data;

  const { error } = await supabase.from("reminder_items").insert({
    vehicle_id: vehicleId,
    user_id: user.id,
    item_type: itemType,
    label: label || null,
    due_date: dueDate || null,
    due_mileage: dueMileage ?? null,
    last_service_date: lastServiceDate || null,
    interval_days: intervalDays ?? null,
    interval_mileage: intervalMileage ?? null,
    notes: notes || null,
  });

  if (error) {
    return { message: "Something went wrong adding the reminder. Please try again." };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateReminder(
  reminderId: string,
  vehicleId: string,
  _state: ReminderFormState,
  formData: FormData
): Promise<ReminderFormState> {
  const validated = parseReminderForm(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { itemType, label, dueDate, dueMileage, lastServiceDate, intervalDays, intervalMileage, notes } =
    validated.data;

  const { error } = await supabase
    .from("reminder_items")
    .update({
      item_type: itemType,
      label: label || null,
      due_date: dueDate || null,
      due_mileage: dueMileage ?? null,
      last_service_date: lastServiceDate || null,
      interval_days: intervalDays ?? null,
      interval_mileage: intervalMileage ?? null,
      notes: notes || null,
    })
    .eq("id", reminderId)
    .eq("user_id", user.id);

  if (error) {
    return { message: "Something went wrong saving the reminder. Please try again." };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteReminder(reminderId: string, vehicleId: string) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("reminder_items").delete().eq("id", reminderId).eq("user_id", user.id);

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath("/dashboard");
}
