import { describe, expect, it } from "vitest";
import { parserFactory } from "./parser-factory";
import { buildTruth } from "./truth-engine";
import {
  CONFLUENCE_LAYOUT,
  HUMES_WEEKDAY_LAYOUT,
  HYVEE_GROCERY_LAYOUT,
  LABOR_PAYOUT_LAYOUT,
  MISC_PAYOUT_LAYOUT,
  PAYOUT_LAYOUT,
  PFS_LAST_PAGE_LAYOUT,
  SAWYER_LAYOUT,
} from "./fixtures/layouts";
import {
  CTAP_WEEK_2026_08_16,
  applyWeekWindow,
  parseTicketDate,
  sumBooked,
  ticketInWindow,
} from "./week-window";

function truthFor(text: string, vendorKey: string) {
  const parsed = parserFactory.parse(text, vendorKey);
  return applyWeekWindow(
    buildTruth({
      parsed: [parsed],
      extraction: {
        text,
        pages: [],
        method: "ocr_fixture",
        ocrVendor: "none",
        warnings: [],
        confidence: 0.9,
      },
    }),
    parsed,
    CTAP_WEEK_2026_08_16
  );
}

describe("8/16–8/22 week window", () => {
  it("keeps 8/16 through 8/22 and drops anything else", () => {
    expect(parseTicketDate("8/17/24")).toBe("2024-08-17");
    expect(parseTicketDate("08/12/2023")).toBe("2023-08-12");
    expect(parseTicketDate("8/11/2026")).toBe("2026-08-11");
    expect(parseTicketDate("Friday, Aug 21, 2026")).toBe("2026-08-21");
    expect(parseTicketDate("Aug 21, 2026")).toBe("2026-08-21");
    expect(ticketInWindow("08/17/2026")).toBe(true);
    expect(ticketInWindow("08/22/2026")).toBe(true);
    expect(ticketInWindow("08/16/2026")).toBe(true);
    expect(ticketInWindow("8/11/2026")).toBe(false);
    expect(ticketInWindow("8/17/24")).toBe(false);
    expect(ticketInWindow("08/12/2023")).toBe(false);
  });

  it("excludes payout/grocery before 8/16 and a 2024 meat ticket from the book", () => {
    const grocery = truthFor(HYVEE_GROCERY_LAYOUT, "hyvee_grocery");
    const payout = truthFor(PAYOUT_LAYOUT, "pdq_payout");
    const sawyer = truthFor(
      SAWYER_LAYOUT.replace("08/01/2026", "8/17/24"),
      "sawyer_meats"
    );
    expect(grocery.excludeFromBook).toBe(true);
    expect(payout.excludeFromBook).toBe(true);
    expect(sawyer.excludeFromBook).toBe(true);
    expect(sumBooked([grocery, payout, sawyer])).toBe("0.00");
  });

  it("books an in-window handwritten keg ticket", () => {
    const keg = truthFor(
      CONFLUENCE_LAYOUT.replace("08/01/2026", "08/17/2026"),
      "confluence"
    );
    expect(keg.inWeekWindow).toBe(true);
    expect(keg.excludeFromBook).toBe(false);
    expect(keg.fields.totalAmount?.value).toBe("186.00");
  });

  it("books Friday beer, Tuesday last-page food, labor, and after-midnight misc", () => {
    const humes = truthFor(HUMES_WEEKDAY_LAYOUT, "humes");
    expect(humes.inWeekWindow).toBe(true);
    expect(humes.fields.businessDate?.value).toBe("Aug 21, 2026");
    expect(humes.fields.totalAmount?.value).toBe("15.49");

    const pfs = truthFor(PFS_LAST_PAGE_LAYOUT, "performance_foods");
    expect(pfs.inWeekWindow).toBe(true);
    expect(pfs.fields.totalAmount?.value).toBe("28.00");

    const labor = truthFor(LABOR_PAYOUT_LAYOUT, "pdq_payout");
    expect(labor.inWeekWindow).toBe(true);
    expect(labor.documentKind).toBe("payout");
    expect(labor.fields.totalAmount?.value).toBe("25.00");

    const misc = truthFor(MISC_PAYOUT_LAYOUT, "pdq_payout");
    expect(misc.inWeekWindow).toBe(true);
    expect(misc.fields.totalAmount?.value).toBe("15.35");

    expect(sumBooked([humes, pfs, labor, misc])).toBe("83.84");
  });
});
