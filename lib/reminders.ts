import type { ReminderItem } from "@/types/supabase";

export type ReminderStatus = "good" | "due_soon" | "overdue" | "none";

const DUE_SOON_THRESHOLD_DAYS = 30;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getReminderStatus(
  dueDate: string | null,
  today: Date = new Date()
): { status: ReminderStatus; daysRemaining: number | null } {
  if (!dueDate) return { status: "none", daysRemaining: null };

  const due = parseDateOnly(dueDate);
  const diffMs = due.getTime() - startOfDay(today).getTime();
  const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) return { status: "overdue", daysRemaining };
  if (daysRemaining <= DUE_SOON_THRESHOLD_DAYS) return { status: "due_soon", daysRemaining };
  return { status: "good", daysRemaining };
}

export function getReminderProgress(
  item: Pick<ReminderItem, "last_service_date" | "interval_days" | "due_date">,
  today: Date = new Date()
): number | null {
  if (!item.last_service_date || !item.interval_days || !item.due_date) return null;

  const last = parseDateOnly(item.last_service_date).getTime();
  const due = parseDateOnly(item.due_date).getTime();
  const now = startOfDay(today).getTime();

  if (due <= last) return null;

  const pct = ((now - last) / (due - last)) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function sortByUrgency(items: ReminderItem[], today: Date = new Date()): ReminderItem[] {
  const rank: Record<ReminderStatus, number> = { overdue: 0, due_soon: 1, good: 2, none: 3 };
  return [...items].sort((a, b) => {
    const statusA = getReminderStatus(a.due_date, today).status;
    const statusB = getReminderStatus(b.due_date, today).status;
    if (rank[statusA] !== rank[statusB]) return rank[statusA] - rank[statusB];

    const daysA = getReminderStatus(a.due_date, today).daysRemaining;
    const daysB = getReminderStatus(b.due_date, today).daysRemaining;
    if (daysA == null) return 1;
    if (daysB == null) return -1;
    return daysA - daysB;
  });
}
