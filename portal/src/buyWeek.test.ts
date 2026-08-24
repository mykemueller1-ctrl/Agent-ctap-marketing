import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  assertNoPrices,
  biggest,
  buildBuyInsights,
  combinedTotal,
  qtyLines,
  type BuySeed,
} from "./buyWeek";

const seed = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "../public/data/ctap-buy.json"
    ),
    "utf8"
  )
) as BuySeed;

describe("Buy seat — Drive liquor/beer sheet without dumping prices", () => {
  it("keeps unit costs out of git and uses the 8/23 sheet totals", () => {
    expect(assertNoPrices(seed)).toEqual([]);
    expect(seed.pricesInGit).toBe(false);
    expect(seed.liquor.total).toBe(1167.31);
    expect(seed.beer.total).toBe(2005.56);
    expect(combinedTotal(seed)).toBeCloseTo(3172.87);
    expect(seed.mixersOrdered).toBe(0);
  });

  it("lists qty-to-order names + par, and flags the par-fill", () => {
    expect(qtyLines(seed.liquor.lines)).toHaveLength(32);
    expect(qtyLines(seed.beer.lines)).toHaveLength(25);
    const titos = seed.liquor.lines.find(line => line.name === "Titos");
    expect(titos).toMatchObject({ par: 12, qty: 10 });
    expect(biggest(seed.liquor.lines, 1)[0]?.name).toBe("Titos");
    expect(biggest(seed.beer.lines, 1)[0]?.name).toBe("Busch Light Cans");

    const insights = buildBuyInsights(seed);
    expect(insights[0]?.kind).toBe("par-fill");
    expect(insights[0]?.title).toMatch(/par-fill/);
    expect(insights[0]?.detail).toMatch(/POS movement/);
    expect(insights.some(i => i.kind === "prices")).toBe(true);
  });
});
