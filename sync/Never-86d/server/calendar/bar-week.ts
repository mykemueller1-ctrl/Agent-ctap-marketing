/** Posted paper week: Sun 8/30/2026 – Sat 9/5/2026. Kenzy owns out front. */

export type Shift = {
  name: string;
  date: string;
  start: string;
  end: string;
  station: string;
  note?: string;
};

export const BAR_WEEK_KEY = "2026-08-30";
export const BAR_WEEK_SOURCE = "paper-posted-week";

/** Paper tokens: W waitress, B bar, P pizza, O = first cut (OPEN), CL = close, R/O = requested off. */
export const PAPER_STATION = {
  W: "WAITRESS",
  B: "BAR SIDE",
  P: "PIZZA SIDE",
  BT: "BT",
  BW: "BW",
  FLOAT: "FLOAT",
  FOH: "FOH",
} as const;

export const BAR_WEEK_EVENTS = [
  { date: "2026-09-04", label: "Home Dodger football game" },
  { date: "2026-09-05", label: "Hawk game 3:15" },
  { date: "2026-09-05", label: "Party of 80 at 2 p.m." },
];

export const BAR_WEEK_SHIFTS: Shift[] = [
  { name: "Mychael Mueller", date: "2026-08-30", start: "Open", end: "8:00 AM", station: "FOH" },
  { name: "Mychael Mueller", date: "2026-08-31", start: "Open", end: "8:00 AM", station: "FOH" },
  { name: "Mychael Mueller", date: "2026-09-01", start: "Open", end: "8:00 AM", station: "FOH" },
  { name: "Mychael Mueller", date: "2026-09-02", start: "Open", end: "8:00 AM", station: "FOH" },
  { name: "Mychael Mueller", date: "2026-09-03", start: "Open", end: "8:00 AM", station: "FOH" },
  { name: "Mychael Mueller", date: "2026-09-04", start: "Open", end: "8:00 AM", station: "FOH" },
  { name: "Mychael Mueller", date: "2026-09-05", start: "Open", end: "7:45 AM", station: "FOH" },

  { name: "Jessica Gailey", date: "2026-09-01", start: "8:00 AM", end: "5:00 PM", station: "FOH" },
  { name: "Jessica Gailey", date: "2026-09-02", start: "8:00 AM", end: "5:00 PM", station: "FOH" },
  { name: "Jessica Gailey", date: "2026-09-03", start: "8:00 AM", end: "5:00 PM", station: "FOH" },
  { name: "Jessica Gailey", date: "2026-09-05", start: "7:45 AM", end: "5:00 PM", station: "WAITRESS" },

  { name: "Kenzy Thompson", date: "2026-08-30", start: "8:00 AM", end: "4:00 PM", station: "WAITRESS" },
  { name: "Kenzy Thompson", date: "2026-08-31", start: "8:00 AM", end: "5:00 PM", station: "FOH" },
  { name: "Kenzy Thompson", date: "2026-09-01", start: "5:00 PM", end: "OPEN", station: "WAITRESS" },
  { name: "Kenzy Thompson", date: "2026-09-04", start: "4:00 PM", end: "CLOSE", station: "WAITRESS" },
  { name: "Kenzy Thompson", date: "2026-09-05", start: "10:00 AM", end: "5:00 PM", station: "BAR SIDE" },

  { name: "Bryson Cook", date: "2026-08-30", start: "8:00 AM", end: "4:00 PM", station: "BAR SIDE" },
  { name: "Bryson Cook", date: "2026-08-31", start: "5:00 PM", end: "OPEN", station: "BAR SIDE" },
  { name: "Bryson Cook", date: "2026-09-03", start: "5:00 PM", end: "CLOSE", station: "BAR SIDE" },
  { name: "Bryson Cook", date: "2026-09-04", start: "4:00 PM", end: "CLOSE", station: "BT" },
  { name: "Bryson Cook", date: "2026-09-05", start: "1:00 PM", end: "5:00 PM", station: "FLOAT" },

  { name: "Jeri Wilson", date: "2026-08-30", start: "4:00 PM", end: "CLOSE", station: "BAR SIDE" },
  { name: "Jeri Wilson", date: "2026-09-01", start: "5:00 PM", end: "CLOSE", station: "BAR SIDE" },
  { name: "Jeri Wilson", date: "2026-09-02", start: "5:00 PM", end: "OPEN", station: "BAR SIDE" },
  { name: "Jeri Wilson", date: "2026-09-04", start: "8:00 AM", end: "4:00 PM", station: "BAR SIDE", note: "NO PM" },
  { name: "Jeri Wilson", date: "2026-09-05", start: "5:00 PM", end: "CLOSE", station: "BAR SIDE" },

  { name: "Kaillee Miller", date: "2026-08-30", start: "4:00 PM", end: "OPEN", station: "PIZZA SIDE" },
  { name: "Kaillee Miller", date: "2026-09-03", start: "5:00 PM", end: "OPEN", station: "BW" },
  { name: "Kaillee Miller", date: "2026-09-04", start: "11:00 AM", end: "4:00 PM", station: "BW" },
  { name: "Kaillee Miller", date: "2026-09-05", start: "5:00 PM", end: "OPEN", station: "PIZZA SIDE" },

  { name: "Samantha Swearingen", date: "2026-09-01", start: "4:00 PM", end: "OPEN", station: "PIZZA SIDE" },
  { name: "Samantha Swearingen", date: "2026-09-02", start: "5:00 PM", end: "CLOSE", station: "WAITRESS" },

  { name: "Araya", date: "2026-09-04", start: "4:00 PM", end: "OPEN", station: "PIZZA SIDE" },
  { name: "Araya", date: "2026-09-05", start: "5:00 PM", end: "CLOSE", station: "WAITRESS" },

  { name: "Shantera", date: "2026-08-31", start: "5:00 PM", end: "CLOSE", station: "WAITRESS" },
  { name: "Shantera", date: "2026-09-04", start: "4:00 PM", end: "CLOSE", station: "BT" },

  { name: "Kaylee S.", date: "2026-08-30", start: "4:00 PM", end: "CLOSE", station: "WAITRESS" },
  { name: "Kaylee S.", date: "2026-09-02", start: "4:00 PM", end: "OPEN", station: "PIZZA SIDE" },

  { name: "Lauren", date: "2026-08-30", start: "10:00 AM", end: "4:00 PM", station: "PIZZA SIDE" },
  { name: "Lauren", date: "2026-09-03", start: "4:00 PM", end: "OPEN", station: "PIZZA SIDE" },
  { name: "Lauren", date: "2026-09-04", start: "5:00 PM", end: "OPEN", station: "PIZZA SIDE" },
  { name: "Lauren", date: "2026-09-05", start: "10:00 AM", end: "7:00 PM", station: "PIZZA SIDE" },
];

export const REQUESTED_OFF = [
  { name: "Jessica Gailey", date: "2026-08-30" },
  { name: "Jessica Gailey", date: "2026-08-31" },
  { name: "Bryson Cook", date: "2026-09-01" },
  { name: "Jeri Wilson", date: "2026-08-31" },
  { name: "Sydney", date: "2026-09-05" },
  { name: "Shantera", date: "2026-09-05" },
];
