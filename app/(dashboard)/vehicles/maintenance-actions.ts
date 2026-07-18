"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  uploadMaintenanceAttachment,
  removeMaintenanceAttachments,
  getAttachmentFileType,
} from "@/lib/maintenance";
import { MaintenanceSchema } from "@/lib/validations/maintenance";
import type { FormState } from "@/lib/validations/auth";

// Mileage inputs display thousands separators (e.g. "12,345") — strip them before validation.
function stripCommas(value: FormDataEntryValue | null): string | undefined {
  const cleaned = String(value ?? "").replace(/,/g, "").trim();
  return cleaned || undefined;
}

function parseMaintenanceForm(formData: FormData) {
  return MaintenanceSchema.safeParse({
    date: formData.get("date"),
    workshopName: formData.get("workshopName") || undefined,
    invoiceNumber: formData.get("invoiceNumber") || undefined,
    mileage: stripCommas(formData.get("mileage")),
    cost: formData.get("cost") || undefined,
    currency: formData.get("currency") || "BND",
    category: formData.get("category"),
    notes: formData.get("notes") || undefined,
    partsReplaced: formData.get("partsReplaced") || undefined,
    labourCost: formData.get("labourCost") || undefined,
    nextRecommendedServiceMileage: stripCommas(formData.get("nextRecommendedServiceMileage")),
    recommendation: formData.get("recommendation") || undefined,
    attendedBy: formData.get("attendedBy") || undefined,
    mechanicName: formData.get("mechanicName") || undefined,
  });
}

async function saveAttachments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  recordId: string,
  formData: FormData
) {
  const files = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);

  for (const file of files) {
    try {
      const path = await uploadMaintenanceAttachment(supabase, userId, recordId, file);
      await supabase.from("maintenance_attachments").insert({
        maintenance_record_id: recordId,
        user_id: userId,
        file_path: path,
        file_type: getAttachmentFileType(file.type),
        file_name: file.name,
      });
    } catch {
      // Best-effort — one failed attachment shouldn't block saving the record.
    }
  }
}

export async function createMaintenanceRecord(
  vehicleId: string,
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = parseMaintenanceForm(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const {
    workshopName,
    invoiceNumber,
    notes,
    partsReplaced,
    nextRecommendedServiceMileage,
    labourCost,
    recommendation,
    attendedBy,
    mechanicName,
    ...rest
  } = validated.data;

  const { data: record, error } = await supabase
    .from("maintenance_records")
    .insert({
      vehicle_id: vehicleId,
      user_id: user.id,
      workshop_name: workshopName || null,
      invoice_number: invoiceNumber || null,
      notes: notes || null,
      parts_replaced: partsReplaced || null,
      next_recommended_service_mileage: nextRecommendedServiceMileage ?? null,
      labour_cost: labourCost ?? null,
      recommendation: recommendation || null,
      attended_by: attendedBy || null,
      mechanic_name: mechanicName || null,
      ...rest,
    })
    .select("id")
    .single();

  if (error) {
    return { message: "Something went wrong saving the record. Please try again." };
  }

  await saveAttachments(supabase, user.id, record.id, formData);

  revalidatePath(`/vehicles/${vehicleId}`);
  redirect(`/vehicles/${vehicleId}/maintenance/${record.id}`);
}

export async function updateMaintenanceRecord(
  recordId: string,
  vehicleId: string,
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = parseMaintenanceForm(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const {
    workshopName,
    invoiceNumber,
    notes,
    partsReplaced,
    nextRecommendedServiceMileage,
    labourCost,
    recommendation,
    attendedBy,
    mechanicName,
    ...rest
  } = validated.data;

  const { error } = await supabase
    .from("maintenance_records")
    .update({
      workshop_name: workshopName || null,
      invoice_number: invoiceNumber || null,
      notes: notes || null,
      parts_replaced: partsReplaced || null,
      next_recommended_service_mileage: nextRecommendedServiceMileage ?? null,
      labour_cost: labourCost ?? null,
      recommendation: recommendation || null,
      attended_by: attendedBy || null,
      mechanic_name: mechanicName || null,
      ...rest,
    })
    .eq("id", recordId)
    .eq("user_id", user.id);

  if (error) {
    return { message: "Something went wrong saving the record. Please try again." };
  }

  await saveAttachments(supabase, user.id, recordId, formData);

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath(`/vehicles/${vehicleId}/maintenance/${recordId}`);
  redirect(`/vehicles/${vehicleId}/maintenance/${recordId}`);
}

export async function deleteMaintenanceRecord(recordId: string, vehicleId: string) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  try {
    await removeMaintenanceAttachments(supabase, user.id, recordId);
  } catch {
    // Best-effort cleanup — don't block the delete on storage errors.
  }

  await supabase.from("maintenance_records").delete().eq("id", recordId).eq("user_id", user.id);

  revalidatePath(`/vehicles/${vehicleId}`);
  redirect(`/vehicles/${vehicleId}`);
}
