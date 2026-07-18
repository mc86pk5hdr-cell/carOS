"use client";

import { useActionState, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY, REMINDER_ITEM_TYPES } from "@/lib/constants";
import type { FormState } from "@/lib/validations/auth";
import type { MaintenanceRecord } from "@/types/supabase";
import type { ReceiptExtraction } from "@/lib/ai/receipt-extraction";

type MaintenanceAction = (state: FormState, formData: FormData) => Promise<FormState>;

function todayISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

function buildNotesFromPrefill(prefill: ReceiptExtraction): string | undefined {
  const lines: string[] = [];
  if (prefill.workshopAddress) lines.push(`Address: ${prefill.workshopAddress}`);
  if (prefill.workshopPhone) lines.push(`Phone: ${prefill.workshopPhone}`);
  if (prefill.paymentMethod) lines.push(`Payment method: ${prefill.paymentMethod}`);
  if (prefill.taxAmount != null) lines.push(`Tax: ${prefill.taxAmount}`);
  if (prefill.discount != null) lines.push(`Discount: ${prefill.discount}`);
  if (prefill.warrantyInfo) lines.push(`Warranty: ${prefill.warrantyInfo}`);
  if (prefill.fluidsChanged.length) lines.push(`Fluids changed: ${prefill.fluidsChanged.join(", ")}`);
  if (prefill.notes) lines.push(prefill.notes);
  return lines.length ? lines.join("\n") : undefined;
}

function formatWithCommas(digits: string): string {
  return digits ? Number(digits).toLocaleString("en-US") : "";
}

function toCommaValue(value: number | string): string {
  const digits = String(value).replace(/[^\d]/g, "");
  return formatWithCommas(digits);
}

