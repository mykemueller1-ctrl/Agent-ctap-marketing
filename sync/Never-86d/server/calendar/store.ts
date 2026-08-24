import { createHash } from "node:crypto";
import type {
  CalendarApproval,
  CalendarEmailLog,
  CalendarMonth,
  CalendarVersion,
  RecurringSpecial,
  SpecialPerformance,
} from "./types";
import { DEFAULT_RECURRING_LIBRARY } from "./library";

export function snapshotHash(month: CalendarMonth): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        monthKey: month.monthKey,
        version: month.version,
        status: month.status,
        recurring: month.recurring.map((item) => item.libraryId),
        monthlyFood: month.monthlyFood?.name,
        monthlyDrink: month.monthlyDrink?.name,
        events: month.events.map((item) => item.id),
      })
    )
    .digest("hex");
}

export type CalendarStore = {
  library: RecurringSpecial[];
  months: Map<string, CalendarMonth>;
  versions: CalendarVersion[];
  approvals: CalendarApproval[];
  emails: CalendarEmailLog[];
  performance: SpecialPerformance[];
};

export function createStore(
  library: RecurringSpecial[] = DEFAULT_RECURRING_LIBRARY
): CalendarStore {
  return {
    library: library.map((item) => ({ ...item })),
    months: new Map(),
    versions: [],
    approvals: [],
    emails: [],
    performance: [],
  };
}

export function saveMonth(store: CalendarStore, month: CalendarMonth): CalendarMonth {
  store.months.set(month.monthKey, month);
  store.versions.push({
    monthId: month.id,
    version: month.version,
    snapshotHash: snapshotHash(month),
    createdAt: month.createdAt,
  });
  return month;
}

export function getMonth(store: CalendarStore, monthKey: string): CalendarMonth {
  const month = store.months.get(monthKey);
  if (!month) throw new Error(`No calendar for ${monthKey}`);
  return month;
}
