import * as z from "zod";
import { REMINDER_ITEM_TYPE_VALUES } from "@/lib/validations/reminder";

export const MaintenanceSchema = z.object({
  date: z.string().trim().min(1, { error: "Date is required." }),
  workshopName: z.string().trim().max(120).optional(),
  invoiceNumber: z.string().trim().max(60).optional(),
  mileage: z.coerce.number().int().min(0).optional(),
  cost: z.coerce.number().min(0).optional(),
  currency: z.string().trim().min(1).max(10).default("BND"),
  category: z.enum(REMINDER_ITEM_TYPE_VALUES),
  notes: z.string().trim().max(1000).optional(),
  partsReplaced: z.string().trim().max(500).optional(),
  labourCost: z.coerce.number().min(0).optional(),
  nextRecommendedServiceMileage: z.coerce.number().int().min(0).optional(),
  recommendation: z.string().trim().max(1000).optional(),
  attendedBy: z.string().trim().max(120).optional(),
  mechanicName: z.string().trim().max(120).optional(),
});
