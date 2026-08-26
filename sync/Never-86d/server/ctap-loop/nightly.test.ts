import { describe, expect, it } from "vitest";
import { closeLooksWrong } from "../integrations/ctap/close-looks-wrong";
import { buildNightlyReport } from "./nightly";

describe("nightly CTAP loop", () => {
  it("leads with close-looks-wrong, not a Gmail click", () => {
    const closeCalls = closeLooksWrong({
      businessDate: "2026-07-16",
      sales: 4645.04,
      foodSales: 2789.39,
      beerSales: 712,
      liquorSales: 642,
      popSales: 400,
      laborDollars: 1429.94,
      expectedCash: 1600.93,
      enteredDeposit: 1600,
      foodCogs: null,
      beerCogs: null,
      liquorCogs: null,
    });
    const report = buildNightlyReport({
      pdq: { businessDate: "2026-07-16", grandTotal: "4645.04", laborPct: 30.8 },
      buy: { sendCount: 18, holdCount: 39, combined: 3172.87, mykeInLoop: false },
      calendar: {
        smashPrice: "11.99",
        pizzaDay: "Thursday",
        drinkApproved: false,
        foodNamed: false,
      },
      invoicePhotos: 32,
      gmailConnected: false,
      ocrConfigured: false,
      closeCalls,
    });
    expect(report.mailbox).toBe("communitypizza2026@gmail.com");
    expect(report.steps.find(s => s.id === "buy")?.status).toBe("ready");
    expect(report.steps.find(s => s.id === "close")?.status).toBe("hold");
    expect(report.nextHuman).not.toMatch(/Connect Gmail/i);
    expect(report.nextHuman).toMatch(/Myke/);
    expect(report.nextHuman).toMatch(/both missing/);
    expect(report.steps.find(s => s.id === "calendar")?.detail).toMatch(
      /Smash Burger \$11\.99/
    );
  });
});
