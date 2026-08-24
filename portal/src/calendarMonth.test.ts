import { describe, expect, it } from "vitest";
import { buildCalendarInsights, type CalendarSeed } from "./calendarMonth";

const seed: CalendarSeed = {
  monthKey: "2026-09",
  monthLabel: "September 2026",
  status: "DRAFT",
  humesRule: "Only Myke can release the Humes email. Status is DRAFT. Do not send.",
  drink: { name: "Apple Cider Mimosas", owner: "Kenzy", approved: false },
  food: { name: null, owner: "Tom", approved: false },
  events: [{ name: "Stadium Drive", date: "2026-09-25", status: "AWAITING_CONFIRMATION" }],
  football: {
    planningOnly: true,
    promosCreated: false,
    games: [{ label: "NFL — Eagles vs. Cowboys — 7:00 PM", date: "2026-09-13" }],
  },
};

describe("September calendar seat", () => {
  it("does not invent Tom's food or a football promo, and does not email Humes", () => {
    const insights = buildCalendarInsights(seed);
    expect(insights.some(i => i.title.includes("food special"))).toBe(true);
    expect(insights.some(i => /NOT CREATED/i.test(i.detail))).toBe(true);
    expect(insights.some(i => /unsent/i.test(i.title))).toBe(true);
  });
});
