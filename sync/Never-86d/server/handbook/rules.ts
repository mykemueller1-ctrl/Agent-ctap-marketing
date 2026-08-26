import type {
  BounceBand,
  CogsCategory,
  HandbookRule,
  HandbookSide,
  InvoiceCadenceDay,
  PourSpec,
  ScheduleToken,
  ShiftChecklist,
} from "./types";

export const HANDBOOK_OWNERS = {
  myke: "Mychael Mueller",
  tom: "Thomas Dorothy",
  karlee: "Karlee Sturtz",
  ashley: "Ashley Holding",
  kenzy: "Kenzy Thompson",
} as const;

/** Weekly bounce, Sunday–Saturday. Paid Monday morning after Saturday close. */
export const BOUNCE_BANDS: BounceBand[] = [
  { category: "liquor", minPct: 18, maxPct: 20, dollars: 125 },
  { category: "liquor", minPct: 21, maxPct: 25, dollars: 75 },
  { category: "beer", minPct: 22, maxPct: 25, dollars: 125 },
  { category: "beer", minPct: 26, maxPct: 29, dollars: 75 },
  { category: "food", minPct: 28, maxPct: 30, dollars: 250 },
  { category: "food", minPct: 31, maxPct: 33, dollars: 150 },
];

export const WEEKLY_SPEND_TARGETS = {
  beer: 1650,
  liquor: 925,
  beerCogsTargetPct: 28,
  liquorCogsTargetPct: 22,
  combinedCogsUnderPct: 64,
};

export const COGS_FORMULA =
  "(Purchases + Beg Inv – End Inv) ÷ Bar Net Sales. Discounts count toward sales.";

export const POUR_SPECS: PourSpec[] = [
  {
    id: "shot",
    name: "Shot",
    glass: "2 oz shot glass",
    pourOz: 1.5,
    note: "Do not fill to the rim. Teach mixed shots to 1.5 oz.",
  },
  {
    id: "mixed-liquor",
    name: "Mixed drink liquor",
    glass: "Pristler / mixed glass",
    pourOz: 1.75,
    note: "Bar book builds (Bloody Mary, Captain & Coke, Margarita) use 1.75 oz liquor.",
  },
  {
    id: "wine",
    name: "Wine",
    glass: "6 oz wine glass",
    pourOz: 5,
    note: "5 oz pour from 1.5 L bottle.",
  },
  {
    id: "rocks",
    name: "Shot on the rocks",
    glass: "Short rocks",
    pourOz: 1.5,
    note: "Pack the glass with ice.",
  },
];

export const SCHEDULE_TOKENS: ScheduleToken[] = [
  { token: "Open", meaning: "Starts when the restaurant opens." },
  {
    token: "OPEN",
    meaning: "Paper “O” — first person cut when it slows.",
  },
  { token: "Close", meaning: "Works until close of business." },
  { token: "RO", meaning: "Requested off." },
];

export const FOH_STATIONS = [
  "BAR SIDE",
  "BAR SERVER",
  "WAITRESS",
  "PIZZA SIDE",
] as const;

export const KITCHEN_STATIONS = [
  "Fry Line",
  "Pizza Maker",
  "Dishwasher",
  "InShop",
] as const;

export const DRIVER_STATION = "Driver";

export const INVOICE_CADENCE: InvoiceCadenceDay[] = [
  { weekday: "monday", vendors: ["Sawyer"] },
  { weekday: "tuesday", vendors: ["Northern Lights", "Performance"] },
  { weekday: "wednesday", vendors: ["Sawyer"] },
  { weekday: "thursday", vendors: ["Food"] },
  { weekday: "friday", vendors: ["Northern Lights", "Performance", "Sawyer"] },
];

export const BUCKET_PRICES = [
  { name: "White Claw", price: 25 },
  { name: "Skimmer", price: 30 },
  { name: "Carbliss", price: 35 },
] as const;

export const KITCHEN_PORTIONS = [
  {
    id: "mac-side",
    name: "Mac & cheese side",
    spec: "2 oz cheese sauce + 5 oz cooked noodles (8 oz total)",
  },
  { id: "fries-side", name: "Fries side", spec: "6 oz" },
  {
    id: "food-watch",
    name: "Food cost watch",
    spec: "Pizza toppings and smoked meat portions — that is where the money still sits.",
  },
] as const;

export const KITCHEN_COUNT_ZONES = [
  "DRY STORAGE-Dry Goods",
  "DRY STORAGE-Food",
  "LINE",
  "DOUGH",
  "FREEZERS",
  "BACK ROOM",
  "FROZEN/REFRIGERATED",
  "WALK-IN",
] as const;

