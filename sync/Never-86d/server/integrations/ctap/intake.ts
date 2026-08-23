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

export type CtapVendorCadence = {
  vendorKey: string;
  displayName: string;
  /** Typical deliveries / invoices per week at CTAP. */
  timesPerWeek: { min: number; max: number };
  /** How documents usually arrive. */
  intakeMode: "email_pdf" | "photo_ocr" | "email_or_photo";
  notes?: string;
  /** Current known sender if email-based. */
  senderEmail?: string;
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
    notes: "Once weekly; typically photographed invoices.",
    mailbox: CTAP_OPS_MAILBOX,
  },
  {
    vendorKey: "performance_foods",
    displayName: "Performance Foodservice / PFG",
    timesPerWeek: { min: 2, max: 2 },
    intakeMode: "email_or_photo",
    senderEmail: "NoReply@pfgc.com",
    notes: "About twice weekly.",
    mailbox: CTAP_OPS_MAILBOX,
  },
  {
    vendorKey: "northern_lights",
    displayName: "Northern Lights",
    timesPerWeek: { min: 2, max: 8 },
    intakeMode: "photo_ocr",
    notes:
      "Usually 2x/week; can spike to 5–8 when they are in town. Always photos.",
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
      "Was routing to myke@n86.app — must switch delivery + parser mailbox to CTAP_OPS_MAILBOX.",
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

export function humesRoutingSwitchEmail(options?: {
  to?: string;
  accountName?: string;
}): { to: string; subject: string; body: string } {
  const to = options?.to ?? "accountspayable@humesdist.com";
  const account = options?.accountName ?? "Community Tap & Pizza / Community Pizza";
  return {
    to,
    subject: `Please update invoice email delivery — ${account}`,
    body: [
      "Hello Humes Accounts Payable,",
      "",
      `Please update the invoice email delivery address for ${account}.`,
      "",
      "STOP sending invoices to: myke@n86.app",
      "START sending all invoices / statements to: communitypizza2026@gmail.com",
      "",
      "This is our store operations mailbox. Going forward, all Humes invoices should land only at communitypizza2026@gmail.com so they flow into our daily intake.",
      "",
      "Please confirm when the change is complete.",
      "",
      "Thank you,",
      "Myke Mueller",
      "Community Tap & Pizza",
      "communitypizza2026@gmail.com",
    ].join("\n"),
  };
}
