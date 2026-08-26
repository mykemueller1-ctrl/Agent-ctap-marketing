/**
 * End-to-end demo: run the synced CTAP integration logic against real fixtures.
 *
 *   npm run demo
 *
 * Proves the flagship PDQ Z-report parser and the CTAP intake routing helpers
 * work standalone in this environment (no monorepo required).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  parsePdqZReportText,
  toDailySalesInsert,
} from "../sync/Never-86d/server/integrations/pdq/parser";
import {
  CTAP_OPS_MAILBOX,
  CTAP_PEOPLE,
  CTAP_VENDOR_CADENCE,
  humesRoutingSwitchEmail,
  vendorOrderOwner,
} from "../sync/Never-86d/server/integrations/ctap/intake";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = join(
  here,
  "../sync/Never-86d/server/integrations/pdq/fixtures/zreport-2026-07-16.txt"
);

function main(): void {
  const rawText = readFileSync(fixture, "utf8");

  console.log("=== PDQ Z-report parse (fixture: zreport-2026-07-16.txt) ===");
  const parsed = parsePdqZReportText(rawText);
  console.log(
    JSON.stringify(
      {
        parserVersion: parsed.parserVersion,
        businessDate: parsed.businessDate,
        confidence: parsed.confidence,
        needsReview: parsed.needsReview,
        warnings: parsed.warnings,
        grandTotal: parsed.grandTotal,
        tax: parsed.tax,
        orderCounts: parsed.orderCounts,
        categorySales: parsed.categorySales,
        labor: parsed.labor,
        discounts: parsed.discounts,
        cash: parsed.cash,
      },
      null,
      2
    )
  );

  console.log("\n=== Mapped daily_sales insert row ===");
  const row = toDailySalesInsert(parsed, {
    sourceProvider: "gmail",
    sourceMailbox: CTAP_OPS_MAILBOX,
    sourceMessageId: "demo-msg",
    sourceAttachmentHash: "demo-hash",
    dedupeKey: `pdq:${parsed.businessDate}:demo-hash`,
    rawText: "demo",
  });
  console.log(
    JSON.stringify(
      {
        businessDate: row?.businessDate,
        grandTotal: row?.grandTotal,
        totalQty: row?.totalQty,
        catFoodAmount: row?.catFoodAmount,
        catLargePizzasAmount: row?.catLargePizzasAmount,
        laborTotal: row?.laborTotal,
        parserVersion: row?.parserVersion,
        parserConfidence: row?.parserConfidence,
        needsReview: row?.needsReview,
      },
      null,
      2
    )
  );

  console.log("\n=== CTAP intake routing ===");
  console.log(`Ops mailbox: ${CTAP_OPS_MAILBOX}`);
  console.log(
    `Vendors tracked: ${CTAP_VENDOR_CADENCE.map(v => v.vendorKey).join(", ")}`
  );
  console.log(
    `FOH ${CTAP_PEOPLE.foh.name} · BOH ${CTAP_PEOPLE.boh.name} · Hy-Vee owner ${vendorOrderOwner("hyvee_wine")}`
  );
  const switchEmail = humesRoutingSwitchEmail();
  console.log("\nHumes mailbox-switch email draft:");
  console.log(`  to: ${switchEmail.to}`);
  console.log(`  subject: ${switchEmail.subject}`);

  const ok =
    parsed.businessDate === "2026-07-16" &&
    parsed.grandTotal === "4645.04" &&
    parsed.needsReview === false &&
    row?.totalQty === 168;
  console.log(`\nDemo self-check: ${ok ? "PASS" : "FAIL"}`);
  if (!ok) process.exit(1);
}

main();
