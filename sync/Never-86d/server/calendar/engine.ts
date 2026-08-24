import {
  eachDateInMonth,
  monthKey,
  monthLabel,
  nextMonthKey,
  parseMonthKey,
  weekdayOn,
  dayOfMonth,
} from "./dates";
import {
  assertNotInventedFootballPromo,
  footballPromoDecisionsOpen,
  planningSports,
} from "./football";
import { datesWeShouldCareAbout, holidayCandidatesForMonth } from "./holidays";
import { specialsForDay, updateLibrary } from "./library";
import { canManagerApprove, canReleaseHumes } from "./roles";
import {
  getMonth,
  saveMonth,
  snapshotHash,
  type CalendarStore,
} from "./store";
import type {
  ApprovalAction,
  ApprovalPacket,
  CalendarDay,
  CalendarMonth,
  CalendarStatus,
  CompletenessGap,
  CtapEvent,
  HumesEmail,
  MonthlySpecial,
  RecurringSpecial,
  RoleId,
  SportsEvent,
  TickResult,
} from "./types";

export const HUMES_RECIPIENT = "humes-calendar@example.test";

const MANAGER_SIDES: RoleId[] = ["tom", "kenzy"];

function cloneLibrary(store: CalendarStore): RecurringSpecial[] {
  return store.library.map((item) => ({ ...item }));
}

function completeness(month: Omit<CalendarMonth, "completenessPct" | "gaps">): {
  pct: number;
  gaps: CompletenessGap[];
} {
  const gaps: CompletenessGap[] = [];
  if (!month.monthlyFood) {
    gaps.push({
      field: "Monthly food special",
      owner: "tom",
      detail: "Tom still needs to lock the monthly food feature",
    });
  }
  if (!month.monthlyDrink) {
    gaps.push({
      field: "Monthly drink special",
      owner: "kenzy",
      detail: "Kenzy still needs to lock the monthly drink feature",
    });
  }
  for (const promoId of footballPromoDecisionsOpen()) {
    if (month.footballPromoDecisions[promoId] !== "open") continue;
    gaps.push({
      field: promoId === "monday_night_football_promo"
        ? "Monday Night Football decision"
        : "Thursday Night Football decision",
      owner: "kenzy",
      detail: "Football promo is NOT CREATED — decide, do not invent",
    });
  }
  const awaiting = month.events.filter(
    (item) => item.status === "AWAITING_CONFIRMATION"
  );
  for (const event of awaiting) {
    gaps.push({
      field: `Event: ${event.eventName}`,
      owner: event.owner,
      detail: "1 event awaiting confirmation",
    });
  }
  const checks = 5;
  const missing = [
    !month.monthlyFood,
    !month.monthlyDrink,
    month.footballPromoDecisions.monday_night_football_promo === "open",
    month.footballPromoDecisions.thursday_night_football_promo === "open",
    awaiting.length > 0,
  ].filter(Boolean).length;
  const pct = Math.round(((checks - missing) / checks) * 100);
  return { pct, gaps };
}

function assembleDays(input: {
  year: number;
  month: number;
  recurring: RecurringSpecial[];
  monthly: MonthlySpecial[];
  events: CtapEvent[];
  holidays: CalendarMonth["holidays"];
  sports: SportsEvent[];
}): CalendarDay[] {
  return eachDateInMonth(input.year, input.month).map((date) => {
    const dayOfWeek = weekdayOn(date);
    const confirmed = input.events.filter(
      (item) => item.date === date && item.status === "CONFIRMED"
    );
    const sports = input.sports.filter((item) => item.date === date);
    return {
      date,
      dayOfWeek,
      recurring: specialsForDay(input.recurring, dayOfWeek),
      monthly: input.monthly.filter((item) => {
        if (item.availableDates?.length) return item.availableDates.includes(date);
        return true;
      }),
      events: confirmed,
      holidays: input.holidays.filter((item) => item.date === date),
      sports,
      planningOnly: planningSports(sports),
    };
  });
}

function stamp(store: CalendarStore, month: CalendarMonth): CalendarMonth {
  const scored = completeness(month);
  month.gaps = scored.gaps;
  month.completenessPct = scored.pct;
  return saveMonth(store, month);
}

