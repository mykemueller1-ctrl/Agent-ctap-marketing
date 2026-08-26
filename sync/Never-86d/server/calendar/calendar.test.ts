import { describe, expect, it } from "vitest";
import {
  APPLE_CIDER_MIMOSA_PERFORMANCE,
  BAR_ROSTER,
  BAR_WEEK_SHIFTS,
  DATABASE_OBJECTS,
  DEFAULT_RECURRING_LIBRARY,
  KENZY,
  KITCHEN_ROSTER,
  LEARN_LOOP,
  PAYROLL_ACCOUNTANT,
  TOM,
  applyMykeDecision,
  assertNotInventedFootballPromo,
  buildFinalApprovalPacket,
  classifyHoliday,
  confirmEvent,
  createNextMonthCalendar,
  createStore,
  decideFootballPromo,
  editRecurringLibrary,
  internalNotice,
  laborDay,
  lockMonth,
  namesOnPayroll,
  peopleAt,
  recommendNextYear,
  runMonthlyTick,
  sendHumesEmailIfApproved,
  september2026BuildInput,
  setMonthlySpecial,
  specialsForDay,
  submitManagerReview,
} from "./index";
import type { MonthlySpecial } from "./types";

function septemberFood(): MonthlySpecial {
  return {
    id: "sep-2026-food",
    monthKey: "2026-09",
    kind: "food",
    name: "September food feature",
    category: "food",
    owner: "tom",
    description: "Tom locks the monthly food feature",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    recurring: false,
    approved: false,
    posterRequired: true,
    foodCost: undefined,
    marginTarget: "30",
  };
}

function buildSeptember() {
  const store = createStore();
  const month = createNextMonthCalendar(
    store,
    "2026-08-01",
    september2026BuildInput()
  );
  return { store, month };
}

