"use client";

import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ReminderBadge } from "@/components/reminders/reminder-badge";
import { ReminderFormDialog } from "@/components/reminders/reminder-form-dialog";
import { getReminderProgress } from "@/lib/reminders";
import { deleteReminder } from "@/app/(dashboard)/vehicles/reminder-actions";
import type { ReminderItem } from "@/types/supabase";

export function ReminderRow({ vehicleId, item }: { vehicleId: string; item: ReminderItem }) {
  const [isPending, startTransition] = useTransition();
  const progress = getReminderProgress(item);

  return (
    <div className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <ReminderBadge item={item} />
        {progress != null && <Progress value={progress} className="mt-2 h-1.5 max-w-48" />}
        {item.notes && <p className="mt-1 truncate text-sm text-muted-foreground">{item.notes}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <ReminderFormDialog
          vehicleId={vehicleId}
          reminder={item}
          trigger={
            <Button variant="ghost" size="icon" aria-label="Edit reminder">
              <Pencil className="size-4" />
            </Button>
          }
        />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete reminder"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await deleteReminder(item.id, vehicleId);
              toast.success("Reminder deleted");
            })
          }
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