export function createNextMonthCalendar(
  store: CalendarStore,
  asOf: string,
  extras: {
    monthlyFood?: MonthlySpecial;
    monthlyDrink?: MonthlySpecial;
    events?: CtapEvent[];
    sports?: SportsEvent[];
  } = {}
): CalendarMonth {
  const key = nextMonthKey(asOf);
  const existing = store.months.get(key);
  if (existing) return existing;

  const { year, month } = parseMonthKey(key);
  const recurring = cloneLibrary(store);
  const monthly = [extras.monthlyFood, extras.monthlyDrink].filter(
    (item): item is MonthlySpecial => Boolean(item)
  );
  const events = extras.events ?? [];
  const sports = extras.sports ?? [];
  const holidays = datesWeShouldCareAbout(
    holidayCandidatesForMonth(year, month)
  );
  const draft: CalendarMonth = {
    id: `cal-${key}`,
    monthKey: key,
    label: monthLabel(year, month),
    targetYear: year,
    targetMonth: month,
    status: "DRAFT",
    locked: false,
    days: [],
    recurring,
    monthlyFood: extras.monthlyFood,
    monthlyDrink: extras.monthlyDrink,
    events,
    holidays,
    sports,
    footballPromoDecisions: {
      monday_night_football_promo: "open",
      thursday_night_football_promo: "open",
    },
    gaps: [],
    completenessPct: 0,
    version: 1,
    exceptions: [],
    createdAt: `${asOf}T00:00:00Z`,
  };
  draft.days = assembleDays({
    year,
    month,
    recurring,
    monthly,
    events,
    holidays,
    sports,
  });
  const scored = completeness(draft);
  draft.gaps = scored.gaps;
  draft.completenessPct = scored.pct;
  return saveMonth(store, draft);
}

export function setMonthlySpecial(
  store: CalendarStore,
  monthKeyValue: string,
  special: MonthlySpecial
): CalendarMonth {
  const month = getMonth(store, monthKeyValue);
  if (month.locked && !month.exceptions.includes(special.id)) {
    throw new Error("Month is locked except explicit exceptions");
  }
  assertNotInventedFootballPromo(special);
  if (special.kind === "food") {
    month.monthlyFood = { ...special, owner: "tom", category: "food" };
  } else {
    month.monthlyDrink = { ...special, owner: "kenzy", category: "drink" };
  }
  month.days = assembleDays({
    year: month.targetYear,
    month: month.targetMonth,
    recurring: month.recurring,
    monthly: [month.monthlyFood, month.monthlyDrink].filter(
      (item): item is MonthlySpecial => Boolean(item)
    ),
    events: month.events,
    holidays: month.holidays,
    sports: month.sports,
  });
  month.version += 1;
  return stamp(store, month);
}

export function confirmEvent(
  store: CalendarStore,
  monthKeyValue: string,
  eventId: string
): CalendarMonth {
  const month = getMonth(store, monthKeyValue);
  month.events = month.events.map((item) =>
    item.id === eventId ? { ...item, status: "CONFIRMED" } : item
  );
  month.days = assembleDays({
    year: month.targetYear,
    month: month.targetMonth,
    recurring: month.recurring,
    monthly: [month.monthlyFood, month.monthlyDrink].filter(
      (item): item is MonthlySpecial => Boolean(item)
    ),
    events: month.events,
    holidays: month.holidays,
    sports: month.sports,
  });
  month.version += 1;
  return stamp(store, month);
}

export function decideFootballPromo(
  store: CalendarStore,
  monthKeyValue: string,
  window: "monday_night_football_promo" | "thursday_night_football_promo",
  decision: "none" | "approved",
  actor: RoleId
): CalendarMonth {
  if (actor !== "kenzy" && actor !== "myke") {
    throw new Error("Kenzy (bar) or Myke decides football promotions");
  }
  if (decision === "approved") {
    throw new Error(
      "Football promotions are NOT CREATED. Record none, or add an approved promotion separately — do not invent $2 beers"
    );
  }
  const month = getMonth(store, monthKeyValue);
  month.footballPromoDecisions[window] = decision;
  month.version += 1;
  return stamp(store, month);
}

