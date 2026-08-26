import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  LABOR_TARGET,
  buildSalesInsights,
  closeInsights,
  pct,
  rollup,
  type CloseSeed,
  type SalesSeed,
} from "./salesWeek";

const seed = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../public/data/ctap-sales.json"),
    "utf8"
  )
) as SalesSeed;

describe("sales seat — last week vs last Z nights", () => {
  it("knows 8/16–8/22 has invoice photos and no Z", () => {
    expect(seed.invoiceWeekHasZ).toBe(false);
    expect(seed.invoiceWeekStart).toBe("2026-08-16");
    const insights = buildSalesInsights(seed);
    expect(insights[0]?.kind).toBe("gap");
  });

  it("flags 7/16 labor over 28% and 7/15 deposit short", () => {
    const thu = seed.recentZ.find(d => d.date === "2026-07-16");
    const wed = seed.recentZ.find(d => d.date === "2026-07-15");
    expect(thu).toBeTruthy();
    expect(wed).toBeTruthy();
    expect(pct(thu!.labor, thu!.grandTotal)).toBeGreaterThan(LABOR_TARGET);
    expect(wed!.expectedCash - (wed!.actualDeposit ?? 0)).toBeCloseTo(30.8, 1);
    const kinds = buildSalesInsights(seed).map(i => i.kind);
    expect(kinds).toContain("labor-over");
    expect(kinds).toContain("cash-short");
  });

  it("rolls the Sept 2025 weekly folder without inventing Aug Zs", () => {
    expect(seed.lastCompleteWeek.days).toHaveLength(7);
    const week = rollup(seed.lastCompleteWeek.days);
    expect(week.grandTotal).toBeCloseTo(40274.06, 2);
    expect(pct(week.labor, week.grandTotal)).toBeLessThan(0.29);
    expect(pct(week.labor, week.grandTotal)).toBeGreaterThan(0.27);
  });

  it("leads Sales with the morning close card when one exists", () => {
    const close: CloseSeed = {
      businessDate: "2026-07-16",
      source: "test",
      nextHuman:
        'Mychael "Myke" Mueller: Food and beer/liquor invoices are both missing. Cannot close cost %. That is Myke\'s book, not a manager duel.',
      card: "card",
      calls: [
        {
          kind: "cannot_close",
          owner: 'Mychael "Myke" Mueller',
          ownerId: "myke",
          domain: "prime",
          reason: "Food and beer/liquor invoices are both missing.",
          nightProof: "Same-day invoices.",
          cannot: "Hand Kenzy and Tom competing close-the-% tickets for one night.",
        },
      ],
    };
    const insights = buildSalesInsights(seed, close);
    expect(insights[0]?.title).toMatch(/Morning close 2026-07-16/);
    expect(insights[0]?.title).toMatch(/Myke/);
    expect(insights.some(i => i.kind === "gap")).toBe(true);
    expect(closeInsights(null)).toEqual([]);
  });
});
