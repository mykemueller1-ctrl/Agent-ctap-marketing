/**
 * Booking window from last week's OCR / vendor-parser chat:
 * Sunday 8/16/2026 through Saturday 8/22/2026, inclusive.
 * Tickets dated 8/11, 8/12/2023, or 8/17/2024 stay parsed, not booked.
 */

export type DateWindow = {
  start: string;
  end: string;
};

export const CTAP_INVOICE_WEEK: DateWindow = {
  start: "2026-08-16",
  end: "2026-08-22",
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function parseTicketDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const named = raw
    .trim()
    .match(
      /(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday),?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i
    );
  if (named) {
    const months: Record<string, number> = {
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
    const month = months[named[1].toLowerCase().slice(0, 3)];
    const day = Number.parseInt(named[2], 10);
    const year = Number.parseInt(named[3], 10);
    if (!month) return undefined;
    return `${year}-${pad(month)}-${pad(day)}`;
  }
  const match = raw.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/);
  if (!match) return undefined;
  const month = Number.parseInt(match[1], 10);
  const day = Number.parseInt(match[2], 10);
  let year = Number.parseInt(match[3], 10);
  if (match[3].length === 2) year += 2000;
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function isDateInWindow(
  isoDate: string | undefined,
  window: DateWindow = CTAP_INVOICE_WEEK
): boolean {
  if (!isoDate) return false;
  return isoDate >= window.start && isoDate <= window.end;
}

export function ticketInWindow(
  businessDate: string | undefined,
  window: DateWindow = CTAP_INVOICE_WEEK
): boolean {
  return isDateInWindow(parseTicketDate(businessDate), window);
}
