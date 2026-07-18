import type { ReminderItemType } from "@/types/supabase";

export const FUEL_TYPE_OPTIONS = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
  { value: "other", label: "Other" },
] as const;

export const TRANSMISSION_OPTIONS = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
] as const;

export const MILEAGE_UNIT_OPTIONS = [
  { value: "km", label: "km" },
  { value: "mi", label: "mi" },
] as const;

export const CURRENCY_OPTIONS = [
  "BND",
  "MYR",
  "SGD",
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "JPY",
  "CNY",
  "THB",
  "IDR",
  "PHP",
] as const;

export const DEFAULT_CURRENCY = "BND";

export const REMINDER_ITEM_TYPES: Record<
  ReminderItemType,
  { label: string; defaultIntervalDays?: number }
> = {
  road_tax: { label: "Road Tax", defaultIntervalDays: 365 },
  insurance: { label: "Insurance", defaultIntervalDays: 365 },
  inspection: { label: "Vehicle Inspection", defaultIntervalDays: 365 },
  license: { label: "Driver Licence" },
  battery: { label: "Battery Replacement", defaultIntervalDays: 730 },
  oil: { label: "Engine Oil", defaultIntervalDays: 180 },
  oil_filter: { label: "Oil Filter", defaultIntervalDays: 180 },
  air_filter: { label: "Air Filter", defaultIntervalDays: 365 },
  brake_pads: { label: "Brake Pads" },
  coolant: { label: "Coolant" },
  transmission_oil: { label: "Transmission Oil" },
  timing_belt: { label: "Timing Belt / Chain" },
  spark_plugs: { label: "Spark Plugs" },
  tyres: { label: "Tyres" },
  custom: { label: "Custom" },
};
