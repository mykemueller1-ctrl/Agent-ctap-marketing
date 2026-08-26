/** CTAP house handbook — rules the floor actually runs. */

export const HANDBOOK_VERSION = "ctap-handbook-v1";

export type HandbookSide = "foh" | "bar" | "kitchen" | "driver" | "ops" | "all";

export type Severity = "hard" | "bonus" | "process";

export type HandbookRule = {
  id: string;
  side: HandbookSide;
  severity: Severity;
  title: string;
  body: string;
  owners?: string[];
  source: string;
};

export type CogsCategory = "liquor" | "beer" | "food";

export type BounceBand = {
  category: CogsCategory;
  minPct: number;
  maxPct: number;
  dollars: number;
};

export type PourSpec = {
  id: string;
  name: string;
  glass: string;
  pourOz: number;
  note: string;
};

export type ScheduleToken = {
  token: string;
  meaning: string;
};

export type ShiftChecklist = {
  id: string;
  name: string;
  side: HandbookSide;
  when: "morning" | "mid" | "close" | "nightly" | "weekly";
  items: string[];
  owner: string;
};

export type InvoiceCadenceDay = {
  weekday: string;
  vendors: string[];
};
