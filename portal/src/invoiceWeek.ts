import {
  CTAP_INVOICE_WEEK,
  CTAP_WEEK_2026_08_16,
  addDays,
  ticketInWindow,
  type DateWindow,
} from "./weekWindow";

export type InvoiceSheetRow = {
  weekday: string;
  vendors: string[];
};

export type InvoiceWeekSeed = {
  weekStart: string;
  weekEnd: string;
  asOf?: string;
  priorPhotoWeekStart?: string;
  priorPhotoWeekEnd?: string;
  driveFolderId: string;
  driveFolderTitle: string;
  photoCount: number;
  firstPhoto: string;
  lastPhoto: string;
  mimeType: string;
  uploadedAt: string;
  sourceKind: "photo_ocr";
  ocrLive: boolean;
  invoiceSheetTitle: string;
  invoiceSheet: InvoiceSheetRow[];
  outOfBook: string[];
  photos: Array<{ name: string; fileId: string }>;
};

export type InvoiceInsight = {
  kind: "photos" | "ocr" | "sheet" | "window" | "sales-gap";
  title: string;
  detail: string;
};

/** Drive SOP "Invoice Sheet for the week" — blanks still unfilled. */
export const INVOICE_SHEET_CADENCE: InvoiceSheetRow[] = [
  { weekday: "Monday", vendors: ["Sawyer"] },
  { weekday: "Tuesday", vendors: ["Northern Lights", "Performance"] },
  { weekday: "Wednesday", vendors: ["Sawyer"] },
  { weekday: "Thursday", vendors: ["Food"] },
  { weekday: "Friday", vendors: ["Northern Lights", "Performance", "Sawyers"] },
];

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export { addDays };

export function sheetRowsForWeek(
  weekStart: string,
  cadence: InvoiceSheetRow[] = INVOICE_SHEET_CADENCE
): Array<InvoiceSheetRow & { date: string }> {
  return cadence.map(row => {
    const index = WEEKDAYS.indexOf(row.weekday);
    const offset = index < 0 ? 0 : index;
    return { ...row, date: addDays(weekStart, offset) };
  });
}

export function driveFileUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function photoFilenames(first: string, last: string): string[] {
  const parse = (name: string) => {
    const m = name.match(/^(IMG_)(\d+)(\.\w+)$/i);
    if (!m) return null;
    return { prefix: m[1], n: Number(m[2]), ext: m[3], width: m[2].length };
  };
  const a = parse(first);
  const b = parse(last);
  if (!a || !b || a.prefix !== b.prefix || a.ext !== b.ext || b.n < a.n) {
    return [first];
  }
  const names: string[] = [];
  for (let n = a.n; n <= b.n; n++) {
    names.push(`${a.prefix}${String(n).padStart(a.width, "0")}${a.ext}`);
  }
  return names;
}

export function buildInvoiceInsights(
  seed: InvoiceWeekSeed,
  salesHasZForWeek: boolean,
  window: DateWindow = CTAP_INVOICE_WEEK
): InvoiceInsight[] {
  const insights: InvoiceInsight[] = [];
  insights.push({
    kind: "photos",
    title: `${seed.photoCount} invoice photos in Drive`,
    detail: `${seed.driveFolderTitle} · ${seed.firstPhoto}–${seed.lastPhoto} · ${seed.mimeType}. ${seed.photos.length} Drive links in the seat. Stay in Drive — bytes not in git.`,
  });
  insights.push({
    kind: seed.ocrLive ? "ocr" : "ocr",
    title: seed.ocrLive
      ? "Document AI is live"
      : "Photos route to OCR — Document AI is not live yet",
    detail:
      "Sysco / Northern Lights / Sawyer / Performance stay photo_ocr. Digital PDFs never go to OCR. Secrets stay out of git.",
  });
  insights.push({
    kind: "sheet",
    title: "Invoice sheet SOP is still blank",
    detail: `${seed.invoiceSheetTitle}: Mon Sawyer · Tue NL + Performance · Wed Sawyer · Thu Food · Fri NL + Performance + Sawyers.`,
  });
  insights.push({
    kind: "window",
    title: `Book ${window.start} → ${window.end} only`,
    detail: `${seed.outOfBook.join(" · ")} Last week's photos (${seed.priorPhotoWeekStart ?? CTAP_WEEK_2026_08_16.start}–${seed.priorPhotoWeekEnd ?? CTAP_WEEK_2026_08_16.end}) stay in that book, not this one.`,
  });
  if (!salesHasZForWeek) {
    insights.push({
      kind: "sales-gap",
      title: "Cannot close this week's cost %",
      detail:
        "Live week is Sun 8/23–Sat 8/29. Drive has no 8/29 Z and no invoice folder for this week. Last week's 32 HEICs are 8/16–8/22, not today.",
    });
  }
  return insights;
}

export function exampleTicketsBooked(window: DateWindow = CTAP_INVOICE_WEEK) {
  return {
    inWeek: [
      ticketInWindow("8/23/2026", window),
      ticketInWindow("8/29/2026", window),
      ticketInWindow("Friday, Aug 28, 2026", window),
    ],
    outOfBook: [
      ticketInWindow("8/16/2026", window),
      ticketInWindow("8/22/2026", window),
      ticketInWindow("8/11/2026", window),
    ],
  };
}
