import { describe, expect, it } from "vitest";
import {
  CONFLUENCE_LAYOUT,
  FDD_LAYOUT,
  HUMES_LAYOUT,
  HUMES_WEEKDAY_LAYOUT,
  HYVEE_GROCERY_LAYOUT,
  HYVEE_WINE_LAYOUT,
  LABOR_PAYOUT_LAYOUT,
  MISC_PAYOUT_LAYOUT,
  NL_LAYOUT,
  PAYOUT_LAYOUT,
  PFS_DELIVERY_LAYOUT,
  PFS_LAST_PAGE_LAYOUT,
  SAWYER_LAYOUT,
  SYSCO_LAYOUT,
} from "./fixtures/layouts";
import { parserFactory } from "./parser-factory";
import { buildTruth } from "./truth-engine";
import { detectVendorKey } from "./vendor-detect";

describe("vendor layout parsers", () => {
  it("parses a PFS-style delivery page and holds the total for last page", () => {
    const page1 = parserFactory.parse(PFS_DELIVERY_LAYOUT, "performance_foods");
    expect(page1.parserId).toBe("pfs-delivery");
    expect(page1.invoiceNumber).toBe("100001");
    expect(page1.items).toHaveLength(2);
    expect(page1.continued).toBe(true);
    expect(page1.needsReview).toBe(true);

    const page2 = parserFactory.parse(PFS_LAST_PAGE_LAYOUT, "performance_foods");
    expect(page2.totalAmount).toBe("28.00");
    expect(page2.lastPage).toBe(true);
    expect(page2.items).toHaveLength(1);
    expect(page2.items[0]?.sku).toBe("HB001");
    expect(page2.items.some((item) => /fuel/i.test(item.product))).toBe(false);
  });

  it("parses a Sysco-style invoice total, not the group total", () => {
    const parsed = parserFactory.parse(SYSCO_LAYOUT, "sysco");
    expect(parsed.parserId).toBe("sysco-invoice");
    expect(parsed.totalAmount).toBe("27.00");
    expect(parsed.items[0]?.sku).toBe("5070001");
  });

  it("parses Northern Lights-style item / extended columns", () => {
    const parsed = parserFactory.parse(NL_LAYOUT, "northern_lights");
    expect(parsed.parserId).toBe("nl-invoice");
    expect(parsed.totalAmount).toBe("27.82");
    expect(parsed.items).toHaveLength(2);
  });

  it("parses beer invoices with returns and a city house ticket", () => {
    const humes = parserFactory.parse(HUMES_LAYOUT, "humes");
    expect(humes.items.some((item) => (item.quantity ?? 0) < 0)).toBe(true);
    expect(humes.totalAmount).toBe("48.45");

    const friday = parserFactory.parse(HUMES_WEEKDAY_LAYOUT, "humes");
    expect(friday.businessDate).toBe("Aug 21, 2026");
    expect(friday.totalAmount).toBe("15.49");
    expect(friday.items.find((item) => (item.quantity ?? 0) === -9)?.total).toBe(
      "-12.96"
    );

    const fdd = parserFactory.parse(FDD_LAYOUT, "fort_dodge_distributing");
    expect(fdd.invoiceNumber).toBe("W-500005");
    expect(fdd.totalAmount).toBe("80.00");
  });

  it("parses wine, grocery, meat ticket, payout, and handwritten keg credit", () => {
    const wine = parserFactory.parse(HYVEE_WINE_LAYOUT, "hyvee_wine");
    expect(wine.items).toHaveLength(2);
    expect(wine.totalAmount).toBe("35.00");

    const grocery = parserFactory.parse(HYVEE_GROCERY_LAYOUT, "hyvee_grocery");
    expect(grocery.documentKind).toBe("grocery_receipt");
    expect(grocery.totalAmount).toBe("21.94");

    const meat = parserFactory.parse(SAWYER_LAYOUT, "sawyer_meats");
    expect(meat.items).toHaveLength(2);
    expect(meat.items.some((item) => /Pork/.test(item.product))).toBe(false);

    const payout = parserFactory.parse(PAYOUT_LAYOUT, "pdq_payout");
    expect(payout.documentKind).toBe("payout");
    expect(payout.totalAmount).toBe("10.00");

    const labor = parserFactory.parse(LABOR_PAYOUT_LAYOUT, "pdq_payout");
    expect(labor.documentKind).toBe("payout");
    expect(labor.printedTotal).toBe("25.00");
    expect(labor.handwrittenTotal).toBe("25.00");
    expect(labor.totalAmount).toBe("25.00");
    expect(labor.warnings.join(" ")).toMatch(/3 hrs/i);
    expect(labor.warnings.join(" ")).toMatch(/5\.00/);

    const misc = parserFactory.parse(MISC_PAYOUT_LAYOUT, "pdq_payout");
    expect(misc.totalAmount).toBe("15.35");
    expect(misc.businessDate).toBe("8/22/2026");
    expect(misc.items[0]?.product).toMatch(/Demo Glassware/i);

    const keg = parserFactory.parse(CONFLUENCE_LAYOUT, "confluence");
    expect(keg.printedTotal).toBe("216.00");
    expect(keg.handwrittenTotal).toBe("186.00");
    expect(keg.totalAmount).toBe("186.00");

    const truth = buildTruth({
      parsed: [keg],
      extraction: {
        text: CONFLUENCE_LAYOUT,
        pages: [],
        method: "ocr_fixture",
        ocrVendor: "none",
        warnings: [],
        confidence: 0.8,
      },
    });
    expect(truth.fields.totalAmount?.value).toBe("186.00");
    expect(truth.warnings.join(" ")).toMatch(/handwritten/i);
  });

  it("detects vendor from fingerprints without a hint", () => {
    expect(detectVendorKey("PAY OUT\nAmount: 1.00")).toBe("pdq_payout");
    expect(detectVendorKey("Amount: 1.00\nPayee Sign:")).toBe("pdq_payout");
    expect(detectVendorKey("HUMES DISTRIBUTING INC\nINVOICE 1")).toBe("humes");
    expect(detectVendorKey("PERFORMANCE FOODSERVICE\nINVOICE 1")).toBe(
      "performance_foods"
    );
    expect(detectVendorKey("Nightly Z-Report\nSales Summary")).toBe("pdq");
  });
});
