import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  LABOR_TARGET,
  buildSalesInsights,
  pct,
  rollup,
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
});
