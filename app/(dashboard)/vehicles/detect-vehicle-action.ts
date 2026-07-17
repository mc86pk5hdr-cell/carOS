"use server";

import { detectVehicleFromPhoto, type VehicleDetection } from "@/lib/ai/vehicle-detection";

export type DetectVehicleResult =
  | { success: true; data: VehicleDetection }
  | { success: false; message: string };

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function detectVehicle(formData: FormData): Promise<DetectVehicleResult> {
  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Choose a vehicle photo first." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, message: "Unsupported file type. Use a JPEG, PNG, WebP, or GIF." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await detectVehicleFromPhoto(buffer, file.type);

    if (!data) {
      return { success: false, message: "Couldn't identify that vehicle. Try a clearer photo, or enter the details manually." };
    }

    return { success: true, data };
  } catch (error) {
    console.error("detectVehicle failed:", error);
    return { success: false, message: "Something went wrong detecting the vehicle. Please try again." };
  }
}
