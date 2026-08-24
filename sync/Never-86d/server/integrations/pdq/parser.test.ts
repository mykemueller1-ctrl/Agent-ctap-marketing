import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import {
  PDQ_PARSER_VERSION,
  parsePdqZReportText,
  toDailySalesInsert,
} from "./parser";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

function loadFixture(name: string): string {
  return readFileSync(join(fixturesDir, name), "utf8");
}

describe("parsePdqZReportText — multiline PDQ Z-report layout", () => {
  it("parses 2026-07-16 Community Pizza Z-report at high confidence", () => {
    const parsed = parsePdqZReportText(loadFixture("zreport-2026-07-16.txt"));

    expect(parsed.parserVersion).toBe(PDQ_PARSER_VERSION);
    expect(parsed.businessDate).toBe("2026-07-16");
    expect(parsed.grandTotal).toBe("4645.04");
    expect(parsed.subtotal).toBe("4451.55");
    expect(parsed.tax).toBe("193.49");
    expect(parsed.orderCounts).toEqual({
      pickup: { qty: 20, amount: "603.56" },
      delivery: { qty: 22, amount: "822.47" },
      bar: { qty: 82, amount: "1129.93" },
      table: { qty: 44, amount: "2089.08" },
      total: { qty: 168, amount: "4645.04" },
    });
    expect(parsed.categorySales.food).toEqual({
      qty: 529,
      amount: "2943.33",
    });
    expect(parsed.categorySales.largePizzas).toEqual({
      qty: 7,
      amount: "153.94",
    });
    expect(parsed.categorySales.beer.amount).toBe("712.00");
    expect(parsed.categorySales.liquor.amount).toBe("642.00");
    expect(parsed.categorySales.pop.amount).toBe("122.25");
    expect(parsed.labor).toEqual({
      headcount: 18,
      total: "1429.94",
      pct: "34.00",
    });
    expect(parsed.discounts).toEqual({
      qty: 9,
      amount: "102.22",
      pct: "2.24",
    });
    expect(parsed.voids).toEqual({ qty: 0, amount: "0.00" });
    expect(parsed.cash.expectedCash).toBe("1600.93");
    expect(parsed.cash.creditCards).toBe("2092.32");
    expect(parsed.cash.payOuts).toBe("212.72");
    expect(parsed.confidence).toBeGreaterThanOrEqual(0.9);
    expect(parsed.needsReview).toBe(false);
    expect(parsed.warnings).toEqual([]);
  });

  it("parses 2026-07-15 Community Pizza Z-report", () => {
    const parsed = parsePdqZReportText(loadFixture("zreport-2026-07-15.txt"));
    expect(parsed.businessDate).toBe("2026-07-15");
    expect(parsed.grandTotal).toBe("5738.03");
    expect(parsed.tax).toBe("287.69");
    expect(parsed.orderCounts.total).toEqual({
      qty: 178,
      amount: "5738.03",
    });
    expect(parsed.categorySales.food.amount).toBe("3912.02");
    expect(parsed.categorySales.food.qty).toBe(705);
    expect(parsed.categorySales.largePizzas).toEqual({
      qty: 32,
      amount: "655.76",
    });
    expect(parsed.labor.headcount).toBe(19);
    expect(parsed.labor.total).toBe("1335.70");
    expect(parsed.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("maps into daily_sales insert shape", () => {
    const parsed = parsePdqZReportText(loadFixture("zreport-2026-07-16.txt"));
    const row = toDailySalesInsert(parsed, {
      sourceProvider: "gmail",
      sourceMailbox: "communitypizza2026@gmail.com",
      sourceMessageId: "msg-test",
      sourceAttachmentHash: "hash-test",
      dedupeKey: "pdq:2026-07-16:hash-test",
      rawText: "fixture",
    });
    expect(row).not.toBeNull();
    expect(row?.businessDate).toBe("2026-07-16");
    expect(row?.grandTotal).toBe("4645.04");
    expect(row?.totalQty).toBe(168);
    expect(row?.catFoodAmount).toBe("2943.33");
    expect(row?.catLargePizzasAmount).toBe("153.94");
    expect(row?.parserVersion).toBe(PDQ_PARSER_VERSION);
  });
});
