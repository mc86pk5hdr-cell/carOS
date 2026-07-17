"use server";

import { extractReceiptData, type ReceiptExtraction } from "@/lib/ai/receipt-extraction";

export type ScanReceiptResult =
  | { success: true; data: ReceiptExtraction }
  | { success: false; message: string };

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

export async function scanReceipt(formData: FormData): Promise<ScanReceiptResult> {
  const file = formData.get("receipt");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Choose a receipt photo or PDF first." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, message: "Unsupported file type. Use a JPEG, PNG, WebP, GIF, or PDF." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await extractReceiptData(buffer, file.type);

    if (!data) {
      return { success: false, message: "Couldn't read that receipt. Try a clearer photo, or enter it manually." };
    }

    return { success: true, data };
  } catch (error) {
    console.error("scanReceipt failed:", error);
    return { success: false, message: "Something went wrong scanning the receipt. Please try again." };
  }
}