describe("CTAP monthly calendar engine", () => {
  it("assigns Kenzy to bar and Tom to kitchen", () => {
    expect(KENZY.side).toBe("bar");
    expect(KENZY.title).toBe("Out front");
    expect(TOM.side).toBe("kitchen");
    expect(TOM.title).toBe("Kitchen manager");
    expect(BAR_ROSTER.some((person) => person.name === "Kenzy Thompson")).toBe(
      true
    );
    expect(KITCHEN_ROSTER.some((person) => person.name === "Thomas Dorothy")).toBe(
      true
    );
    expect(peopleAt("bar").length).toBeGreaterThanOrEqual(7);
    expect(namesOnPayroll()).toContain("Kenzy Thompson");
    expect(namesOnPayroll()).toContain("Moe Thomas");
    expect(PAYROLL_ACCOUNTANT.email).toBe("cfmapayroll@yahoo.com");
    expect(
      BAR_WEEK_SHIFTS.some(
        (shift) =>
          shift.name === "Kenzy Thompson" && shift.date === "2026-08-30"
      )
    ).toBe(true);
    expect(DATABASE_OBJECTS).toContain("calendar_email_log");
    expect(LEARN_LOOP).toEqual([
      "plan",
      "execute",
      "measure",
      "learn",
      "recommend",
    ]);
  });

  it("keeps Thursday medium pizza on Thursday and copies late-night apps to Saturday", () => {
    const thursdayPizza = specialsForDay(DEFAULT_RECURRING_LIBRARY, "thursday").find(
      (item) => item.libraryId === "thursday-medium-pizza"
    );
    expect(thursdayPizza?.name).toBe("Any Medium Pizza");
    expect(thursdayPizza?.description).toMatch(/GOES UP Thursday/i);
    expect(
      specialsForDay(DEFAULT_RECURRING_LIBRARY, "wednesday").some(
        (item) => item.libraryId === "thursday-medium-pizza"
      )
    ).toBe(false);
    expect(
      specialsForDay(DEFAULT_RECURRING_LIBRARY, "saturday").some(
        (item) => item.libraryId === "late-night-apps"
      )
    ).toBe(true);
    expect(
      specialsForDay(DEFAULT_RECURRING_LIBRARY, "tuesday").find(
        (item) => item.libraryId === "tuesday-smashburger"
      )?.price
    ).toBe("11.99");

    const store = createStore();
    editRecurringLibrary(store, "thursday-medium-pizza", {
      dayOfWeek: "wednesday",
      price: "16.99",
    });
    const pizza = store.library.find((item) => item.libraryId === "thursday-medium-pizza");
    expect(pizza?.dayOfWeek).toBe("thursday");
    expect(pizza?.price).toBe("16.99");
  });

  it("builds September 2026 from the Aug 1 tick with Kenzy drink and open Tom food", () => {
    const { month } = buildSeptember();
    expect(month.monthKey).toBe("2026-09");
    expect(month.label).toBe("September 2026");
    expect(month.status).toBe("DRAFT");
    expect(month.monthlyDrink?.name).toBe("Apple Cider Mimosas");
    expect(month.monthlyDrink?.owner).toBe("kenzy");
    expect(month.monthlyFood).toBeUndefined();
    expect(laborDay(2026)).toBe("2026-09-07");
    expect(month.holidays.some((item) => item.name === "Labor Day")).toBe(true);
    expect(month.days).toHaveLength(30);

    const thursday = month.days.find((day) => day.date === "2026-09-03");
    expect(thursday?.recurring.some((item) => item.name === "Any Medium Pizza")).toBe(
      true
    );
    const friday = month.days.find((day) => day.date === "2026-09-25");
    expect(friday?.events).toHaveLength(0);
    expect(friday?.recurring.some((item) => item.name === "Half-rack ribs")).toBe(true);
  });

  it("puts football on the planning screen and refuses invented $2 beer promos", () => {
    const { month } = buildSeptember();
    const sunday = month.days.find((day) => day.date === "2026-09-13");
    expect(sunday?.planningOnly[0]?.label).toMatch(/Eagles vs\. Cowboys/);
    expect(
      sunday?.recurring.some((item) => /\$2 beers/i.test(item.name))
    ).toBe(false);
    expect(() =>
      assertNotInventedFootballPromo({
        name: "$2 beers for Thursday Night Football",
        approved: false,
      })
    ).toThrow(/Cannot invent a football promotion/);
  });

  it("classifies Labor Day as MUST USE and internet holidays as IGNORE", () => {
    expect(classifyHoliday("Labor Day")).toBe("MUST_USE");
    expect(classifyHoliday("National Whatever Day")).toBe("IGNORE");
    expect(classifyHoliday("First day of fall")).toBe("CONSIDER");
  });

  it("sends the 10th notice with Tom's missing food and open football decisions", () => {
    const store = createStore();
    runMonthlyTick(store, "2026-08-01", september2026BuildInput());
    const tick = runMonthlyTick(store, "2026-08-10");
    expect(tick.notice).toMatch(/September calendar is \d+% complete/);
    expect(tick.notice).toMatch(/Monthly food special/);
    expect(tick.notice).toMatch(/Thursday Night Football decision/);
    expect(tick.notice).toMatch(/Stadium Drive/);
  });

  it("locks on the 13th except explicit exceptions", () => {
    const { store, month } = buildSeptember();
    lockMonth(store, month.monthKey);
    expect(() =>
      setMonthlySpecial(store, month.monthKey, septemberFood())
    ).toThrow(/locked/);
    lockMonth(store, month.monthKey, [septemberFood().id]);
    const updated = setMonthlySpecial(store, month.monthKey, septemberFood());
    expect(updated.monthlyFood?.owner).toBe("tom");
  });

  it("confirms Stadium Drive onto the calendar", () => {
    const { store, month } = buildSeptember();
    confirmEvent(store, month.monthKey, "evt-stadium-drive-2026-09-25");
    const friday = getDay(store, "2026-09-25");
    expect(friday.events[0]?.eventName).toBe("Stadium Drive");
    expect(friday.events[0]?.startTime).toBe("20:00");
    expect(friday.events[0]?.endTime).toBe("23:00");
  });

  it("requires Tom then Kenzy before Myke, and never emails Humes early", () => {
    const { store, month } = buildSeptember();
    expect(() =>
      submitManagerReview(store, month.monthKey, "kenzy", "food")
    ).toThrow(/Kenzy reviews bar\/drink/);
    expect(() =>
      applyMykeDecision(store, month.monthKey, "APPROVE")
    ).toThrow(/manager review/);
    expect(() => sendHumesEmailIfApproved(store, month.monthKey, "kenzy")).toThrow(
      /Only Myke/
    );
    expect(() => sendHumesEmailIfApproved(store, month.monthKey, "myke")).toThrow(
      /Never email Humes/
    );

    setMonthlySpecial(store, month.monthKey, septemberFood());
    submitManagerReview(store, month.monthKey, "tom", "food");
    expect(store.months.get(month.monthKey)?.status).toBe("MANAGER_REVIEW");
    submitManagerReview(store, month.monthKey, "kenzy", "drink");
    expect(store.months.get(month.monthKey)?.status).toBe("MYKE_REVIEW");

    const packet = buildFinalApprovalPacket(store, month.monthKey);
    expect(packet.subject).toBe("SEPTEMBER CALENDAR — FINAL APPROVAL");
    expect(packet.buttons).toEqual(["APPROVE", "EDIT", "HOLD"]);
    expect(packet.drinkSpecial?.name).toBe("Apple Cider Mimosas");
    expect(packet.foodSpecial?.owner).toBe("tom");

    applyMykeDecision(store, month.monthKey, "HOLD");
    expect(store.months.get(month.monthKey)?.status).toBe("MYKE_REVIEW");
    applyMykeDecision(store, month.monthKey, "APPROVE");

    const fifteenth = runMonthlyTick(store, "2026-08-15");
    expect(fifteenth.email?.subject).toBe("CTAP — September 2026 Calendar");
    expect(fifteenth.email?.body).toMatch(/THURSDAY GOES UP: Any Medium Pizza \$17\.99 all day/);
    expect(fifteenth.email?.body).not.toMatch(/wednesday: Any Medium Pizza/i);
    expect(store.emails[0]?.approvalBy).toBe("myke");
    expect(store.emails[0]?.attachmentHash).toHaveLength(64);
    expect(store.months.get(month.monthKey)?.status).toBe("SENT_TO_HUMES");
  });

  it("lets Kenzy record no football promo instead of inventing one", () => {
    const { store, month } = buildSeptember();
    expect(() =>
      decideFootballPromo(
        store,
        month.monthKey,
        "thursday_night_football_promo",
        "approved",
        "kenzy"
      )
    ).toThrow(/NOT CREATED/);
    decideFootballPromo(
      store,
      month.monthKey,
      "thursday_night_football_promo",
      "none",
      "kenzy"
    );
    const notice = internalNotice(store.months.get(month.monthKey)!);
    expect(notice).not.toMatch(/Thursday Night Football decision/);
  });

  it("recommends bringing Apple Cider Mimosas back from last year's results", () => {
    expect(recommendNextYear(APPLE_CIDER_MIMOSA_PERFORMANCE)).toMatch(
      /Bring Apple Cider Mimosas back for September/
    );
    expect(recommendNextYear(APPLE_CIDER_MIMOSA_PERFORMANCE)).toMatch(/1,876\.00/);
    expect(recommendNextYear(APPLE_CIDER_MIMOSA_PERFORMANCE)).toMatch(/41%/);
  });

  it("propagates a library edit into a draft month", () => {
    const { store } = buildSeptember();
    editRecurringLibrary(store, "tuesday-smashburger", { price: "9.49" });
    const tuesday = getDay(store, "2026-09-01");
    expect(
      tuesday.recurring.find((item) => item.libraryId === "tuesday-smashburger")?.price
    ).toBe("9.49");
  });
});

function getDay(store: ReturnType<typeof createStore>, date: string) {
  const month = store.months.get(date.slice(0, 7));
  const day = month?.days.find((item) => item.date === date);
  if (!day) throw new Error(`missing ${date}`);
  return day;
}
