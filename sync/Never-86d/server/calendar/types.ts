/**
 * CTAP Monthly Calendar Engine — Never86'd.
 * Plan → execute → measure → learn → recommend.
 * The agent never emails Humes on its own judgment.
 */

export const CALENDAR_ENGINE_VERSION = "ctap-monthly-calendar-v1";

export const DATABASE_OBJECTS = [
  "calendar_months",
  "calendar_days",
  "recurring_specials",
  "monthly_specials",
  "drink_specials",
  "events",
  "holiday_candidates",
  "sports_events",
  "promotion_rules",
  "calendar_approvals",
  "calendar_versions",
  "calendar_email_log",
  "special_performance",
] as const;

export type DatabaseObject = (typeof DATABASE_OBJECTS)[number];

export type RoleId = "kenzy" | "tom" | "myke";
export type OwnerSide = "bar" | "kitchen" | "ops";

export type CalendarStatus =
  | "DRAFT"
  | "MANAGER_REVIEW"
  | "MYKE_REVIEW"
  | "APPROVED"
  | "SENT_TO_HUMES";

export type ApprovalAction = "APPROVE" | "EDIT" | "HOLD";
export type EventStatus = "DRAFT" | "AWAITING_CONFIRMATION" | "CONFIRMED";
export type HolidayClass = "MUST_USE" | "CONSIDER" | "IGNORE";
export type SpecialCategory = "food" | "drink" | "bar" | "event" | "programming";
export type DayOfWeek =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type Promotion = {
  id: string;
  name: string;
  category: SpecialCategory;
  owner: RoleId;
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  price?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  recurring: boolean;
  approved: boolean;
  approvedBy?: RoleId;
  foodCost?: string;
  beverageCost?: string;
  marginTarget?: string;
  posterRequired: boolean;
  glassware?: string;
  garnish?: string;
  availableDates?: string[];
  lockedDay?: boolean;
};

export type RecurringSpecial = Promotion & {
  libraryId: string;
};

export type MonthlySpecial = Promotion & {
  monthKey: string;
  kind: "food" | "drink";
};

export type CtapEvent = {
  id: string;
  eventName: string;
  date: string;
  startTime?: string;
  endTime?: string;
  performer?: string;
  status: EventStatus;
  owner: RoleId;
};

export type HolidayCandidate = {
  id: string;
  name: string;
  date: string;
  classification: HolidayClass;
  reason: string;
};

export type SportsEvent = {
  id: string;
  league: "iowa" | "iowa_state" | "college" | "nfl";
  label: string;
  date: string;
  startTime?: string;
  window?: "sunday" | "monday_night" | "thursday_night" | "saturday";
};

export type CalendarDay = {
  date: string;
  dayOfWeek: DayOfWeek;
  recurring: RecurringSpecial[];
  monthly: MonthlySpecial[];
  events: CtapEvent[];
  holidays: HolidayCandidate[];
  sports: SportsEvent[];
  planningOnly: SportsEvent[];
};

export type CompletenessGap = {
  field: string;
  owner: RoleId;
  detail: string;
};

export type CalendarMonth = {
  id: string;
  monthKey: string;
  label: string;
  targetYear: number;
  targetMonth: number;
  status: CalendarStatus;
  locked: boolean;
  days: CalendarDay[];
  recurring: RecurringSpecial[];
  monthlyFood?: MonthlySpecial;
  monthlyDrink?: MonthlySpecial;
  events: CtapEvent[];
  holidays: HolidayCandidate[];
  sports: SportsEvent[];
  footballPromoDecisions: {
    monday_night_football_promo: "open" | "none" | "approved";
    thursday_night_football_promo: "open" | "none" | "approved";
  };
  gaps: CompletenessGap[];
  completenessPct: number;
  version: number;
  exceptions: string[];
  createdAt: string;
};

export type CalendarVersion = {
  monthId: string;
  version: number;
  snapshotHash: string;
  createdAt: string;
};

export type CalendarApproval = {
  monthId: string;
  action: ApprovalAction;
  actor: RoleId;
  at: string;
  note?: string;
};

export type CalendarEmailLog = {
  sentAt: string;
  recipient: string;
  calendarVersion: number;
  sentBy: RoleId;
  approvalBy: RoleId;
  attachmentHash: string;
  subject: string;
};

export type SpecialPerformance = {
  specialId: string;
  name: string;
  monthKey: string;
  salesUnits: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  peakDay: DayOfWeek;
  bestHour: string;
  peakSharePct: number;
};

export type ApprovalPacket = {
  subject: string;
  monthLabel: string;
  preview: CalendarDay[];
  foodSpecial?: MonthlySpecial;
  drinkSpecial?: MonthlySpecial;
  holidays: HolidayCandidate[];
  events: CtapEvent[];
  weeklyPromotions: RecurringSpecial[];
  prices: Array<{ name: string; price?: string }>;
  changedSpecials: string[];
  buttons: ApprovalAction[];
  gaps: CompletenessGap[];
};

export type HumesEmail = {
  subject: string;
  recipient: string;
  body: string;
  attachmentHash: string;
  calendarVersion: number;
};

export type TickResult = {
  phase:
    | "create"
    | "notice"
    | "lock"
    | "approval"
    | "humes"
    | "idle";
  month?: CalendarMonth;
  notice?: string;
  packet?: ApprovalPacket;
  email?: HumesEmail;
  blocked?: string;
};