export const HANDBOOK_RULES: HandbookRule[] = [
  {
    id: "if-not-in-app",
    side: "all",
    severity: "hard",
    title: "If it’s not in the app, it didn’t happen",
    body: "Checklists, feedback, issues, write-ups, and schedule live in Never86’d. No sticky notes, no texts as the system of record.",
    owners: [HANDBOOK_OWNERS.karlee, HANDBOOK_OWNERS.ashley, HANDBOOK_OWNERS.tom],
    source: "Wednesday manager meeting — Karlee & Ashley",
  },
  {
    id: "foh-checklist-every-shift",
    side: "foh",
    severity: "hard",
    title: "Dining room checklist every shift",
    body: "Morning, mid, and close. Karlee owns 95%+ completion. Managers review completion rates.",
    owners: [HANDBOOK_OWNERS.karlee],
    source: "Wednesday manager meeting — Karlee & Ashley",
  },
  {
    id: "shift-feedback",
    side: "all",
    severity: "hard",
    title: "Feedback after every shift",
    body: "Good or bad. Every employee has a folder for notes and coaching. Managers review folders weekly.",
    owners: [HANDBOOK_OWNERS.karlee, HANDBOOK_OWNERS.ashley],
    source: "Wednesday manager meeting — Karlee & Ashley",
  },
  {
    id: "voids-need-manager",
    side: "foh",
    severity: "hard",
    title: "Voids need manager approval",
    body: "Accuracy over speed. Ashley owns promo/void accuracy and POS retraining. Live POS test: standard drink, modifier, promo, void.",
    owners: [HANDBOOK_OWNERS.ashley],
    source: "Wednesday manager meeting — Karlee & Ashley",
  },
  {
    id: "right-pos-button",
    side: "bar",
    severity: "hard",
    title: "Hit the right POS button",
    body: "No “open” items for standard drinks. Carbliss and Skimmers ring by item, not a broad button.",
    owners: [HANDBOOK_OWNERS.ashley, HANDBOOK_OWNERS.karlee],
    source: "Bar goals & bonus + out-front meeting",
  },
  {
    id: "correct-glass",
    side: "bar",
    severity: "hard",
    title: "Correct glass for the spec pour",
    body: "Old sizes are retired. Mixed drinks in the pristler. Shot in a 2 oz glass, not filled to the top. Rocks packed with ice. Mind plastic cups.",
    owners: [HANDBOOK_OWNERS.karlee, HANDBOOK_OWNERS.ashley],
    source: "Bar goals & bonus + out-front meeting",
  },
  {
    id: "overpour-writeup",
    side: "bar",
    severity: "hard",
    title: "Overpour after training is a write-up",
    body: "We train first. Continued overpouring or missed specs = write-up or termination. Entire staff, not just managers.",
    owners: [HANDBOOK_OWNERS.karlee, HANDBOOK_OWNERS.ashley],
    source: "Bar goals & bonus structure",
  },
  {
    id: "lunch-no-soda",
    side: "foh",
    severity: "hard",
    title: "Lunch special does not include fountain soda",
    body: "No soda on the lunch special. Staff pop to take home is bought. Fountain soda is free if they don’t want a take-home.",
    owners: [HANDBOOK_OWNERS.karlee],
    source: "Out-front meeting",
  },
  {
    id: "no-keg-drops",
    side: "bar",
    severity: "hard",
    title: "No extra kegs and no surprise Humes drops",
    body: "Do not get kegs unless you absolutely have to. Tell Bambi at Humes: no more just dropping product.",
    owners: [HANDBOOK_OWNERS.ashley, HANDBOOK_OWNERS.karlee],
    source: "Weekly manager numbers 10-5 thru 10-11",
  },
  {
    id: "closing-numbers",
    side: "ops",
    severity: "process",
    title: "Closing manager enters the night’s numbers",
    body: "Food, beer, and liquor sales from POS. Food, beer, and liquor purchases. Paper/chemicals. Waste, spoilage, comps. Count cheese, meats, kegs, top liquors.",
    owners: [HANDBOOK_OWNERS.myke],
    source: "Community Tap Weekly Numbers Tracking Guide",
  },
  {
    id: "weekly-flash",
    side: "ops",
    severity: "process",
    title: "Weekly flash P&L Sunday or Monday",
    body: "Sum the week. Gross profit % vs budget and vs last year. Bounce calculated after Saturday close. Combined COGS under 64% is the house win.",
    owners: [HANDBOOK_OWNERS.myke, HANDBOOK_OWNERS.tom],
    source: "Weekly Numbers Tracking Guide + weekly bounce notes",
  },
  {
    id: "kitchen-portions",
    side: "kitchen",
    severity: "hard",
    title: "Kitchen portions stay on spec",
    body: "Mac side is 2 oz sauce + 5 oz noodles. Fries 6 oz. Watch pizza toppings and smoked meats — that is the remaining food-cost leak.",
    owners: [HANDBOOK_OWNERS.tom],
    source: "Mac & cheese spec + weekly numbers to Tom",
  },
  {
    id: "kitchen-count-zones",
    side: "kitchen",
    severity: "process",
    title: "Kitchen counts by zone",
    body: "Dry storage dry goods, dry storage food, line, dough, freezers, back room, frozen/refrigerated, walk-in. Full par sheet lives on Drive.",
    owners: [HANDBOOK_OWNERS.tom],
    source: "Kitchen dry-storage / walk-in count sheets",
  },
  {
    id: "schedule-tokens",
    side: "ops",
    severity: "process",
    title: "Schedule tokens from the paper week",
    body: "Open / OPEN / Close / RO. Stations are department-specific (bar vs kitchen). Rename the week to the dates before download-CSV upload.",
    owners: [HANDBOOK_OWNERS.karlee, HANDBOOK_OWNERS.ashley, HANDBOOK_OWNERS.tom],
    source: "HOW TO INPUT WEEKLY SCHEDULES",
  },
];

