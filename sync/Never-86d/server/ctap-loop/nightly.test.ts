import { describe, expect, it } from "vitest";
import { buildNightlyReport } from "./nightly";

describe("nightly CTAP loop", () => {
  it("is ready on Buy/calendar and blocked on Gmail + OCR", () => {
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
    });
    expect(report.mailbox).toBe("communitypizza2026@gmail.com");
    expect(report.steps.find(s => s.id === "buy")?.status).toBe("ready");
    expect(report.steps.find(s => s.id === "gmail")?.status).toBe("blocked");
    expect(report.steps.find(s => s.id === "invoices")?.status).toBe("blocked");
    expect(report.steps.find(s => s.id === "calendar")?.status).toBe("hold");
    expect(report.nextHuman).toMatch(/Connect Gmail/);
    expect(report.steps.find(s => s.id === "calendar")?.detail).toMatch(/Smash Burger \$11\.99/);
  });
});
