/**
 * Morning close. One command. Logic, not clicks.
 *
 *   npm run close
 *   npm run close -- path/to/z.txt
 *
 * Parses a PDQ Z, runs closeLooksWrong, prints the card, writes
 * portal/public/data/ctap-close.json. Does not send mail.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { morningCloseFromText } from "../sync/Never-86d/server/integrations/ctap/morning-close";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const fixtureDir = join(root, "sync/Never-86d/server/integrations/pdq/fixtures");

function defaultZPath(): string {
  const files = readdirSync(fixtureDir)
    .filter(f => /^zreport-\d{4}-\d{2}-\d{2}\.txt$/.test(f))
    .sort();
  const last = files[files.length - 1] ?? "zreport-2026-07-16.txt";
  return join(fixtureDir, last);
}

function main(): void {
  const arg = process.argv.slice(2).find(a => !a.startsWith("-"));
  const zPath = arg ? resolve(arg) : defaultZPath();
  const raw = readFileSync(zPath, "utf8");
  const source = relative(root, zPath) || zPath;
  const { parsed, artifact } = morningCloseFromText(raw, source);

  const dest = join(root, "portal/public/data/ctap-close.json");
  writeFileSync(dest, `${JSON.stringify(artifact, null, 2)}\n`);

  console.log("=== Morning close ===");
  console.log(`Source: ${source}`);
  console.log(
    `Z ${parsed.businessDate ?? "unknown"} · grand $${parsed.grandTotal ?? "?"} · expected cash $${parsed.cash.expectedCash ?? "?"} · deposit $${parsed.cash.actualDeposit ?? "missing"}`
  );
  console.log("");
  console.log(artifact.card);
  console.log("");
  console.log(`Next human: ${artifact.nextHuman}`);
  console.log(`Wrote ${dest}`);

  const is716 = (parsed.businessDate ?? "") === "2026-07-16";
  const ok = is716
    ? parsed.grandTotal === "4645.04" &&
      parsed.cash.actualDeposit === "1600.00" &&
      /Myke/.test(artifact.nextHuman) &&
      /both missing/.test(artifact.nextHuman) &&
      !artifact.calls.some(c => c.domain === "cash")
    : Boolean(parsed.businessDate);
  console.log(`\nClose self-check: ${ok ? "PASS" : "FAIL"}`);
  if (!ok) process.exit(1);
}

main();
