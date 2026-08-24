import { ownerForCategory } from "./roles";
import type { CtapEvent, MonthlySpecial, SportsEvent } from "./types";

export function september2026Drink(): MonthlySpecial {
  return {
    id: "sep-2026-drink",
    monthKey: "2026-09",
    kind: "drink",
    name: "Apple Cider Mimosas",
    category: "drink",
    owner: ownerForCategory("drink"),
    description: "September monthly drink — fall/local. Kenzy owns glassware/garnish.",
    glassware: "flute",
    garnish: "apple slice",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    recurring: false,
    approved: false,
    posterRequired: true,
    beverageCost: undefined,
    marginTarget: "20",
  };
}

export function stadiumDriveEvent(): CtapEvent {
  return {
    id: "evt-stadium-drive-2026-09-25",
    eventName: "Stadium Drive",
    date: "2026-09-25",
    startTime: "20:00",
    endTime: "23:00",
    status: "AWAITING_CONFIRMATION",
    owner: "myke",
  };
}

export function sampleSportsFeed(): SportsEvent[] {
  return [
    {
      id: "sport-nfl-sun-example",
      league: "nfl",
      label: "NFL — Eagles vs. Cowboys — 7:00 PM",
      date: "2026-09-13",
      startTime: "19:00",
      window: "sunday",
    },
  ];
}

export function september2026BuildInput() {
  return {
    monthlyDrink: september2026Drink(),
    events: [stadiumDriveEvent()],
    sports: sampleSportsFeed(),
  };
}

export const APPLE_CIDER_MIMOSA_PERFORMANCE = {
  specialId: "sep-2026-drink",
  name: "Apple Cider Mimosas",
  monthKey: "2026-09",
  salesUnits: 286,
  revenue: 2288,
  cogs: 412,
  grossProfit: 1876,
  peakDay: "sunday" as const,
  bestHour: "11 AM – 1 PM",
  peakSharePct: 41,
};
