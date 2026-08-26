/**
 * Community Lab — the AI-native living lab.
 *
 * Public brand is Never 86'd. Action Shift is the mechanic.
 * This file is the store overlay: Community Tap & Pizza (CTAP), Fort Dodge.
 * Agents route leaks to a person + role. They do not invent a second brand.
 *
 * LOCKED managers: operator confirmed Mon Aug 24, 2026.
 * LOCKED crew presence: operator confirmed Wed Aug 26, 2026 —
 *   Jessica Gailey, Che Lyftogt, Gavin Noore, Moe Thomas, Sally Hart, Bryson Cook.
 * Jessica + Che PDQ job Bartender is VERIFIED.
 * Gavin / Moe / Sally / Bryson job titles remain ESTIMATED from old PDQ cashier lines.
 */

export const COMMUNITY_LAB = {
  id: "community-lab",
  publicBrand: "Never 86'd",
  mechanic: "Action Shift",
  storeName: "Community Tap & Pizza",
  storeShort: "Community",
  specimenOf: "1–3 unit owner-operator",
  city: "Fort Dodge, IA",
  mailbox: "communitypizza2026@gmail.com",
  pos: "PDQ",
  mcpBrain: "https://www.never86.ai/api/mcp",
  mcpFirstTool: "get_operator_system",
} as const;

export type SourceTag = "VERIFIED" | "ESTIMATED" | "SINGLE-SOURCE" | "UNVERIFIED";
export type House = "owner" | "front" | "back";
export type FloorStatus = "on_floor" | "not_on_floor" | "owner";
export type Never86Seat =
  | "Owner"
  | "Manager"
  | "Chef"
  | "Crew"
  | "Bar Manager";

export type LabRole = {
  id: string;
  title: string;
  house: House;
  pdqJobNames: string[];
  never86Seat: Never86Seat;
  owns: string[];
  cadence: string[];
  inputs: string[];
  nightProof: string[];
  cannot: string[];
};

export type LabPerson = {
  id: string;
  name: string;
  roleId: string;
  status: FloorStatus;
  /** Presence on/off the floor. */
  sourceTag: SourceTag;
  /** Job title confidence. Presence can be verified while role is still estimated. */
  roleSourceTag: SourceTag;
  notes: string;
  email?: string | null;
  confirmedOn?: string;
};

