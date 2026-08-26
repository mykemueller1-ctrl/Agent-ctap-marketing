/**
 * Nightly CTAP loop — what this computer can actually run tonight.
 * Gmail and Document AI stay blocked until Myke connects them on desktop.
 */

export type LoopStatus = "ready" | "blocked" | "hold" | "sent";

export type LoopStep = {
  id: string;
  title: string;
  status: LoopStatus;
  detail: string;
};

export type NightlyInput = {
  pdq: { businessDate: string; grandTotal: string; laborPct: number } | null;
  buy: { sendCount: number; holdCount: number; combined: number; mykeInLoop: boolean };
  calendar: {
    smashPrice: string;
    pizzaDay: string;
    drinkApproved: boolean;
    foodNamed: boolean;
  };
  invoicePhotos: number;
  gmailConnected: boolean;
  ocrConfigured: boolean;
};

export type NightlyReport = {
  asOf: string;
  mailbox: string;
  nextHuman: string;
  steps: LoopStep[];
};

export function buildNightlyReport(
  input: NightlyInput,
  asOf = "2026-08-24"
): NightlyReport {
  const steps: LoopStep[] = [
    {
      id: "gmail",
      title: "Pull PDQ / PFG / Humes from Gmail",
      status: input.gmailConnected ? "ready" : "blocked",
      detail: input.gmailConnected
        ? "Gmail MCP connected as communitypizza2026@gmail.com."
        : "Gmail MCP needsAuth. Connect in Cursor Desktop as communitypizza2026@gmail.com. This VM cannot finish Google login.",
    },
    {
      id: "pdq",
      title: "Parse last PDQ Z",
      status: input.pdq ? "ready" : "blocked",
      detail: input.pdq
        ? `${input.pdq.businessDate} grand $${input.pdq.grandTotal}, labor ${input.pdq.laborPct.toFixed(1)}%. No Aug 16–22 Zs in Drive.`
        : "No Z fixture. Gmail is where nightly PDQs land.",
    },
    {
      id: "buy",
      title: "Kenzy Hy-Vee one-tap",
      status: input.buy.mykeInLoop ? "hold" : "ready",
      detail: input.buy.mykeInLoop
        ? "Myke is still in the liquor email loop — should not be."
        : `Send ${input.buy.sendCount} volume/keg lines, hold ${input.buy.holdCount}. Par-fill $${input.buy.combined.toFixed(2)} is not the send. Kenzy checks SEND on the sheet. Myke is out.`,
    },
    {
      id: "calendar",
      title: "September calendar library",
      status: input.calendar.foodNamed && input.calendar.drinkApproved ? "ready" : "hold",
      detail: `Smash Burger $${input.calendar.smashPrice}. Pizza GOES UP ${input.calendar.pizzaDay}. Drink ${
        input.calendar.drinkApproved ? "approved" : "not approved"
      }. Tom food ${input.calendar.foodNamed ? "named" : "still blank"}. Do not email Humes.`,
    },
    {
      id: "invoices",
      title: "Book 8/16–8/22 photos",
      status: input.ocrConfigured ? "ready" : "blocked",
      detail: `${input.invoicePhotos} HEICs in Drive. Document AI ${
        input.ocrConfigured ? "is configured" : "secrets are not in this repo"
      }.`,
    },
  ];

  const gmail = steps.find(step => step.id === "gmail" && step.status === "blocked");
  const blocked = steps.filter(step => step.status === "blocked");
  const nextHuman = gmail
    ? "Connect Gmail in Cursor Desktop as communitypizza2026@gmail.com — then the nightly PDQ/PFG/Humes pull can run."
    : blocked.length
      ? blocked[0]!.detail
      : "No blocked steps. Humans only approve sends.";

  return {
    asOf,
    mailbox: "communitypizza2026@gmail.com",
    nextHuman,
    steps,
  };
}