export function editRecurringLibrary(
  store: CalendarStore,
  libraryId: string,
  patch: Partial<RecurringSpecial>
): RecurringSpecial[] {
  store.library = updateLibrary(store.library, libraryId, patch);
  for (const month of store.months.values()) {
    if (month.status === "SENT_TO_HUMES") continue;
    month.recurring = cloneLibrary(store);
    month.days = assembleDays({
      year: month.targetYear,
      month: month.targetMonth,
      recurring: month.recurring,
      monthly: [month.monthlyFood, month.monthlyDrink].filter(
        (item): item is MonthlySpecial => Boolean(item)
      ),
      events: month.events,
      holidays: month.holidays,
      sports: month.sports,
    });
    month.version += 1;
    stamp(store, month);
  }
  return store.library;
}

function managerReady(month: CalendarMonth): boolean {
  const foodOk = !month.monthlyFood || month.monthlyFood.approved;
  const drinkOk = !month.monthlyDrink || month.monthlyDrink.approved;
  return foodOk && drinkOk && Boolean(month.monthlyFood) && Boolean(month.monthlyDrink);
}

export function submitManagerReview(
  store: CalendarStore,
  monthKeyValue: string,
  actor: RoleId,
  category: "food" | "drink"
): CalendarMonth {
  if (!MANAGER_SIDES.includes(actor)) {
    throw new Error("Only Kenzy (bar) and Tom (kitchen) submit manager review");
  }
  if (!canManagerApprove(actor, category)) {
    throw new Error(
      actor === "kenzy"
        ? "Kenzy reviews bar/drink specials only"
        : "Tom reviews kitchen/food specials only"
    );
  }
  const month = getMonth(store, monthKeyValue);
  if (category === "food") {
    if (!month.monthlyFood) throw new Error("No monthly food special to approve");
    month.monthlyFood = {
      ...month.monthlyFood,
      approved: true,
      approvedBy: "tom",
    };
  } else {
    if (!month.monthlyDrink) throw new Error("No monthly drink special to approve");
    month.monthlyDrink = {
      ...month.monthlyDrink,
      approved: true,
      approvedBy: "kenzy",
    };
  }
  const nextStatus: CalendarStatus = managerReady(month)
    ? "MYKE_REVIEW"
    : "MANAGER_REVIEW";
  month.status = nextStatus;
  month.version += 1;
  store.approvals.push({
    monthId: month.id,
    action: "APPROVE",
    actor,
    at: new Date().toISOString(),
  });
  return stamp(store, month);
}

export function lockMonth(
  store: CalendarStore,
  monthKeyValue: string,
  exceptions: string[] = []
): CalendarMonth {
  const month = getMonth(store, monthKeyValue);
  month.locked = true;
  month.exceptions = exceptions;
  month.version += 1;
  return stamp(store, month);
}

export function changedSpecials(
  current: RecurringSpecial[],
  previous?: RecurringSpecial[]
): string[] {
  if (!previous) return [];
  const before = new Map(previous.map((item) => [item.libraryId, item]));
  return current
    .filter((item) => {
      const old = before.get(item.libraryId);
      if (!old) return true;
      return old.name !== item.name || old.price !== item.price || old.dayOfWeek !== item.dayOfWeek;
    })
    .map((item) => item.name);
}

export function buildFinalApprovalPacket(
  store: CalendarStore,
  monthKeyValue: string
): ApprovalPacket {
  const month = getMonth(store, monthKeyValue);
  const priorKey = previousMonthKey(month.monthKey);
  const prior = store.months.get(priorKey);
  return {
    subject: `${month.label.split(" ")[0].toUpperCase()} CALENDAR — FINAL APPROVAL`,
    monthLabel: month.label,
    preview: month.days,
    foodSpecial: month.monthlyFood,
    drinkSpecial: month.monthlyDrink,
    holidays: month.holidays,
    events: month.events,
    weeklyPromotions: month.recurring,
    prices: [...month.recurring, month.monthlyFood, month.monthlyDrink]
      .filter((item): item is RecurringSpecial | MonthlySpecial => Boolean(item))
      .map((item) => ({ name: item.name, price: item.price })),
    changedSpecials: changedSpecials(month.recurring, prior?.recurring),
    buttons: ["APPROVE", "EDIT", "HOLD"],
    gaps: month.gaps,
  };
}

function previousMonthKey(key: string): string {
  const { year, month } = parseMonthKey(key);
  const date = new Date(Date.UTC(year, month - 2, 1));
  return monthKey(date.getUTCFullYear(), date.getUTCMonth() + 1);
}