export const COMMUNITY_ROLES: LabRole[] = [
  {
    id: "owner",
    title: "Owner-operator",
    house: "owner",
    pdqJobNames: [],
    never86Seat: "Owner",
    owns: [
      "prime cost",
      "3P / DoorDash",
      "books",
      "Action Shift approve",
      "vendor mailbox switches",
    ],
    cadence: [
      "night: one Action Shift for the prior complete day",
      "week: rails vs food / beer / liquor / labor",
    ],
    inputs: ["PDQ Z-report", "week book", "3P statement"],
    nightProof: ["Z landed in communitypizza", "one owner named on the card"],
    cannot: [
      "weekly Hy-Vee liquor email loop",
      "fill every par hole",
      "put Karlee or Ashley on the floor",
    ],
  },
  {
    id: "foh_manager",
    title: "Bar FOH manager",
    house: "front",
    pdqJobNames: ["Ctap Manger", "Ctap Manager", "Closing Manager"],
    never86Seat: "Bar Manager",
    owns: [
      "bar orders",
      "beer orders",
      "liquor orders",
      "drink specials",
      "FOH staffing",
    ],
    cadence: [
      "Sun/Mon: liquor qty on the Google sheet, SEND to Hy-Vee",
      "Sun night: beer for Tuesday Humes / Fort Dodge Dist",
      "Tue night: beer for Friday Humes",
    ],
    inputs: ["liquor Google Sheet", "Humes PDF", "Fort Dodge Dist photo"],
    nightProof: ["Hy-Vee send from communitypizza, no Myke CC"],
    cannot: ["food vendor orders", "kitchen specials", "BOH staffing"],
  },
  {
    id: "boh_manager",
    title: "BOH manager",
    house: "back",
    pdqJobNames: [],
    never86Seat: "Chef",
    owns: [
      "food vendor orders",
      "kitchen specials",
      "BOH staffing",
      "Sysco",
      "PFG",
      "Northern Lights",
      "Sawyer",
    ],
    cadence: [
      "Sysco ~1×/week photo",
      "PFG Mon/Thu",
      "Sawyer Mon/Wed/Fri photo",
      "Northern Lights 2–8× photo + PDF",
    ],
    inputs: ["invoice photos", "PFG PDF", "kitchen on-hand"],
    nightProof: ["handwritten totals beat printed", "photos in communitypizza"],
    cannot: ["beer orders", "liquor orders", "drink specials", "FOH staffing"],
  },
  {
    id: "bartender",
    title: "Bartender",
    house: "front",
    pdqJobNames: ["Bartender"],
    never86Seat: "Crew",
    owns: ["bar execution", "pour standards", "comp / void awareness"],
    cadence: ["shift"],
    inputs: ["PDQ bar sales", "voids", "payouts"],
    nightProof: ["voids named, not guessed as theft"],
    cannot: ["place distributor orders"],
  },
  {
    id: "server",
    title: "Server",
    house: "front",
    pdqJobNames: ["Server"],
    never86Seat: "Crew",
    owns: ["table service", "tips on the ticket"],
    cadence: ["shift"],
    inputs: ["PDQ table sales", "tip lines"],
    nightProof: ["tip variance is a service signal, not a verdict"],
    cannot: ["place distributor orders"],
  },
  {
    id: "driver",
    title: "Driver",
    house: "front",
    pdqJobNames: ["Driver"],
    never86Seat: "Crew",
    owns: ["delivery run", "late-delivery clock"],
    cadence: ["shift"],
    inputs: ["PDQ delivery count", "average del time"],
    nightProof: ["late deliveries counted, not blamed"],
    cannot: ["place distributor orders"],
  },
  {
    id: "pizza_maker",
    title: "Pizza maker",
    house: "back",
    pdqJobNames: ["Pizza Maker"],
    never86Seat: "Crew",
    owns: ["make line", "Large Pizza execution"],
    cadence: ["shift"],
    inputs: ["PDQ Large Pizza + Food"],
    nightProof: ["Large Pizza rolls into Food on the books"],
    cannot: ["place distributor orders"],
  },
  {
    id: "fry_line",
    title: "Fry line",
    house: "back",
    pdqJobNames: ["Fry Line"],
    never86Seat: "Crew",
    owns: ["fry execution"],
    cadence: ["shift"],
    inputs: ["PDQ food mix"],
    nightProof: ["waste logged if claimed"],
    cannot: ["place distributor orders"],
  },
  {
    id: "dishwasher",
    title: "Dishwasher",
    house: "back",
    pdqJobNames: ["Dishwasher"],
    never86Seat: "Crew",
    owns: ["dish pit"],
    cadence: ["shift"],
    inputs: ["labor hours"],
    nightProof: [],
    cannot: ["place distributor orders"],
  },
  {
    id: "inshop",
    title: "In-shop",
    house: "back",
    pdqJobNames: ["InShop"],
    never86Seat: "Crew",
    owns: ["in-shop support"],
    cadence: ["shift"],
    inputs: ["labor hours"],
    nightProof: [],
    cannot: ["place distributor orders"],
  },
  {
    id: "extra",
    title: "Extra",
    house: "back",
    pdqJobNames: ["Extra"],
    never86Seat: "Crew",
    owns: ["overflow labor"],
    cadence: ["as scheduled"],
    inputs: ["labor hours"],
    nightProof: [],
    cannot: ["place distributor orders"],
  },
];

