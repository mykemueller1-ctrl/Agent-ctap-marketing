/**
 * Nightly CTAP loop — what this computer can run without Gmail.
 *
 *   npm run nightly
 *
 * Parses the last PDQ fixture, takes the Buy send/hold call, checks the
 * September library, and writes portal/public/data/ctap-nightly.json.
 * Does not send mail.
 */
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parsePdqZReportText } from "../sync/Never-86d/server/integrations/pdq/parser";
import {
  CTAP_OPS_MAILBOX,
  CTAP_PEOPLE,
  vendorOrderOwner,
} from "../sync/Never-86d/server/integrations/ctap/intake";
import { kenzyHyveeEmail, liquorQtyLines } from "../sync/Never-86d/server/integrations/ctap/hyvee-one-click";
import { DEFAULT_RECURRING_LIBRARY } from "../sync/Never-86d/server/calendar/library";
import { parseTicketDate } from "../sync/Never-86d/server/integrations/evidence/week-window";
import { buildNightlyReport } from "../sync/Never-86d/server/ctap-loop/nightly";
import { combinedTotal, withActions, type BuySeed } from "../portal/src/buyWeek";
import {
  smashBurger,
  thursdayPizza,
  type CalendarSeed,
} from "../portal/src/calendarMonth";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

function main(): void {
  const zText = readFileSync(
    join(root, "sync/Never-86d/server/integrations/pdq/fixtures/zreport-2026-07-16.txt"),
    "utf8"
  );
  const parsed = parsePdqZReportText(zText);
  const laborPct = Number(parsed.labor.pct ?? 0);

  const buy = JSON.parse(
    readFileSync(join(root, "portal/public/data/ctap-buy.json"), "utf8")
  ) as BuySeed;
  const calendar = JSON.parse(
    readFileSync(join(root, "portal/public/data/ctap-calendar.json"), "utf8")
  ) as CalendarSeed;
  const tagged = withActions([...buy.liquor.lines, ...buy.beer.lines]).filter(
    line => line.qty > 0
  );

  const smash = smashBurger(calendar);
  const pizza = thursdayPizza(calendar);
  const report = buildNightlyReport({
    pdq: {
      businessDate: parsed.businessDate ?? "unknown",
      grandTotal: parsed.grandTotal ?? "0",
      laborPct,
    },
    buy: {
      sendCount: tagged.filter(line => line.action === "send").length,
      holdCount: tagged.filter(line => line.action === "hold").length,
      combined: combinedTotal(buy),
      mykeInLoop: buy.mykeInLoop,
    },
    calendar: {
      smashPrice: smash?.price ?? "11.99",
      pizzaDay: pizza?.day ?? "Thursday",
      drinkApproved: calendar.drink.approved,
      foodNamed: Boolean(calendar.food.name),
    },
    invoicePhotos: 32,
    gmailConnected: false,
    ocrConfigured: false,
  });

  const draft = kenzyHyveeEmail({
    to: "wine@example.invalid",
    lines: liquorQtyLines(
      buy.liquor.lines.map(line => ({ name: line.name, qty: line.qty }))
    ),
  });

  const out = {
    ...report,
    people: {
      foh: CTAP_PEOPLE.foh.name,
      boh: CTAP_PEOPLE.boh.name,
      hyveeOwner: vendorOrderOwner("hyvee_wine"),
      foodOwner: vendorOrderOwner("sysco"),
    },
    library: {
      smash: DEFAULT_RECURRING_LIBRARY.find(item => item.libraryId === "tuesday-smashburger")
        ?.price,
      pizzaDay: DEFAULT_RECURRING_LIBRARY.find(
        item => item.libraryId === "thursday-medium-pizza"
      )?.dayOfWeek,
    },
    fridayBeerDate: parseTicketDate("Friday, Aug 21, 2026"),
    kenzyDraftSigns: draft.body.includes("Kenzy Thompson") && !/Myke/.test(draft.body),
    mailbox: CTAP_OPS_MAILBOX,
  };

  const dest = join(root, "portal/public/data/ctap-nightly.json");
  writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);

  console.log("=== Nightly CTAP loop ===");
  console.log(`Mailbox: ${out.mailbox}`);
  console.log(`FOH ${out.people.foh} · BOH ${out.people.boh}`);
  console.log(`Smash $${out.library.smash} · pizza ${out.library.pizzaDay}`);
  console.log(`Friday beer date parse: ${out.fridayBeerDate}`);
  console.log(`Kenzy draft signs Kenzy not Myke: ${out.kenzyDraftSigns}`);
  for (const step of report.steps) {
    console.log(`  [${step.status}] ${step.title} — ${step.detail}`);
  }
  console.log(`\nNext human: ${report.nextHuman}`);
  console.log(`Wrote ${dest}`);

  const ok =
    parsed.grandTotal === "4645.04" &&
    buy.mykeInLoop === false &&
    smash?.price === "11.99" &&
    pizza?.day === "Thursday" &&
    out.fridayBeerDate === "2026-08-21" &&
    out.kenzyDraftSigns;
  console.log(`\nNightly self-check: ${ok ? "PASS" : "FAIL"}`);
  if (!ok) process.exit(1);
}

main();
