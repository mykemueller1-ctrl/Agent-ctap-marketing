/**
 * CTAP intake routing — single ops mailbox + vendor cadence.
 *
 * All distributor / POS nightly traffic for Community Tap & Pizza should land
 * in CTAP_OPS_MAILBOX so Never 86'd can learn sales + invoice history without
 * splitting across founder inboxes.
 */

export const CTAP_OPS_MAILBOX = "communitypizza2026@gmail.com";
/** Legacy founder inbox — do not route new vendor/POS mail here. */
export const CTAP_LEGACY_FOUNDER_MAILBOX = "myke@n86.app";

/** Humes AP switch — sent Mon 2026-08-24 from the ops mailbox. Do not re-send. */
export const CTAP_HUMES_MAILBOX_SWITCH = {
  status: "sent",
  sentOn: "2026-08-24",
  from: CTAP_OPS_MAILBOX,
  to: "accountspayable@humesdist.com",
} as const;

/**
 * Living-lab people. Karlee Sturtz and Ashley Holding are not on the floor.
 * Kenzy = bar FOH manager. Tom = BOH manager.
 */
export const CTAP_PEOPLE = {
  owner: "Mychael \"Myke\" Mueller",
  spouse: {
    name: "Kenzy Thompson",
    role: "wife; bar FOH manager; liquor/beer sheet + one-tap Hy-Vee — Myke is not in this loop",
  },
  foh: {
    name: "Kenzy Thompson",
    role: "bar FOH manager",
  },
  boh: {
    name: "Tom Dorothy",
    role: "BOH manager; kitchen; Northern Lights / Sawyer",
  },
} as const;

export type CtapVendorCadence = {
  vendorKey: string;
  displayName: string;
  /** Typical deliveries / invoices per week at CTAP. */
  timesPerWeek: { min: number; max: number };
  /** How documents usually arrive. */
  intakeMode: "email_pdf" | "photo_ocr" | "email_or_photo" | "outbound_email_order";
  notes?: string;
  /** Current known sender if email-based. */
  senderEmail?: string;
  /** Outbound order recipient when we place the order. */
  orderToEmail?: string;
  /** Cadence for outbound orders (Sun/Mon morning liquor run). */
  orderWindow?: string;
  mailbox: typeof CTAP_OPS_MAILBOX;
};

/**
 * Operator-stated CTAP vendor cadence (Fort Dodge). Photo vendors always need
 * OCR paraphrasers; email vendors should be pointed at CTAP_OPS_MAILBOX.
 */
export const CTAP_VENDOR_CADENCE: CtapVendorCadence[] = [
  {
    vendorKey: "sysco",
    displayName: "Sysco",
    timesPerWeek: { min: 1, max: 1 },
    intakeMode: "photo_ocr",
    notes:
      "Once weekly; typically photographed invoices. Mailbox switch SENT 2026-08-24 from communitypizza (operator confirmed). Do not re-send.",
    mailbox: CTAP_OPS_MAILBOX,
  },
  {
    vendorKey: "performance_foods",
    displayName: "Performance Foodservice / PFG",
    timesPerWeek: { min: 2, max: 2 },
    intakeMode: "email_or_photo",
    senderEmail: "NoReply@pfgc.com",
    orderToEmail: "scott.selim@pfgc.com",
    notes:
      "About twice weekly (Mon/Thu). Invoice mailer is NoReply@pfgc.com — do not send to that. Mailbox switch SENT 2026-08-24 from communitypizza to Scott Selim (operator confirmed). Do not re-send.",
    mailbox: CTAP_OPS_MAILBOX,
  },
  {
    vendorKey: "northern_lights",
    displayName: "Northern Lights",
    timesPerWeek: { min: 2, max: 8 },
    intakeMode: "photo_ocr",
    notes:
      "Usually 2x/week; can spike to 5–8 when they are in town. Photos + PDFs already land on communitypizza2026@gmail.com (Drive invoice Inv684607_2.pdf 2026-06-08). Do not send a mailbox switch.",
    mailbox: CTAP_OPS_MAILBOX,
  },
  {
    vendorKey: "sawyer_meats",
    displayName: "Sawyer Meats",
    timesPerWeek: { min: 2, max: 3 },
    intakeMode: "photo_ocr",
    notes: "2–3x/week; always photographs.",
    mailbox: CTAP_OPS_MAILBOX,
  },
  {
    vendorKey: "humes",
    displayName: "Humes Distributing",
    timesPerWeek: { min: 2, max: 2 },
    intakeMode: "email_pdf",
    senderEmail: "accountspayable@humesdist.com",
    notes:
      "Mailbox switch SENT 2026-08-24 from communitypizza2026@gmail.com to accountspayable@humesdist.com. Do not re-send. Next proof: Tue/Fri invoice PDFs land on communitypizza, not myke@n86.app.",
    mailbox: CTAP_OPS_MAILBOX,
  },
  {
    vendorKey: "hyvee_wine",
    displayName: "Hy-Vee Wine & Spirits",
    timesPerWeek: { min: 1, max: 1 },
    intakeMode: "outbound_email_order",
    orderWindow: "Sunday or Monday morning",
    notes:
      "Kenzy fills qty on the Google Sheet and checks SEND. Apps Script emails Hy-Vee from communitypizza. Myke is out. Order of record = qty>0 on the sheet (add Licor 43 Crème Brûlée as a row). One-time: Config!B1 = Hy-Vee email + install Code.gs as communitypizza.",
    mailbox: CTAP_OPS_MAILBOX,
  },
];

