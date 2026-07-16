"use client";

import { useActionState, useMemo } from "react";
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
import { REMINDER_ITEM_TYPES } from "@/lib/constants";
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
        nextRecommendedServiceDate: record.next_recommended_service_date ?? "",
      };
    }
    if (prefill) {
      return {
        date: normalizeDate(prefill.date) ?? todayISODate(),
        workshopName: prefill.workshopName ?? "",
        invoiceNumber: prefill.invoiceNumber ?? "",
        mileage: prefill.odometer ?? "",
        cost: prefill.totalAmount ?? "",
        currency: "MYR",
        category: "custom",
        notes: buildNotesFromPrefill(prefill) ?? "",
        partsReplaced: prefill.partsReplaced.join(", "),
        labourCost: prefill.labourCharge ?? "",
        nextRecommendedServiceDate: "",
      };
    }
    return {
      date: todayISODate(),
      workshopName: "",
      invoiceNumber: "",
      mileage: "",
      cost: "",
      currency: "MYR",
      category: "custom",
      notes: "",
      partsReplaced: "",
      labourCost: "",
      nextRecommendedServiceDate: "",
    };
  }, [record, prefill]);

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
          <Input id="mileage" name="mileage" type="number" defaultValue={defaults.mileage} />
        </div>
        <div className="flex gap-2">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="cost">Total cost</Label>
            <Input id="cost" name="cost" type="number" step="0.01" defaultValue={defaults.cost} />
          </div>
          <div className="flex w-24 flex-col gap-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" name="currency" defaultValue={defaults.currency} maxLength={10} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="labourCost">Labour cost</Label>
          <Input
            id="labourCost"
            name="labourCost"
            type="number"
            step="0.01"
            defaultValue={defaults.labourCost}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="nextRecommendedServiceDate">Next recommended service</Label>
          <Input
            id="nextRecommendedServiceDate"
            name="nextRecommendedServiceDate"
            type="date"
            defaultValue={defaults.nextRecommendedServiceDate}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="partsReplaced">Parts replaced</Label>
        <Input id="partsReplaced" name="partsReplaced" defaultValue={defaults.partsReplaced} />
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
