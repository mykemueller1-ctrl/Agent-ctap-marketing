import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { morningCloseFromText } from "./morning-close";

const fixtures = join(
  dirname(fileURLToPath(import.meta.url)),
  "../pdq/fixtures"
);

describe("morningCloseFromText", () => {
  it("reads 7/16 deposit off the Z and does not call a $0.93 till theft", () => {
    const raw = readFileSync(join(fixtures, "zreport-2026-07-16.txt"), "utf8");
    const { slice, artifact } = morningCloseFromText(raw, "fixture:7/16");
    expect(slice.expectedCash).toBeCloseTo(1600.93, 2);
    expect(slice.enteredDeposit).toBeCloseTo(1600, 2);
    expect(artifact.calls.some(c => c.domain === "cash")).toBe(false);
    expect(artifact.nextHuman).toMatch(/Myke/);
    expect(artifact.nextHuman).toMatch(/both missing/);
    expect(artifact.nextHuman).not.toMatch(/Gmail/i);
    expect(artifact.calls.some(c => c.domain === "labor" && c.kind === "pattern")).toBe(
      true
    );
  });

  it("flags 7/15 deposit short as pattern, not a missing field", () => {
    const raw = readFileSync(join(fixtures, "zreport-2026-07-15.txt"), "utf8");
    const { artifact } = morningCloseFromText(raw, "fixture:7/15");
    const cash = artifact.calls.find(c => c.domain === "cash");
    expect(cash?.kind).toBe("pattern");
    expect(cash?.reason).toMatch(/short/);
    expect(cash?.cannot).toMatch(/one number/);
  });
});