function splitParts(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function MaintenanceForm({
  action,
  record,
  prefill,
  initialAttachment,
  submitLabel,
}: {
  action: MaintenanceAction;
  record?: MaintenanceRecord;
  prefill?: ReceiptExtraction | null;
  initialAttachment?: File | null;
  submitLabel: string;
}) {
  async function boundAction(state: FormState, formData: FormData): Promise<FormState> {
    if (initialAttachment) {
      formData.append("attachments", initialAttachment);
    }
    return action(state, formData);
  }

  const [state, formAction, pending] = useActionState(boundAction, undefined);

  const defaults = useMemo(() => {
    if (record) {
      return {
        date: record.date,
        workshopName: record.workshop_name ?? "",
        invoiceNumber: record.invoice_number ?? "",
        mileage: record.mileage ?? "",
        cost: record.cost ?? "",
        currency: record.currency,
        category: record.category as string,
        notes: record.notes ?? "",
        partsReplaced: record.parts_replaced ?? "",
        labourCost: record.labour_cost ?? "",
        nextRecommendedServiceMileage: record.next_recommended_service_mileage ?? "",
        recommendation: record.recommendation ?? "",
        attendedBy: record.attended_by ?? "",
        mechanicName: record.mechanic_name ?? "",
      };
    }
    if (prefill) {
      return {
        date: normalizeDate(prefill.date) ?? todayISODate(),
        workshopName: prefill.workshopName ?? "",
        invoiceNumber: prefill.invoiceNumber ?? "",
        mileage: prefill.odometer ?? "",
        cost: prefill.totalAmount ?? "",
        currency: DEFAULT_CURRENCY,
        category: "custom",
        notes: buildNotesFromPrefill(prefill) ?? "",
        partsReplaced: prefill.partsReplaced.join(", "),
        labourCost: prefill.labourCharge ?? "",
        nextRecommendedServiceMileage: "",
        recommendation: "",
        attendedBy: "",
        mechanicName: "",
      };
    }
    return {
      date: todayISODate(),
      workshopName: "",
      invoiceNumber: "",
      mileage: "",
      cost: "",
      currency: DEFAULT_CURRENCY,
      category: "custom",
      notes: "",
      partsReplaced: "",
      labourCost: "",
      nextRecommendedServiceMileage: "",
      recommendation: "",
      attendedBy: "",
      mechanicName: "",
    };
  }, [record, prefill]);

  const [mileage, setMileage] = useState(() => toCommaValue(defaults.mileage));
  const [nextServiceMileage, setNextServiceMileage] = useState(() =>
    toCommaValue(defaults.nextRecommendedServiceMileage)
  );
  const [parts, setParts] = useState<string[]>(() => splitParts(defaults.partsReplaced));
  const [partInput, setPartInput] = useState("");

  function handleMileageChange(setter: (value: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(formatWithCommas(e.target.value.replace(/[^\d]/g, "")));
    };
  }

  function addPart() {
    const value = partInput.trim().replace(/,/g, "");
    if (value && !parts.includes(value)) {
      setParts((prev) => [...prev, value]);
    }
    setPartInput("");
  }

  function removePart(part: string) {
    setParts((prev) => prev.filter((p) => p !== part));
  }

  function handlePartKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addPart();
    } else if (e.key === "Backspace" && !partInput && parts.length) {
      setParts((prev) => prev.slice(0, -1));
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" defaultValue={defaults.date} required />
          {state?.errors?.date && <p className="text-sm text-destructive">{state.errors.date[0]}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" defaultValue={defaults.category}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(REMINDER_ITEM_TYPES).map(([value, meta]) => (
                <SelectItem key={value} value={value}>
                  {meta.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="workshopName">Workshop</Label>
          <Input id="workshopName" name="workshopName" defaultValue={defaults.workshopName} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="invoiceNumber">Invoice number</Label>
          <Input id="invoiceNumber" name="invoiceNumber" defaultValue={defaults.invoiceNumber} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="mileage">Mileage</Label>
          <Input
            id="mileage"
            name="mileage"
            inputMode="numeric"
            value={mileage}
            onChange={handleMileageChange(setMileage)}
          />
          {state?.errors?.mileage && (
            <p className="text-sm text-destructive">{state.errors.mileage[0]}</p>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="cost">Total cost</Label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                className="pl-7"
                defaultValue={defaults.cost}
              />
            </div>
          </div>
          <div className="flex w-28 flex-col gap-2">
            <Label htmlFor="currency">Currency</Label>
            <Select name="currency" defaultValue={defaults.currency}>
              <SelectTrigger id="currency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="labourCost">Labour cost</Label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="labourCost"
              name="labourCost"
              type="number"
              step="0.01"
              min="0"
              className="pl-7"
              defaultValue={defaults.labourCost}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="nextRecommendedServiceMileage">Next recommended service (Mileage)</Label>
          <Input
            id="nextRecommendedServiceMileage"
            name="nextRecommendedServiceMileage"
            inputMode="numeric"
            value={nextServiceMileage}
            onChange={handleMileageChange(setNextServiceMileage)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="attendedBy">Attended by</Label>
          <Input id="attendedBy" name="attendedBy" defaultValue={defaults.attendedBy} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="mechanicName">Mechanic&apos;s name</Label>
          <Input id="mechanicName" name="mechanicName" defaultValue={defaults.mechanicName} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="partInput">Parts replaced</Label>
        <input type="hidden" name="partsReplaced" value={parts.join(", ")} />
        {parts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {parts.map((part) => (
              <Badge key={part} variant="secondary" className="gap-1 pr-1">
                {part}
                <button
                  type="button"
                  aria-label={`Remove ${part}`}
                  onClick={() => removePart(part)}
                  className="rounded-sm p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <Input
          id="partInput"
          value={partInput}
          onChange={(e) => setPartInput(e.target.value)}
          onKeyDown={handlePartKeyDown}
          onBlur={addPart}
          placeholder="Type a part and press Enter"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="recommendation">Recommendation</Label>
        <Textarea
          id="recommendation"
          name="recommendation"
          rows={3}
          defaultValue={defaults.recommendation}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={4} defaultValue={defaults.notes} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="attachments">
          {initialAttachment ? "Additional photos or PDFs" : "Photos or PDF receipts"}
        </Label>
        <Input id="attachments" name="attachments" type="file" accept="image/*,.pdf" multiple />
        {initialAttachment && (
          <p className="text-sm text-muted-foreground">
            The scanned receipt ({initialAttachment.name}) will also be attached.
          </p>
        )}
      </div>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