export const COMMUNITY_PEOPLE: LabPerson[] = [
  {
    id: "myke",
    name: 'Mychael "Myke" Mueller',
    roleId: "owner",
    status: "owner",
    sourceTag: "VERIFIED",
    roleSourceTag: "VERIFIED",
    notes: "Owner. Not in the weekly Hy-Vee email loop.",
    email: "myke@n86.app",
  },
  {
    id: "kenzy",
    name: "Kenzy Thompson",
    roleId: "foh_manager",
    status: "on_floor",
    sourceTag: "VERIFIED",
    roleSourceTag: "VERIFIED",
    notes:
      "Wife. Bar FOH manager. Same manager job as Tom, front house. PDQ job often prints Ctap Manger.",
    email: null,
  },
  {
    id: "tom",
    name: "Tom Dorothy",
    roleId: "boh_manager",
    status: "on_floor",
    sourceTag: "VERIFIED",
    roleSourceTag: "VERIFIED",
    notes:
      "BOH manager. Same manager job as Kenzy, back house. PDQ cashier line has printed Thomas Dorothy.",
    email: null,
  },
  {
    id: "karlee",
    name: "Karlee Sturtz",
    roleId: "foh_manager",
    status: "not_on_floor",
    sourceTag: "VERIFIED",
    roleSourceTag: "VERIFIED",
    notes: "Not on the floor. Lease draft guarantor only.",
  },
  {
    id: "ashley",
    name: "Ashley Holding",
    roleId: "foh_manager",
    status: "not_on_floor",
    sourceTag: "VERIFIED",
    roleSourceTag: "VERIFIED",
    notes: "Not on the floor. Lease draft guarantor only.",
  },
  {
    id: "jessica",
    name: "Jessica Gailey",
    roleId: "bartender",
    status: "on_floor",
    sourceTag: "VERIFIED",
    roleSourceTag: "VERIFIED",
    confirmedOn: "2026-08-26",
    notes: "Operator confirmed still on floor. PDQ job Bartender.",
  },
  {
    id: "che",
    name: "Che Lyftogt",
    roleId: "bartender",
    status: "on_floor",
    sourceTag: "VERIFIED",
    roleSourceTag: "VERIFIED",
    confirmedOn: "2026-08-26",
    notes: "Operator confirmed still on floor. PDQ job Bartender.",
  },
  {
    id: "gavin",
    name: "Gavin Noore",
    roleId: "server",
    status: "on_floor",
    sourceTag: "VERIFIED",
    roleSourceTag: "ESTIMATED",
    confirmedOn: "2026-08-26",
    notes: "Operator confirmed still on floor. PDQ cashier — job title still estimated.",
  },
  {
    id: "moe",
    name: "Moe Thomas",
    roleId: "server",
    status: "on_floor",
    sourceTag: "VERIFIED",
    roleSourceTag: "ESTIMATED",
    confirmedOn: "2026-08-26",
    notes: "Operator confirmed still on floor. PDQ cashier — job title still estimated.",
  },
  {
    id: "sally",
    name: "Sally Hart",
    roleId: "server",
    status: "on_floor",
    sourceTag: "VERIFIED",
    roleSourceTag: "ESTIMATED",
    confirmedOn: "2026-08-26",
    notes: "Operator confirmed still on floor. PDQ cashier — job title still estimated.",
  },
  {
    id: "bryson",
    name: "Bryson Cook",
    roleId: "extra",
    status: "on_floor",
    sourceTag: "VERIFIED",
    roleSourceTag: "ESTIMATED",
    confirmedOn: "2026-08-26",
    notes: "Operator confirmed still on floor. PDQ cashier + payouts — job title still estimated.",
  },
];

