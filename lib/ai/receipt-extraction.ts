import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import * as z from "zod";

const client = new Anthropic();

const ReceiptExtractionSchema = z.object({
  workshopName: z.string().nullable(),
  workshopAddress: z.string().nullable(),
  workshopPhone: z.string().nullable(),
  invoiceNumber: z.string().nullable(),
  date: z.string().nullable(),
  plateNumber: z.string().nullable(),
  odometer: z.number().nullable(),
  totalAmount: z.number().nullable(),
  taxAmount: z.number().nullable(),
  paymentMethod: z.string().nullable(),
  partsReplaced: z.array(z.string()),
  fluidsChanged: z.array(z.string()),
  labourCharge: z.number().nullable(),
  discount: z.number().nullable(),
  warrantyInfo: z.string().nullable(),
  notes: z.string().nullable(),
});

export type ReceiptExtraction = z.infer<typeof ReceiptExtractionSchema>;

export async function extractReceiptData(
  fileBuffer: Buffer,
  mediaType: string
): Promise<ReceiptExtraction | null> {
  const isPdf = mediaType === "application/pdf";
  const data = fileBuffer.toString("base64");

  const response = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    output_config: { format: zodOutputFormat(ReceiptExtractionSchema) },
    messages: [
      {
        role: "user",
        content: [
          isPdf
            ? {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data },
              }
            : {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                  data,
                },
              },
          {
            type: "text",
            text: "Extract all available data from this vehicle workshop receipt or invoice.",
          },
        ],
      },
    ],
  });

  return response.parsed_output;
}
