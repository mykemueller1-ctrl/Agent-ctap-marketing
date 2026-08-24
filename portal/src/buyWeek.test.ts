import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  assertNoPrices,
  biggest,
  buildBuyInsights,
  combinedTotal,
  decideBuyAction,
  qtyLines,
  withActions,
  type BuyLine,
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

  it("lists qty-to-order names + par, and takes the send/hold call", () => {
    expect(qtyLines(seed.liquor.lines)).toHaveLength(32);
    expect(qtyLines(seed.beer.lines)).toHaveLength(25);
    const titos = seed.liquor.lines.find(line => line.name === "Titos");
    expect(titos).toMatchObject({ par: 12, qty: 10 });
    expect(biggest(seed.liquor.lines, 1)[0]?.name).toBe("Titos");
    expect(biggest(seed.beer.lines, 1)[0]?.name).toBe("Busch Light Cans");

    const insights = buildBuyInsights(seed);
    expect(insights[0]?.kind).toBe("send");
    expect(insights[0]?.title).toMatch(/Send /);
    expect(insights.some(i => i.kind === "par-fill")).toBe(true);
  });
});

describe("Buy takeover — send volume, hold qty-1 premium", () => {
  it("sends Titos / Captain / kegs and holds Patron / Heineken", () => {
    const lines: BuyLine[] = [
      { name: "Titos", qty: 10, par: 12, category: "liquor" },
      { name: "Patron Silver", qty: 1, par: 2, category: "liquor" },
      { name: "Busch Keg", qty: 1, category: "keg" },
      { name: "Heineken Bottles", qty: 1, category: "beer" },
      { name: "Pinot Grigio (Beringer) (750ml)", qty: 3, par: 5, category: "wine" },
    ];
    expect(decideBuyAction(lines[0]!)).toBe("send");
    expect(decideBuyAction(lines[1]!)).toBe("hold");
    expect(decideBuyAction(lines[2]!)).toBe("send");
    expect(decideBuyAction(lines[3]!)).toBe("hold");
    expect(decideBuyAction(lines[4]!)).toBe("send");
    expect(withActions(lines).filter(l => l.action === "send").map(l => l.name)).toEqual([
      "Titos",
      "Busch Keg",
      "Pinot Grigio (Beringer) (750ml)",
    ]);
  });
});