export const SHIFT_CHECKLISTS: ShiftChecklist[] = [
  {
    id: "foh-morning",
    name: "FOH morning",
    side: "foh",
    when: "morning",
    owner: HANDBOOK_OWNERS.karlee,
    items: [
      "Complete morning dining room checklist in the app",
      "Confirm POS is up and pour/glass specs are on the well",
      "Report equipment, cleanliness, or supply issues in the app",
    ],
  },
  {
    id: "foh-mid",
    name: "FOH mid",
    side: "foh",
    when: "mid",
    owner: HANDBOOK_OWNERS.karlee,
    items: [
      "Complete mid-shift dining room checklist",
      "No open-ring standard drinks",
      "Voids only with manager approval",
    ],
  },
  {
    id: "foh-close",
    name: "FOH close",
    side: "foh",
    when: "close",
    owner: HANDBOOK_OWNERS.karlee,
    items: [
      "Complete close dining room checklist",
      "Submit shift feedback (good or bad)",
      "Closing manager enters sales, purchases, paper/chem, waste",
    ],
  },
  {
    id: "kitchen-close",
    name: "Kitchen close",
    side: "kitchen",
    when: "close",
    owner: HANDBOOK_OWNERS.tom,
    items: [
      "Portions stayed on spec (pizza toppings, smoked meats, mac, fries)",
      "Count the high-cost zones that moved (walk-in, line, dough)",
      "Log waste and comps",
    ],
  },
  {
    id: "bar-close",
    name: "Bar close",
    side: "bar",
    when: "close",
    owner: HANDBOOK_OWNERS.ashley,
    items: [
      "Right buttons all night — no open items for standard drinks",
      "Glassware and pour specs held",
      "No surprise kegs; Humes only what was ordered",
    ],
  },
];

export function bounceFor(category: CogsCategory, cogsPct: number): number {
  const band = BOUNCE_BANDS.find(
    (item) =>
      item.category === category &&
      cogsPct >= item.minPct &&
      cogsPct <= item.maxPct
  );
  return band?.dollars ?? 0;
}

export function rulesFor(side: HandbookSide): HandbookRule[] {
  return HANDBOOK_RULES.filter((rule) => rule.side === side || rule.side === "all");
}

export function lookupRule(id: string): HandbookRule | undefined {
  return HANDBOOK_RULES.find((rule) => rule.id === id);
}

export function pourSpec(id: string): PourSpec | undefined {
  return POUR_SPECS.find((item) => item.id === id);
}

export function bucketPrice(name: string): number | undefined {
  return BUCKET_PRICES.find(
    (item) => item.name.toLowerCase() === name.trim().toLowerCase()
  )?.price;
}

export function vendorsOn(weekday: string): string[] {
  return (
    INVOICE_CADENCE.find((day) => day.weekday === weekday.toLowerCase())
      ?.vendors ?? []
  );
}

export function tokenMeaning(token: string): string | undefined {
  return SCHEDULE_TOKENS.find((item) => item.token === token)?.meaning;
}
