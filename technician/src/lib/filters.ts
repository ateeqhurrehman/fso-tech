// Date-range filter helpers for the Completed / Withdrawn sections.

import type { CompletedFilter } from "./types";

export interface DateRange {
  from: Date;
  to: Date;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // make Monday the week start
  x.setDate(x.getDate() - diff);
  return x;
}

export function rangeFor(filter: CompletedFilter): DateRange {
  const now = new Date();
  switch (filter) {
    case "this_week": {
      const from = startOfWeek(now);
      return { from, to: now };
    }
    case "last_week": {
      const from = startOfWeek(now);
      from.setDate(from.getDate() - 7);
      const to = new Date(from);
      to.setDate(to.getDate() + 7);
      return { from, to };
    }
    case "this_month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to: now };
    }
    case "last_month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to };
    }
    case "custom":
    default:
      return { from: new Date(0), to: now };
  }
}

export const FILTER_LABELS: Record<CompletedFilter, string> = {
  this_week: "This Week",
  last_week: "Last Week",
  this_month: "This Month",
  last_month: "Last Month",
  custom: "All",
};
