import type { SupabaseClient } from "@supabase/supabase-js";

const PHOTO_BUCKET = "vehicle-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function getVehiclePhotoUrl(
  supabase: SupabaseClient,
  photoPath: string | null
): Promise<string | null> {
  if (!photoPath) return null;

  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(photoPath, SIGNED_URL_TTL_SECONDS);

  if (error) return null;
  return data.signedUrl;
}

export async function uploadVehiclePhoto(
  supabase: SupabaseClient,
  userId: string,
  vehicleId: string,
  file: File
): Promise<string> {
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${vehicleId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw error;
  return path;
}

export async function removeVehiclePhotos(
  supabase: SupabaseClient,
  userId: string,
  vehicleId: string
): Promise<void> {
  const prefix = `${userId}/${vehicleId}`;
  const { data } = await supabase.storage.from(PHOTO_BUCKET).list(prefix);
  if (!data || data.length === 0) return;

  await supabase.storage
    .from(PHOTO_BUCKET)
    .remove(data.map((file) => `${prefix}/${file.name}`));
}
