import type { SupabaseClient } from "@supabase/supabase-js";
import type { AttachmentFileType } from "@/types/supabase";

const ATTACHMENT_BUCKET = "maintenance-attachments";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export function getAttachmentFileType(mimeType: string): AttachmentFileType {
  return mimeType === "application/pdf" ? "pdf" : "image";
}

export async function getAttachmentUrl(
  supabase: SupabaseClient,
  filePath: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_TTL_SECONDS);

  if (error) return null;
  return data.signedUrl;
}

export async function uploadMaintenanceAttachment(
  supabase: SupabaseClient,
  userId: string,
  recordId: string,
  file: File
): Promise<string> {
  const extension = file.name.split(".").pop() || "bin";
  const path = `${userId}/${recordId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw error;
  return path;
}

export async function removeMaintenanceAttachments(
  supabase: SupabaseClient,
  userId: string,
  recordId: string
): Promise<void> {
  const prefix = `${userId}/${recordId}`;
  const { data } = await supabase.storage.from(ATTACHMENT_BUCKET).list(prefix);
  if (!data || data.length === 0) return;

  await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .remove(data.map((file) => `${prefix}/${file.name}`));
}