export type PosIntakeTarget = {
  key: string;
  displayName: string;
  priority: number;
  status: "live" | "next" | "planned";
  notes: string;
};

/**
 * POS + back-office silos to dial after PDQ. Differentiation vs MarginEdge is
 * Human Insight / next-action coaching for 1–3 unit operators — not another
 * invoice archive.
 */
export const INTAKE_STACK_TARGETS: PosIntakeTarget[] = [
  {
    key: "pdq",
    displayName: "PDQ POS",
    priority: 1,
    status: "live",
    notes: "Nightly Z-report PDF → communitypizza2026@gmail.com / Drive.",
  },
  {
    key: "toast",
    displayName: "Toast",
    priority: 2,
    status: "next",
    notes: "Highest independent density after regional PDQ installs.",
  },
  {
    key: "square",
    displayName: "Square",
    priority: 3,
    status: "next",
    notes: "Common for 1-unit; email/CSV closes.",
  },
  {
    key: "clover",
    displayName: "Clover",
    priority: 4,
    status: "next",
    notes: "SMB install base; nightly email summaries.",
  },
  {
    key: "aloha",
    displayName: "NCR Aloha",
    priority: 5,
    status: "next",
    notes: "Still dense in multi-decade independents.",
  },
  {
    key: "revel",
    displayName: "Revel",
    priority: 6,
    status: "next",
    notes: "iPad-forward independents / fast casual.",
  },
  {
    key: "skytab",
    displayName: "SkyTab / Shift4",
    priority: 7,
    status: "next",
    notes: "Growing displace-Toast installs.",
  },
  {
    key: "micros",
    displayName: "Oracle MICROS",
    priority: 8,
    status: "planned",
    notes: "Legacy + hotel F&B adjacency.",
  },
  {
    key: "marginedge",
    displayName: "MarginEdge",
    priority: 1,
    status: "next",
    notes:
      "Primary silo to beat: invoice OCR DB. We win on next-action Human Insight for crybaby 1–3 unit ops.",
  },
  {
    key: "r365",
    displayName: "Restaurant365",
    priority: 2,
    status: "planned",
    notes: "Accounting/ops suite — later Command-depth competitor, not day-1.",
  },
  {
    key: "7shifts",
    displayName: "7shifts",
    priority: 3,
    status: "planned",
    notes: "Labor silo; schedule ↔ sales coaching.",
  },
  {
    key: "hot_schedules",
    displayName: "HotSchedules",
    priority: 4,
    status: "planned",
    notes: "Labor silo still common in full service.",
  },
  {
    key: "sling",
    displayName: "Sling",
    priority: 5,
    status: "planned",
    notes: "Lightweight scheduling for true 1-unit shops.",
  },
];

export function vendorMailboxSwitchEmail(options: {
  to: string;
}): { to: string; subject: string; body: string } {
  return {
    to: options.to,
    subject: "Please start sending invoices here instead — Community Tap & Pizza",
    body: [
      "Hello,",
      "",
      "Please start sending invoices here instead:",
      "",
      "communitypizza2026@gmail.com",
      "",
      "(Stop using myke@n86.app for Community Tap & Pizza / Community Pizza invoices.)",
      "",
      "Thanks,",
      "Myke Mueller",
      "Community Tap & Pizza",
    ].join("\n"),
  };
}