export function applyMykeDecision(
  store: CalendarStore,
  monthKeyValue: string,
  action: ApprovalAction
): CalendarMonth {
  const month = getMonth(store, monthKeyValue);
  if (month.status !== "MYKE_REVIEW" && action === "APPROVE") {
    throw new Error("Myke can only approve after Kenzy and Tom finish manager review");
  }
  store.approvals.push({
    monthId: month.id,
    action,
    actor: "myke",
    at: new Date().toISOString(),
  });
  if (action === "APPROVE") {
    month.status = "APPROVED";
  } else if (action === "EDIT") {
    month.status = "DRAFT";
    month.locked = false;
  } else {
    month.status = "MYKE_REVIEW";
  }
  month.version += 1;
  return stamp(store, month);
}

export function buildHumesEmail(month: CalendarMonth): HumesEmail {
  const lines = [
    `CTAP — ${month.label} Calendar`,
    `Status: ${month.status}`,
    "",
    `Monthly food (Tom): ${month.monthlyFood?.name ?? "(none)"} ${month.monthlyFood?.price ?? ""}`.trim(),
    `Monthly drink (Kenzy): ${month.monthlyDrink?.name ?? "(none)"} ${month.monthlyDrink?.price ?? ""}`.trim(),
    "",
    "Weekly specials:",
    ...month.recurring.map(
      (item) =>
        `- ${item.dayOfWeek}: ${item.name}${item.price ? ` $${item.price}` : ""}`
    ),
    "",
    "Events:",
    ...month.events
      .filter((item) => item.status === "CONFIRMED")
      .map((item) => `- ${item.date} ${item.eventName} ${item.startTime ?? ""}`.trim()),
    "",
    "Dates we should care about:",
    ...month.holidays.map((item) => `- ${item.date} ${item.name} (${item.classification})`),
  ];
  const body = lines.join("\n");
  return {
    subject: `CTAP — ${month.label} Calendar`,
    recipient: HUMES_RECIPIENT,
    body,
    attachmentHash: snapshotHash(month),
    calendarVersion: month.version,
  };
}

export function sendHumesEmailIfApproved(
  store: CalendarStore,
  monthKeyValue: string,
  actor: RoleId = "myke"
): HumesEmail {
  const month = getMonth(store, monthKeyValue);
  if (!canReleaseHumes(actor)) {
    throw new Error("Only Myke can release the Humes calendar email");
  }
  if (month.status !== "APPROVED") {
    throw new Error("Never email Humes until the calendar is APPROVED");
  }
  const email = buildHumesEmail(month);
  month.status = "SENT_TO_HUMES";
  month.version += 1;
  stamp(store, month);
  store.emails.push({
    sentAt: new Date().toISOString(),
    recipient: email.recipient,
    calendarVersion: email.calendarVersion,
    sentBy: actor,
    approvalBy: "myke",
    attachmentHash: email.attachmentHash,
    subject: email.subject,
  });
  return email;
}

export function internalNotice(month: CalendarMonth): string {
  const missing = month.gaps.map((gap) => gap.field);
  const unique = [...new Set(missing)];
  return `${month.label.split(" ")[0]} calendar is ${month.completenessPct}% complete. Missing: ${unique.join(", ") || "nothing"}.`;
}

export function runMonthlyTick(
  store: CalendarStore,
  asOf: string,
  extras?: Parameters<typeof createNextMonthCalendar>[2]
): TickResult {
  const day = dayOfMonth(asOf);
  const targetKey = nextMonthKey(asOf);

  if (day === 1) {
    const month = createNextMonthCalendar(store, asOf, extras);
    return { phase: "create", month };
  }

  const month = store.months.get(targetKey);
  if (!month) {
    return { phase: "idle", blocked: `No ${targetKey} calendar yet — create on the 1st` };
  }

  if (day === 10) {
    return { phase: "notice", month, notice: internalNotice(month) };
  }
  if (day === 13) {
    return { phase: "lock", month: lockMonth(store, targetKey) };
  }
  if (day === 14) {
    return {
      phase: "approval",
      month,
      packet: buildFinalApprovalPacket(store, targetKey),
    };
  }
  if (day === 15) {
    if (month.status !== "APPROVED") {
      return {
        phase: "humes",
        month,
        blocked: "On the 15th: not approved — do not generate the Humes email",
      };
    }
    return {
      phase: "humes",
      month,
      email: sendHumesEmailIfApproved(store, targetKey, "myke"),
    };
  }
  return { phase: "idle", month };
}
