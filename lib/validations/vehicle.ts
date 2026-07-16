import * as z from "zod";

export const VehicleSchema = z.object({
  nickname: z.string().trim().max(60).optional(),
  make: z.string().trim().min(1, { error: "Make is required." }).max(60),
  model: z.string().trim().min(1, { error: "Model is required." }).max(60),
  year: z.coerce
    .number()
    .int()
    .min(1900, { error: "Enter a valid year." })
    .max(new Date().getFullYear() + 1, { error: "Enter a valid year." })
    .optional(),
  regNumber: z.string().trim().min(1, { error: "Registration number is required." }).max(20),
  vin: z.string().trim().max(30).optional(),
  engineNumber: z.string().trim().max(30).optional(),
  chassisNumber: z.string().trim().max(30).optional(),
  fuelType: z.enum(["petrol", "diesel", "hybrid", "electric", "other"]).optional(),
  mileage: z.coerce.number().int().min(0).optional(),
  mileageUnit: z.enum(["km", "mi"]),
  color: z.string().trim().max(30).optional(),
  purchaseDate: z.string().trim().optional(),
});