export function humesRoutingSwitchEmail(options?: {
  to?: string;
  accountName?: string;
}): { to: string; subject: string; body: string } {
  return vendorMailboxSwitchEmail({
    to: options?.to ?? "accountspayable@humesdist.com",
  });
}

export const CTAP_PFG_MAILBOX_SWITCH = {
  status: "sent",
  sentOn: "2026-08-24",
  from: CTAP_OPS_MAILBOX,
  to: "scott.selim@pfgc.com",
  doNotSendTo: "NoReply@pfgc.com",
} as const;

export const CTAP_SYSCO_MAILBOX_SWITCH = {
  status: "sent",
  sentOn: "2026-08-24",
  from: CTAP_OPS_MAILBOX,
  to: null,
  note: "Operator confirmed sent 2026-08-24 from communitypizza. Consultant address not in Drive.",
} as const;

export const CTAP_NORTHERN_LIGHTS_MAILBOX = {
  status: "already_communitypizza",
  mailbox: CTAP_OPS_MAILBOX,
} as const;

/**
 * Target path: Kenzy one-tap on the Google Sheet. Myke is not in the loop.
 * 8/24 was still Excel → text → Myke (historical).
 */
export const CTAP_KENZY_LIQUOR_PATH = {
  fills: "google_sheet",
  toMyke: "none",
  outbound: "one-tap checkbox emails Hy-Vee from communitypizza",
  orderOfRecord: "sheet_qty_gt_0",
  mykeInLoop: false,
} as const;

/** VERIFIED send 2026-08-24 — Kenzy text, not Drive sheet. */
export const CTAP_HYVEE_SENT_2026_08_24 = {
  sentOn: "2026-08-24",
  from: CTAP_OPS_MAILBOX,
  source: "Kenzy Thompson Excel → text",
  lines: [
    "White Zin (Sutterhome) (1.5L) - 1",
    "Pinot Grigio (Beringer) (750ml) - 3",
    "Blackberry Brandy - 1",
    "Captain - 7",
    "Bacardi Limon - 1",
    "Malibu - 1",
    "Jose Cuervo Gold Tequila - 1",
    "Patron Silver - 1",
    "Hawkeye Vodka - 4",
    "Titos Vodka - 10",
    "Absolut - 1",
    "Smirnoff Vanilla - 1",
    "Smirnoff Raspberry - 2",
    "Smirnoff Peach - 1",
    "Black Velvet - 2",
    "Black Velvet Caramel - 1",
    "Canadian Club - 1",
    "Jameson - 1",
    "Jack Daniel’s - 1",
    "Fireball (1.75L) - 1",
    "Crown Peach - 2",
    "Crown Apple - 4",
    "Crown Royal - 1",
    "Peach Schnapps - 1",
    "Peppermint Schnapps (1.75L) - 2",
    "Watermelon Pucker - 1",
    "Cherry Mcguillicuddys - 2",
    "Rumplemintz - 1",
    "Kahlua - 1",
    "Baileys - 1",
    "Licor 43 - 1",
    "Licor 43 Crème Brûlée - 2",
    "Champagne (Ballatore) - 1",
  ],
} as const;

/** Live liquor ordering sheet Myke emails to Hy-Vee Wine Sun/Mon morning. */
export const CTAP_LIQUOR_ORDER_SHEET_ID =
  "1_gAesi5ufLOHsQ_uan3PEfzcOaVg4gxP8P7F_YHMHbU";

export function hyveeWineOrderEmail(options: {
  to: string;
  orderLines: string;
  total?: string;
}): { to: string; subject: string; body: string } {
  return {
    to: options.to,
    subject: "Community Tap & Pizza — weekly liquor order",
    body: [
      "Hi Hy-Vee Wine,",
      "",
      "Please fill this liquor order for Community Tap & Pizza (Fort Dodge):",
      "",
      options.orderLines,
      "",
      options.total ? `Order total (guide): ${options.total}` : "",
      "",
      "Thanks,",
      "Myke Mueller",
      "communitypizza2026@gmail.com",
    ]
      .filter(line => line !== undefined)
      .join("\n"),
  };
}
