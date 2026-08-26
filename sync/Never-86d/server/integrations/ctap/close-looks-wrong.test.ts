import { describe, expect, it } from "vitest";
import { closeLooksWrong, closeLooksWrongCard, closeNextHuman } from "./close-looks-wrong";

describe("closeLooksWrong", () => {
  it("treats a missing mix line as Missing Evidence, not $0", () => {
    const calls = closeLooksWrong({
      businessDate: "2026-08-25",
      sales: 5000,
      foodSales: 3000,
      beerSales: 800,
      liquorSales: 700,
      laborDollars: 1200,
    });
    const pop = calls.find(c => /Pop/i.test(c.reason));
    expect(pop?.kind).toBe("missing_evidence");
    expect(pop?.cannot).toMatch(/\$0/);
    expect(calls.some(c => c.kind === "pattern" && c.domain === "food")).toBe(
      false
    );
  });

  it("does not call a cash shortage from a blank or $0 field", () => {
    const calls = closeLooksWrong({
      businessDate: "2026-08-25",
      sales: 5000,
      foodSales: 3000,
      beerSales: 900,
      liquorSales: 700,
      popSales: 400,
      laborDollars: 1200,
      enteredDeposit: 0,
    });
    const cash = calls.find(c => c.domain === "cash");
    expect(cash?.kind).toBe("missing_evidence");
    expect(cash?.ownerId).toBe("myke");
    expect(cash?.cannot).toMatch(/shortage/i);
  });

  it("routes a food-cost rail miss to Tom as pattern, not verdict", () => {
    const calls = closeLooksWrong({
      businessDate: "2026-08-25",
      sales: 5000,
      foodSales: 3000,
      beerSales: 900,
      liquorSales: 700,
      popSales: 400,
      laborDollars: 1200,
      expectedCash: 800,
      enteredDeposit: 800,
      foodCogs: 1200,
    });
    const food = calls.find(c => c.domain === "food" && c.kind === "pattern");
    expect(food?.ownerId).toBe("tom");
    expect(food?.reason).toMatch(/40%/);
    expect(food?.sourceTag).toBe("ESTIMATED");
  });

  it("routes beer and liquor rail misses to Kenzy; two houses escalate to Myke", () => {
    const calls = closeLooksWrong({
      businessDate: "2026-08-25",
      sales: 5000,
      foodSales: 3000,
      beerSales: 1000,
      liquorSales: 800,
      popSales: 200,
      laborDollars: 1200,
      expectedCash: 800,
      enteredDeposit: 800,
      foodCogs: 1200,
      beerCogs: 300,
      liquorCogs: 200,
    });
    expect(calls.some(c => c.domain === "beer" && c.ownerId === "kenzy")).toBe(
      true
    );
    expect(calls.some(c => c.domain === "food" && c.ownerId === "tom")).toBe(
      true
    );
    const prime = calls.find(c => c.domain === "prime" && c.kind === "pattern");
    expect(prime?.ownerId).toBe("myke");
    expect(prime?.cannot).toMatch(/competing verdicts/);
  });

  it("refuses to close on verbal yes", () => {
    const calls = closeLooksWrong({
      businessDate: "2026-08-25",
      sales: 5000,
      foodSales: 3000,
      beerSales: 900,
      liquorSales: 700,
      popSales: 400,
      laborDollars: 1200,
      expectedCash: 800,
      enteredDeposit: 800,
      verbalOk: true,
    });
    expect(calls.some(c => c.kind === "cannot_close" && /Verbal/.test(c.reason))).toBe(
      true
    );
  });

  it("cannot close food % on sales alone", () => {
    const calls = closeLooksWrong({
      businessDate: "2026-08-25",
      sales: 5000,
      foodSales: 3000,
      beerSales: 900,
      liquorSales: 700,
      popSales: 400,
      laborDollars: 1200,
      expectedCash: 800,
      enteredDeposit: 800,
    });
    const food = calls.find(c => c.domain === "food" && c.kind === "cannot_close");
    expect(food?.ownerId).toBe("tom");
    expect(food?.cannot).toMatch(/sales alone/);
    const prime = calls.find(c => c.domain === "prime" && c.kind === "cannot_close");
    expect(prime?.ownerId).toBe("myke");
    expect(closeNextHuman(calls)).toMatch(/Myke/);
    expect(closeNextHuman(calls)).toMatch(/both missing/);
  });

  it("prints a card morning parse can paste", () => {
    const card = closeLooksWrongCard({
      businessDate: "2026-08-25",
      sales: null,
    });
    expect(card).toMatch(/No sales denominator/);
    expect(card).toMatch(/Myke/);
  });

  it("flags a deposit gap only when both cash numbers are on the close", () => {
    const calls = closeLooksWrong({
      businessDate: "2026-07-15",
      sales: 5738.03,
      foodSales: 3256.26,
      beerSales: 865.5,
      liquorSales: 583.5,
      popSales: 400,
      laborDollars: 1335.7,
      expectedCash: 1560.8,
      enteredDeposit: 1530,
    });
    const cash = calls.find(c => c.domain === "cash");
    expect(cash?.kind).toBe("pattern");
    expect(cash?.reason).toMatch(/short/);
    expect(cash?.cannot).toMatch(/one number/);
  });
});
