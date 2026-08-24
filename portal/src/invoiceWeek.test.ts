import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  INVOICE_SHEET_CADENCE,
  buildInvoiceInsights,
  exampleTicketsBooked,
  photoFilenames,
  sheetRowsForWeek,
  type InvoiceWeekSeed,
} from "./invoiceWeek";
import { ticketInWindow } from "./weekWindow";

const seed = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "../public/data/ctap-invoice-week.json"
    ),
    "utf8"
  )
) as InvoiceWeekSeed;

describe("last-week invoice booking window", () => {
  it("books 8/16–8/22 including Friday named dates, drops 8/11 and old years", () => {
    expect(ticketInWindow("8/16/2026")).toBe(true);
    expect(ticketInWindow("8/22/2026")).toBe(true);
    expect(ticketInWindow("Friday, Aug 21, 2026")).toBe(true);
    expect(ticketInWindow("8/11/2026")).toBe(false);
    expect(ticketInWindow("8/12/2023")).toBe(false);
    expect(ticketInWindow("8/17/24")).toBe(false);
    const sample = exampleTicketsBooked();
    expect(sample.inWeek.every(Boolean)).toBe(true);
    expect(sample.outOfBook.every(v => v === false)).toBe(true);
  });
});

describe("Drive invoice sheet SOP + photo drop", () => {
  it("maps Mon–Fri cadence onto the 8/16 Sunday week", () => {
    const rows = sheetRowsForWeek("2026-08-16");
    expect(rows[0]).toMatchObject({
      weekday: "Monday",
      date: "2026-08-17",
      vendors: ["Sawyer"],
    });
    expect(rows[1].date).toBe("2026-08-18");
    expect(rows[1].vendors).toContain("Performance");
    expect(rows[3]).toMatchObject({
      weekday: "Thursday",
      date: "2026-08-20",
      vendors: ["Food"],
    });
    expect(rows[4].date).toBe("2026-08-21");
    expect(INVOICE_SHEET_CADENCE).toHaveLength(5);
  });

  it("expands the 32 HEIC names from the Drive folder", () => {
    const names = photoFilenames(seed.firstPhoto, seed.lastPhoto);
    expect(names).toHaveLength(32);
    expect(names[0]).toBe("IMG_6700.HEIC");
    expect(names[31]).toBe("IMG_6731.HEIC");
    expect(seed.photoCount).toBe(32);
    expect(seed.sourceKind).toBe("photo_ocr");
    expect(seed.ocrLive).toBe(false);
  });

  it("flags the sales-denominator hole when no Z exists for the photo week", () => {
    const insights = buildInvoiceInsights(seed, false);
    expect(insights.some(i => i.kind === "sales-gap")).toBe(true);
    expect(insights.some(i => i.kind === "photos" && i.title.includes("32"))).toBe(
      true
    );
  });
});
