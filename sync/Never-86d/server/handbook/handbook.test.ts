import { describe, expect, it } from "vitest";
import {
  BOUNCE_BANDS,
  FOH_STATIONS,
  HANDBOOK_OWNERS,
  HANDBOOK_RULES,
  HANDBOOK_VERSION,
  KITCHEN_COUNT_ZONES,
  KITCHEN_STATIONS,
  SHIFT_CHECKLISTS,
  bounceFor,
  bucketPrice,
  lookupRule,
  pourSpec,
  rulesFor,
  tokenMeaning,
  vendorsOn,
} from "./index";

describe("CTAP house handbook", () => {
  it("loads FOH, bar, and kitchen rules from Drive SOPs", () => {
    expect(HANDBOOK_VERSION).toBe("ctap-handbook-v1");
    expect(HANDBOOK_RULES.length).toBeGreaterThanOrEqual(12);
    expect(lookupRule("if-not-in-app")?.severity).toBe("hard");
    expect(lookupRule("foh-checklist-every-shift")?.owners).toEqual([
      HANDBOOK_OWNERS.kenzy,
    ]);
    expect(lookupRule("kitchen-portions")?.owners).toContain(HANDBOOK_OWNERS.tom);
    expect(
      SHIFT_CHECKLISTS.filter((item) => item.side === "foh").every(
        (item) => item.owner === HANDBOOK_OWNERS.kenzy
      )
    ).toBe(true);
    expect(SHIFT_CHECKLISTS.find((item) => item.id === "bar-close")?.owner).toBe(
      HANDBOOK_OWNERS.kenzy
    );
    const owners = HANDBOOK_RULES.flatMap((rule) => rule.owners ?? []);
    expect(owners).not.toContain("Karlee Sturtz");
    expect(owners).not.toContain("Ashley Holding");
    expect(rulesFor("bar").some((rule) => rule.id === "overpour-writeup")).toBe(
      true
    );
    expect(FOH_STATIONS).toContain("BAR SIDE");
    expect(KITCHEN_STATIONS).toContain("Fry Line");
    expect(KITCHEN_COUNT_ZONES).toContain("WALK-IN");
  });

  it("pays bounce on the house bands and nothing outside them", () => {
    expect(bounceFor("liquor", 19)).toBe(125);
    expect(bounceFor("liquor", 23)).toBe(75);
    expect(bounceFor("liquor", 28)).toBe(0);
    expect(bounceFor("beer", 24)).toBe(125);
    expect(bounceFor("beer", 27)).toBe(75);
    expect(bounceFor("food", 29)).toBe(250);
    expect(bounceFor("food", 32)).toBe(150);
    expect(bounceFor("food", 35)).toBe(0);
    expect(BOUNCE_BANDS.every((band) => band.dollars > 0)).toBe(true);
  });

  it("locks out-front pours, buckets, schedule tokens, and invoice days", () => {
    expect(pourSpec("shot")?.pourOz).toBe(1.5);
    expect(pourSpec("shot")?.glass).toMatch(/2 oz/i);
    expect(pourSpec("mixed-liquor")?.pourOz).toBe(1.75);
    expect(pourSpec("wine")?.pourOz).toBe(5);
    expect(bucketPrice("White Claw")).toBe(25);
    expect(bucketPrice("Skimmer")).toBe(30);
    expect(bucketPrice("Carbliss")).toBe(35);
    expect(tokenMeaning("OPEN")).toMatch(/first person cut/i);
    expect(tokenMeaning("RO")).toMatch(/Requested off/i);
    expect(vendorsOn("tuesday")).toEqual(["Northern Lights", "Performance"]);
    expect(vendorsOn("friday")).toContain("Sawyer");
    expect(SHIFT_CHECKLISTS.some((item) => item.id === "foh-close")).toBe(true);
    expect(SHIFT_CHECKLISTS.some((item) => item.id === "kitchen-close")).toBe(
      true
    );
  });
});
