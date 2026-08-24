import type { DayOfWeek } from "./types";

const DAYS: DayOfWeek[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function monthKey(year: number, month: number): string {
  return `${year}-${pad(month)}`;
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [year, month] = key.split("-").map(Number);
  return { year, month };
}

export function monthLabel(year: number, month: number): string {
  const name = new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return name;
}

export function nextMonthKey(asOf: string): string {
  const date = new Date(`${asOf}T00:00:00Z`);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 2;
  const next = new Date(Date.UTC(year, month - 1, 1));
  return monthKey(next.getUTCFullYear(), next.getUTCMonth() + 1);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function weekdayOn(isoDate: string): DayOfWeek {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return DAYS[date.getUTCDay()];
}

export function eachDateInMonth(year: number, month: number): string[] {
  const count = daysInMonth(year, month);
  return Array.from({ length: count }, (_, index) => {
    return `${year}-${pad(month)}-${pad(index + 1)}`;
  });
}

export function dayOfMonth(isoDate: string): number {
  return Number.parseInt(isoDate.slice(8, 10), 10);
}

/** Labor Day = first Monday in September. */
export function laborDay(year: number): string {
  for (const date of eachDateInMonth(year, 9)) {
    if (weekdayOn(date) === "monday") return date;
  }
  return `${year}-09-01`;
}

/** Civil autumn equinox used as first day of fall for planning. */
export function firstDayOfFall(year: number): string {
  return `${year}-09-22`;
}
