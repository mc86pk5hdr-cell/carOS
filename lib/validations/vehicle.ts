import * as z from "zod";

export const VehicleSchema = z.object({
  name: z.string().trim().max(120).optional(),
  make: z.string().trim().min(1, { error: "Make is required." }).max(60),
  model: z.string().trim().min(1, { error: "Model is required." }).max(60),
  year: z.coerce
    .number()
    .int()
    .min(1900, { error: "Enter a valid year." })
    .max(new Date().getFullYear() + 1, { error: "Enter a valid year." })
    .optional(),
  licensePlate: z.string().trim().min(1, { error: "License plate is required." }).max(20),
  engineNumber: z.string().trim().max(30).optional(),
  chassisNumber: z.string().trim().max(30).optional(),
  fuelType: z.enum(["petrol", "diesel", "hybrid", "electric", "other"]).optional(),
  transmission: z.enum(["automatic", "manual"]).optional(),
  mileage: z.coerce.number().int().min(0).optional(),
  mileageUnit: z.enum(["km", "mi"]),
  color: z.string().trim().max(30).optional(),
  purchaseDate: z.string().trim().optional(),
  roadTaxExpiry: z.string().trim().optional(),
  insuranceExpiry: z.string().trim().optional(),
});
