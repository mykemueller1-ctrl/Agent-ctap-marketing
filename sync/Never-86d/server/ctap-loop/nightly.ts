/**
 * Nightly CTAP loop — what this computer can actually run tonight.
 * Gmail / OCR / Pages are machine-local. Do not make those the next human.
 */

import type { CloseCall } from "../integrations/ctap/close-looks-wrong";
import { closeNextHuman } from "../integrations/ctap/close-looks-wrong";
import { founderRuleLine } from "../integrations/ctap/founder-ping";

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
  closeCalls?: CloseCall[];
};

export type NightlyReport = {
  asOf: string;
  mailbox: string;
  nextHuman: string;
  founderRule: string;
  steps: LoopStep[];
};

export function buildNightlyReport(
  input: NightlyInput,
  asOf = "2026-08-24"
): NightlyReport {
  const closeCalls = input.closeCalls ?? [];
  const steps: LoopStep[] = [
    {
      id: "gmail",
      title: "Pull PDQ / PFG / Humes from Gmail",
      status: input.gmailConnected ? "ready" : "blocked",
      detail: input.gmailConnected
        ? "Gmail MCP connected as communitypizza2026@gmail.com."
        : "Gmail is machine-local. This desk cannot connect it. Morning parse uses the Z we already have.",
    },
    {
      id: "pdq",
      title: "Parse last PDQ Z",
      status: input.pdq ? "ready" : "blocked",
      detail: input.pdq
        ? `${input.pdq.businessDate} grand $${input.pdq.grandTotal}, labor ${input.pdq.laborPct.toFixed(1)}%.`
        : "No Z on this close. Missing Evidence, not $0 sales.",
    },
    {
      id: "close",
      title: "Close looks wrong",
      status: closeCalls.length
        ? closeCalls.some(c => c.kind === "pattern")
          ? "hold"
          : "blocked"
        : input.pdq
          ? "ready"
          : "blocked",
      detail: closeCalls.length
        ? closeCalls
            .slice(0, 3)
            .map(c => `${c.ownerName}: ${c.reason}`)
            .join(" ")
        : input.pdq
          ? "Nothing to flag on this slice. Still pattern, not a clean bill of health."
          : "No Z, so no close call.",
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
      detail: `${input.invoicePhotos} HEICs in Drive. OCR is machine-local. Cost % waits on invoices + Z for the same day.`,
    },
  ];

  const hold = steps.find(step => step.status === "hold" && step.id !== "close");
  const nextHuman = closeCalls.length
    ? closeNextHuman(closeCalls)
    : hold
      ? hold.detail
      : founderRuleLine();

  return {
    asOf,
    mailbox: "communitypizza2026@gmail.com",
    nextHuman,
    founderRule: founderRuleLine(),
    steps,
  };
}
