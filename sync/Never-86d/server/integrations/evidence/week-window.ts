import type { ParsedDocument, TruthDocument } from "./types";

export type DateWindow = {
  start: string;
  end: string;
};

/** Saturday 8/29/2026 — live book is this Sun–Sat, not last week's photos. */
export const CTAP_AS_OF = "2026-08-29";

/** Prior photo drop. 32 HEICs. Not "this week." */
export const CTAP_WEEK_2026_08_16: DateWindow = {
  start: "2026-08-16",
  end: "2026-08-22",
};

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** Iowa week is Sunday–Saturday. */
export function sundayOfWeek(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - dt.getUTCDay());
  return dt.toISOString().slice(0, 10);
}

export function weekWindowFor(iso: string): DateWindow {
  const start = sundayOfWeek(iso);
  return { start, end: addDays(start, 6) };
}

/** Live week: Sunday 8/23 through Saturday 8/29/2026. */
export const CTAP_LIVE_WEEK: DateWindow = weekWindowFor(CTAP_AS_OF);

/** Default book = live week. Pass CTAP_WEEK_2026_08_16 to book last week's photos. */
export const CTAP_INVOICE_WEEK: DateWindow = CTAP_LIVE_WEEK;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

const MONTH_INDEX: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

/** Beer house tickets print "Friday, Aug 21, 2026"; two-digit years stay literal. */
const NAMED_DATE =
  /(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+)?(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})/i;

export function parseTicketDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  const numeric = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/);
  if (numeric) {
    const month = Number.parseInt(numeric[1], 10);
    const day = Number.parseInt(numeric[2], 10);
    let year = Number.parseInt(numeric[3], 10);
    if (numeric[3].length === 2) year += 2000;
    if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
    return `${year}-${pad(month)}-${pad(day)}`;
  }

  const named = trimmed.match(NAMED_DATE);
  if (!named) return undefined;
  const month = MONTH_INDEX[named[1].slice(0, 3).toLowerCase()];
  const day = Number.parseInt(named[2], 10);
  const year = Number.parseInt(named[3], 10);
  if (!month || day < 1 || day > 31) return undefined;
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function isDateInWindow(
  isoDate: string | undefined,
  window: DateWindow
): boolean {
  if (!isoDate) return false;
  return isoDate >= window.start && isoDate <= window.end;
}

export function ticketInWindow(
  businessDate: string | undefined,
  window: DateWindow = CTAP_LIVE_WEEK
): boolean {
  return isDateInWindow(parseTicketDate(businessDate), window);
}

export function applyWeekWindow(
  truth: TruthDocument,
  parsed: ParsedDocument,
  window: DateWindow = CTAP_LIVE_WEEK
): TruthDocument {
  const iso = parseTicketDate(parsed.businessDate);
  const inWindow = isDateInWindow(iso, window);
  const warnings = [...truth.warnings];
  if (!iso) {
    warnings.push("No ticket date — cannot book into a week window");
  } else if (!inWindow) {
    warnings.push(
      `Ticket date ${iso} is outside ${window.start}–${window.end}; excluded from the book`
    );
  }

  return {
    ...truth,
    inWeekWindow: inWindow,
    excludeFromBook: !inWindow,
    needsReview: truth.needsReview || !inWindow,
    warnings,
  };
}

export function bookableTotal(truth: TruthDocument): number {
  if (truth.excludeFromBook) return 0;
  const raw = truth.fields.totalAmount?.value;
  if (!raw) return 0;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : 0;
}

export function sumBooked(truths: TruthDocument[]): string {
  const total = truths.reduce((sum, item) => sum + bookableTotal(item), 0);
  return total.toFixed(2);
}
