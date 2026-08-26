import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildMenuInsights, lift, type MenuSeed } from "./menuMove";

const seed = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../public/data/ctap-menu.json"),
    "utf8"
  )
) as MenuSeed;

describe("proposed menu move from Drive", () => {
  it("does not treat the March doc as live POS", () => {
    expect(seed.status).toBe("PROPOSED");
    expect(seed.inPos).toBe(false);
    expect(seed.effective).toBeNull();
    expect(seed.itemsRemoved).toBe(14);
    const insights = buildMenuInsights(seed);
    expect(insights[0]?.title).toMatch(/PROPOSED/);
    expect(insights[0]?.detail).toMatch(/not treat these as live/);
  });

  it("keeps Tuesday Smash $11.99 separate from the menu plate", () => {
    const smash = seed.collisions.find(item => /smash/i.test(item.name));
    expect(smash).toMatchObject({ current: 13.99, proposed: 14.99 });
    expect(smash?.calendar).toMatch(/11\.99/);
    expect(lift(smash!)).toBeCloseTo(1);
  });
});
