import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import * as z from "zod";

const client = new Anthropic();

const VehicleDetectionSchema = z.object({
  make: z.string().nullable(),
  model: z.string().nullable(),
  year: z.number().nullable(),
  color: z.string().nullable(),
  licensePlate: z.string().nullable(),
});

export type VehicleDetection = z.infer<typeof VehicleDetectionSchema>;

export async function detectVehicleFromPhoto(
  fileBuffer: Buffer,
  mediaType: string
): Promise<VehicleDetection | null> {
  const data = fileBuffer.toString("base64");

  const response = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    output_config: { format: zodOutputFormat(VehicleDetectionSchema) },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data,
            },
          },
          {
            type: "text",
            text: "Identify this vehicle's make, model, approximate model year, exterior colour, and license plate if legible. Return null for anything you can't determine confidently — don't guess.",
          },
        ],
      },
    ],
  });

  return response.parsed_output;
}