/** Backward-compatible manager lock used by intake routing. */
export const CTAP_PEOPLE = {
  owner: COMMUNITY_PEOPLE.find(p => p.id === "myke")!.name,
  spouse: {
    name: "Kenzy Thompson",
    role: "wife; bar FOH manager — bar orders (beer + liquor), drink specials, FOH staffing. Myke is not in the Hy-Vee loop.",
  },
  foh: {
    name: "Kenzy Thompson",
    house: "front" as const,
    role: "bar FOH manager",
    owns: COMMUNITY_ROLES.find(r => r.id === "foh_manager")!.owns,
  },
  boh: {
    name: "Tom Dorothy",
    house: "back" as const,
    role: "BOH manager",
    owns: [
      "food vendor orders",
      "kitchen specials",
      "BOH staffing",
    ],
  },
} as const;

export type LeakDomain =
  | "liquor"
  | "beer"
  | "drink_specials"
  | "foh_staffing"
  | "foh_labor"
  | "food"
  | "kitchen_specials"
  | "boh_staffing"
  | "boh_labor"
  | "labor"
  | "prime"
  | "3p"
  | "voids"
  | "tips"
  | "delivery";

export function personOnFloor(): LabPerson[] {
  return COMMUNITY_PEOPLE.filter(
    p => p.status === "on_floor" || p.status === "owner"
  );
}

/** Crew on the floor, excluding Kenzy / Tom. */
export function floorCrew(): LabPerson[] {
  return COMMUNITY_PEOPLE.filter(
    p =>
      p.status === "on_floor" &&
      p.roleId !== "foh_manager" &&
      p.roleId !== "boh_manager"
  );
}

export function roleById(roleId: string): LabRole | undefined {
  return COMMUNITY_ROLES.find(r => r.id === roleId);
}

/**
 * One leak → one owner. Pattern, not verdict.
 * Managers are VERIFIED. Crew presence is VERIFIED.
 * Action Shift still routes to Kenzy / Tom / Myke, not to crew.
 */
export function actionOwnerForLeak(domain: LeakDomain): {
  person: LabPerson;
  role: LabRole;
  sourceTag: SourceTag;
} {
  const pick = (id: string) => {
    const person = COMMUNITY_PEOPLE.find(p => p.id === id)!;
    const role = roleById(person.roleId)!;
    return { person, role, sourceTag: person.sourceTag };
  };

  switch (domain) {
    case "liquor":
    case "beer":
    case "drink_specials":
    case "foh_staffing":
    case "foh_labor":
      return pick("kenzy");
    case "food":
    case "kitchen_specials":
    case "boh_staffing":
    case "boh_labor":
      return pick("tom");
    case "delivery":
    case "tips":
    case "voids":
      return pick("kenzy");
    case "labor":
    case "prime":
    case "3p":
      return pick("myke");
    default:
      return pick("myke");
  }
}

function personCardLine(p: LabPerson): string {
  const role = roleById(p.roleId);
  const title = role?.title ?? p.roleId;
  if (p.roleSourceTag !== p.sourceTag) {
    return `- ${p.name} — ${title} [presence ${p.sourceTag}, job ${p.roleSourceTag}]`;
  }
  return `- ${p.name} — ${title} [${p.sourceTag}]`;
}

export function communityLabCard(): string {
  const floor = personOnFloor().map(personCardLine).join("\n");
  return [
    `${COMMUNITY_LAB.storeName} (${COMMUNITY_LAB.id})`,
    `Public brand: ${COMMUNITY_LAB.publicBrand}. Mechanic: ${COMMUNITY_LAB.mechanic}.`,
    `Mailbox: ${COMMUNITY_LAB.mailbox}`,
    `POS: ${COMMUNITY_LAB.pos}`,
    "",
    "Floor:",
    floor,
    "",
    "Do not put Karlee Sturtz or Ashley Holding on the floor.",
    "Kenzy = bar/front. Tom = kitchen/back. Same manager job, opposite houses.",
    "Crew presence locked 2026-08-26. Gavin / Moe / Sally / Bryson job titles still estimated.",
  ].join("\n");
}
