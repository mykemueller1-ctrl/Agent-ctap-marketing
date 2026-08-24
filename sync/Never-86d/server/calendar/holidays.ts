import { firstDayOfFall, laborDay } from "./dates";
import type { HolidayCandidate, HolidayClass } from "./types";

const MUST_USE = [
  "labor day",
  "independence day",
  "thanksgiving",
  "christmas",
  "new year's",
  "halloween",
  "super bowl",
  "st. patrick",
  "cinco de mayo",
  "valentine",
  "mother's day",
  "father's day",
];

export function classifyHoliday(name: string): HolidayClass {
  const lower = name.toLowerCase();
  if (MUST_USE.some((item) => lower.includes(item))) return "MUST_USE";
  if (/^national\b/.test(lower) || /internet holiday/.test(lower)) {
    return "IGNORE";
  }
  return "CONSIDER";
}

export function holidayCandidatesForMonth(
  year: number,
  month: number
): HolidayCandidate[] {
  const items: HolidayCandidate[] = [];
  if (month === 9) {
    items.push({
      id: `holiday-labor-${year}`,
      name: "Labor Day",
      date: laborDay(year),
      classification: "MUST_USE",
      reason: "Major traffic opportunity",
    });
    items.push({
      id: `holiday-fall-${year}`,
      name: "First day of fall",
      date: firstDayOfFall(year),
      classification: "CONSIDER",
      reason: "Fall food/drink push",
    });
  }
  return items;
}

export function datesWeShouldCareAbout(
  candidates: HolidayCandidate[]
): HolidayCandidate[] {
  return candidates.filter((item) => item.classification !== "IGNORE");
}

export function ignoreInternetHolidays(
  candidates: HolidayCandidate[]
): HolidayCandidate[] {
  return candidates.filter((item) => item.classification !== "IGNORE");
}
