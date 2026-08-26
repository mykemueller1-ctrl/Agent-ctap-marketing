import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DEFAULT_RECURRING_LIBRARY } from "../../sync/Never-86d/server/calendar/library";
import {
  assertPizzaStaysThursday,
  buildCalendarInsights,
  smashBurger,
  thursdayPizza,
  type CalendarSeed,
} from "./calendarMonth";

const seed = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../public/data/ctap-calendar.json"),
    "utf8"
  )
) as CalendarSeed;

describe("September calendar seat", () => {
  it("does not invent Tom's food or a football promo, and does not email Humes", () => {
    const insights = buildCalendarInsights(seed);
    expect(insights.some(i => i.title.includes("food special"))).toBe(true);
    expect(insights.some(i => /NOT CREATED/i.test(i.detail))).toBe(true);
    expect(insights.some(i => /unsent/i.test(i.title))).toBe(true);
  });

  it("locks Smash Burger at $11.99 and Thursday pizza on Thursday", () => {
    expect(smashBurger(seed)).toMatchObject({ day: "Tuesday", price: "11.99" });
    expect(thursdayPizza(seed)).toMatchObject({
      day: "Thursday",
      price: "17.99",
      locked: true,
      goesUp: true,
    });
    expect(assertPizzaStaysThursday(seed)).toEqual([]);
    const insights = buildCalendarInsights(seed);
    expect(insights.some(i => /Smash Burger is \$11\.99/i.test(i.title))).toBe(true);
    expect(insights.some(i => /GOES UP Thursday/i.test(i.title))).toBe(true);
  });

  it("matches the engine library so the other chat cannot drift", () => {
    const smash = DEFAULT_RECURRING_LIBRARY.find(item => item.libraryId === "tuesday-smashburger");
    const pizza = DEFAULT_RECURRING_LIBRARY.find(item => item.libraryId === "thursday-medium-pizza");
    expect(smash?.price).toBe(smashBurger(seed)?.price);
    expect(pizza?.dayOfWeek).toBe("thursday");
    expect(pizza?.lockedDay).toBe(true);
    expect(pizza?.description).toMatch(/GOES UP Thursday/i);
  });
});
