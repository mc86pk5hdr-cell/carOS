import * as z from "zod";

export const REMINDER_ITEM_TYPE_VALUES = [
  "road_tax",
  "insurance",
  "inspection",
  "license",
  "battery",
  "oil",
  "oil_filter",
  "air_filter",
  "brake_pads",
  "coolant",
  "transmission_oil",
  "timing_belt",
  "spark_plugs",
  "tyres",
  "custom",
] as const;

export const ReminderSchema = z
  .object({
    itemType: z.enum(REMINDER_ITEM_TYPE_VALUES),
    label: z.string().trim().max(60).optional(),
    dueDate: z.string().trim().optional(),
    dueMileage: z.coerce.number().int().min(0).optional(),
    lastServiceDate: z.string().trim().optional(),
    intervalDays: z.coerce.number().int().min(1).optional(),
    intervalMileage: z.coerce.number().int().min(1).optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.itemType !== "custom" || !!data.label, {
    error: "Enter a label for a custom reminder.",
    path: ["label"],
  });
