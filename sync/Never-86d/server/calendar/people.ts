/**
 * Who belongs in the system = whoever is on the current payroll
 * Mike Mueller sent to Mary Oleson (cfmapayroll@yahoo.com).
 *
 * This agent cannot open that Gmail thread until Allow is clicked.
 * Posted paper week Sun 8/30/2026–Sat 9/5/2026 is the live out-front roster.
 * Kitchen/driver names stay from those sheets. Mychael / Matt Jones are one person each.
 * Karlee Sturtz and Ashley Holding are gone — do not put them back.
 */

export type Station = "bar" | "kitchen" | "driver" | "ops";

export type Person = {
  id: string;
  name: string;
  station: Station;
  alsoStations?: Station[];
  aliases?: string[];
  roleNote?: string;
};

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")
    .replace(/^-|-$/g, "");
}

function person(
  name: string,
  station: Station,
  extras?: { alsoStations?: Station[]; aliases?: string[]; roleNote?: string }
): Person {
  return {
    id: slug(name),
    name,
    station,
    alsoStations: extras?.alsoStations,
    aliases: extras?.aliases,
    roleNote: extras?.roleNote,
  };
}

/** Posted paper week 8/30/2026–9/5/2026. Kenzy owns out front. */
export const BAR_ROSTER: Person[] = [
  person("Mychael Mueller", "ops", {
    alsoStations: ["bar", "kitchen"],
    aliases: ["Mike Mueller", "Myke Mueller", "Myke", "Mike", "Mychael"],
    roleNote: "Owner. Opens every day this week. Same person as Mike Mueller.",
  }),
  person("Jessica Gailey", "bar"),
  person("Kenzy Thompson", "bar", {
    aliases: ["Kinsey Thompson", "Kinsey", "Kenzy"],
    roleNote: "Out front. Owns the FOH checklist.",
  }),
  person("Bryson Cook", "bar"),
  person("Jeri Wilson", "bar"),
  person("Kaillee Miller", "bar", { aliases: ["Kailee M.", "Kailee Miller", "Kailee"] }),
  person("Samantha Swearingen", "bar", { aliases: ["Sam"] }),
  person("Sydney", "bar"),
  person("Araya", "bar", { aliases: ["Azaria Silvey", "Azaria", "Araya Silvey"] }),
  person("Shantera", "bar"),
  person("Kaylee S.", "bar", { aliases: ["Kaylee"] }),
  person("Lauren", "bar"),
];

/**
 * Names on CTAP KITCHEN SCHEDULE. Times are blank on that file.
 * Hours lock from the payroll email to Mary, not from this sheet.
 * Mychael is not repeated here — he is already on BAR_ROSTER.
 */
export const KITCHEN_ROSTER: Person[] = [
  person("Thomas Dorothy", "kitchen", {
    aliases: ["Tom Dorothy", "Tom"],
    roleNote: "Kitchen manager (Tom)",
  }),
  person("Moe Thomas", "kitchen"),
  person("Che Lyftogt", "kitchen"),
  person("Ryan Berg", "kitchen"),
  person("Steven Klein", "kitchen"),
  person("Aundrik Roast", "kitchen"),
  person("Aundry Roast", "kitchen"),
  person("Nash Wheaton", "kitchen"),
  person("Brodey Laughman", "kitchen"),
  person("Max George", "kitchen"),
  person("Dustin Stein", "kitchen"),
  person("Doc", "kitchen"),
  person("Ian Ebelsheiser", "kitchen"),
  person("Jacob Lawton", "kitchen"),
  person("Gavin Nore", "kitchen"),
  person("Matt Jones", "kitchen", {
    alsoStations: ["driver"],
    roleNote: "On kitchen and driver sheets — one person",
  }),
  person("Kyler Preston", "kitchen"),
  person("Ben Mason", "kitchen"),
];

/** Names on CTAP DRIVER SCHEDULE. Matt Jones is not repeated — see kitchen. */
export const DRIVER_ROSTER: Person[] = [
  person("Kim Pratt", "driver"),
  person("Bryce Delany", "driver"),
  person("Nate Lowrey", "driver"),
  person("Stephen Wheaton", "driver"),
  person("Aidan", "driver"),
];

export const CTAP_ROSTER: Person[] = [
  ...BAR_ROSTER,
  ...KITCHEN_ROSTER,
  ...DRIVER_ROSTER,
];

/** Off the floor. Do not put them back from old Drive sheets. */
export const NO_LONGER_ON_PAYROLL = ["Karlee Sturtz", "Ashley Holding"];

export const PAYROLL_ACCOUNTANT = {
  name: "Mary E. Oleson",
  firm: "Cornwell, Frideres, Maher",
  email: "cfmapayroll@yahoo.com",
  phone: "515-955-4805",
  cadence: "bi-weekly",
  payrollFrom: "Mike Mueller / Mychael Mueller",
};

export function namesOnPayroll(): string[] {
  return [...new Set(CTAP_ROSTER.map((item) => item.name))].sort();
}

export function peopleAt(station: Station): Person[] {
  return CTAP_ROSTER.filter(
    (item) => item.station === station || item.alsoStations?.includes(station)
  );
}

export function personInSystem(name: string): Person | undefined {
  const needle = name.trim().toLowerCase();
  const needleId = slug(needle);
  return CTAP_ROSTER.find(
    (item) =>
      item.name.toLowerCase() === needle ||
      item.id === needleId ||
      item.aliases?.some((alias) => alias.toLowerCase() === needle || slug(alias) === needleId)
  );
}
