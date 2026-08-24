import { ownerForCategory } from "./roles";
import type { DayOfWeek, RecurringSpecial, SpecialCategory } from "./types";

function special(input: {
  libraryId: string;
  name: string;
  category: SpecialCategory;
  dayOfWeek: DayOfWeek;
  price?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  lockedDay?: boolean;
  posterRequired?: boolean;
}): RecurringSpecial {
  return {
    id: `lib-${input.libraryId}`,
    libraryId: input.libraryId,
    name: input.name,
    category: input.category,
    owner: ownerForCategory(input.category),
    dayOfWeek: input.dayOfWeek,
    price: input.price,
    description: input.description,
    startTime: input.startTime,
    endTime: input.endTime,
    recurring: true,
    approved: true,
    approvedBy: "myke",
    posterRequired: input.posterRequired ?? false,
    lockedDay: input.lockedDay ?? false,
  };
}

/**
 * Recurring Specials Library.
 * Edit once here; every future month uses the new version.
 * Thursday medium pizza stays Thursday.
 */
export const DEFAULT_RECURRING_LIBRARY: RecurringSpecial[] = [
  special({
    libraryId: "sunday-gameday",
    name: "NFL / game-day",
    category: "programming",
    dayOfWeek: "sunday",
    description: "Sunday NFL / game-day programming",
  }),
  special({
    libraryId: "monday-current",
    name: "Monday food/drink specials",
    category: "food",
    dayOfWeek: "monday",
    description: "Current Monday food/drink specials — Tom + Kenzy fill names",
  }),
  special({
    libraryId: "tuesday-smashburger",
    name: "Smash Burger",
    category: "food",
    dayOfWeek: "tuesday",
    price: "8.99",
    description: "BOGO second Smash Burger $8.99 with side",
    posterRequired: true,
  }),
  special({
    libraryId: "wednesday-current",
    name: "Wednesday specials",
    category: "food",
    dayOfWeek: "wednesday",
    description: "Current Wednesday specials",
  }),
  special({
    libraryId: "thursday-medium-pizza",
    name: "Any Medium Pizza",
    category: "food",
    dayOfWeek: "thursday",
    price: "17.99",
    description: "Any medium pizza $17.99",
    lockedDay: true,
    posterRequired: true,
  }),
  special({
    libraryId: "friday-ribs",
    name: "Half-rack ribs",
    category: "food",
    dayOfWeek: "friday",
    price: "17.99",
    description: "Half-rack ribs dinner $17.99",
    posterRequired: true,
  }),
  special({
    libraryId: "late-night-apps",
    name: "$6.99 appetizer flash",
    category: "food",
    dayOfWeek: "friday",
    price: "6.99",
    startTime: "21:00",
    endTime: "24:00",
    description: "Friday + Saturday late night 9 PM–midnight",
  }),
  special({
    libraryId: "saturday-college",
    name: "College football / Iowa game-day",
    category: "programming",
    dayOfWeek: "saturday",
    description: "College football / Iowa game-day programming",
  }),
];

export const PROMOTION_RULES = [
  "thursday_medium_pizza_stays_thursday",
  "edit_recurring_library_once",
  "never_invent_unapproved_promotion",
  "never_email_humes_without_myke_approval",
  "football_games_are_not_promotions",
  "ignore_internet_holidays",
  "monday_thursday_football_promos_not_created",
] as const;

export function specialsForDay(
  library: RecurringSpecial[],
  dayOfWeek: DayOfWeek
): RecurringSpecial[] {
  const onDay = library.filter((item) => item.dayOfWeek === dayOfWeek);
  if (dayOfWeek === "saturday") {
    const flash = library.find((item) => item.libraryId === "late-night-apps");
    if (flash && !onDay.some((item) => item.libraryId === flash.libraryId)) {
      return [...onDay, { ...flash, dayOfWeek: "saturday" }];
    }
  }
  return onDay;
}

export function assertPizzaStaysThursday(special: RecurringSpecial): void {
  if (
    special.libraryId === "thursday-medium-pizza" &&
    special.dayOfWeek !== "thursday"
  ) {
    throw new Error("Thursday medium pizza stays Thursday");
  }
}

export function updateLibrary(
  library: RecurringSpecial[],
  libraryId: string,
  patch: Partial<RecurringSpecial>
): RecurringSpecial[] {
  return library.map((item) => {
    if (item.libraryId !== libraryId) return item;
    const next = { ...item, ...patch, libraryId: item.libraryId };
    if (item.lockedDay) next.dayOfWeek = item.dayOfWeek;
    assertPizzaStaysThursday(next);
    return next;
  });
}
