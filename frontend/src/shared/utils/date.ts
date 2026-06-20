import { format, parseISO, addDays, addMonths } from "date-fns";

export const DATE_FORMAT = "MMM d, yyyy";
export const DATETIME_FORMAT = "MMM d, yyyy HH:mm";

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, DATE_FORMAT);
  } catch {
    return "Invalid date";
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, DATETIME_FORMAT);
  } catch {
    return "Invalid date";
  }
}

export function toISOString(date: Date): string {
  return date.toISOString();
}

export type PlanType =
  | "1_week"
  | "2_weeks"
  | "1_month"
  | "3_months"
  | "6_months";

export function calculateEndDate(startDate: Date, plan: PlanType): Date {
  switch (plan) {
    case "1_week":
      return addDays(startDate, 7);
    case "2_weeks":
      return addDays(startDate, 14);
    case "1_month":
      return addMonths(startDate, 1);
    case "3_months":
      return addMonths(startDate, 3);
    case "6_months":
      return addMonths(startDate, 6);
    default:
      return startDate;
  }
}
