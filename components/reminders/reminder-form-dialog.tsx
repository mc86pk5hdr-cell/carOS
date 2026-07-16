"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  createReminder,
  updateReminder,
  type ReminderFormState,
} from "@/app/(dashboard)/vehicles/reminder-actions";
import type { ReminderItem, ReminderItemType } from "@/types/supabase";

type ReminderAction = (
  state: ReminderFormState,
  formData: FormData
) => Promise<ReminderFormState>;

export function ReminderFormDialog({
  vehicleId,
  reminder,
  trigger,
}: {
  vehicleId: string;
  reminder?: ReminderItem;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [itemType, setItemType] = useState<ReminderItemType>(reminder?.item_type ?? "road_tax");
  const [state, setState] = useState<ReminderFormState>(undefined);
  const [pending, startTransition] = useTransition();

  const action: ReminderAction = reminder
    ? updateReminder.bind(null, reminder.id, vehicleId)
    : createReminder.bind(null, vehicleId);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await action(undefined, formData);
      if (result?.success) {
        setState(undefined);
        setOpen(false);
      } else {
        setState(result);
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setState(undefined);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{reminder ? "Edit reminder" : "Add reminder"}</DialogTitle>
          <DialogDescription>
            Track a due date, and optionally the last service and interval to show progress.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="itemType">Type</Label>
            <Select
              name="itemType"
              value={itemType}
              onValueChange={(value) => setItemType(value as ReminderItemType)}
            >
              <SelectTrigger id="itemType" className="w-full">
                <SelectValue />
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

          {itemType === "custom" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" name="label" defaultValue={reminder?.label ?? ""} />
              {state?.errors?.label && (
                <p className="text-sm text-destructive">{state.errors.label[0]}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" name="dueDate" type="date" defaultValue={reminder?.due_date ?? ""} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dueMileage">Due mileage</Label>
              <Input
                id="dueMileage"
                name="dueMileage"
                type="number"
                defaultValue={reminder?.due_mileage ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastServiceDate">Last service date</Label>
              <Input
                id="lastServiceDate"
                name="lastServiceDate"
                type="date"
                defaultValue={reminder?.last_service_date ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="intervalDays">Interval (days)</Label>
              <Input
                id="intervalDays"
                name="intervalDays"
                type="number"
                defaultValue={reminder?.interval_days ?? ""}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={reminder?.notes ?? ""} rows={2} />
          </div>

          {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : reminder ? "Save changes" : "Add reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
