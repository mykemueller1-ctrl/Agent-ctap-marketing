import type { SportsEvent } from "./types";

export const FOOTBALL_WINDOWS = [
  "iowa",
  "iowa_state",
  "college",
  "nfl",
  "sunday",
  "monday_night",
  "thursday_night",
] as const;

export const FOOTBALL_PROMOS_NOT_CREATED = [
  "monday_night_football_promo",
  "thursday_night_football_promo",
] as const;

const INVENTED_PROMO = /\$\s*2\s*beers?|football promo/i;

/**
 * Games may land on the planning screen.
 * They are not promotions and cannot invent drink specials.
 */
export function planningSports(events: SportsEvent[]): SportsEvent[] {
  return [...events];
}

export function assertNotInventedFootballPromo(input: {
  name: string;
  approved: boolean;
}): void {
  if (INVENTED_PROMO.test(input.name) && !input.approved) {
    throw new Error(
      "Cannot invent a football promotion unless management has approved it"
    );
  }
}

export function footballPromoDecisionsOpen(): string[] {
  return [...FOOTBALL_PROMOS_NOT_CREATED];
}
