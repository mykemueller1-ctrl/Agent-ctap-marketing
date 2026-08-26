import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildInsights,
  parseWideScheduleCsv,
} from "./parseSchedule";

const fixture = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../public/data/ctap-bar-schedule.csv"),
  "utf8"
);

describe("parseWideScheduleCsv — CTAP bar week from Drive", () => {
  it("reads the posted 8/30–9/5 week", () => {
    const parsed = parseWideScheduleCsv(fixture, "Bar Crew");
    expect(parsed.weekStart).toBe("2026-08-30");
    expect(parsed.weekEnd).toBe("2026-09-05");
    expect(parsed.employees).toContain("Mychael Mueller");
    expect(parsed.employees).toContain("Ashley Holding");
    expect(parsed.dates).toHaveLength(7);
  });

  it("keeps Open / Close / RO tokens as flags", () => {
    const parsed = parseWideScheduleCsv(fixture);
    const mykeSun = parsed.assignments.find(
      a => a.employee === "Mychael Mueller" && a.date === "2026-08-30"
    );
    expect(mykeSun?.flags.opens).toBe(true);
    expect(mykeSun?.start).toBe("07:00");
    expect(mykeSun?.end).toBe("08:00");
    expect(mykeSun?.station).toBe("BAR SIDE");

    const jessicaSun = parsed.assignments.find(
      a => a.employee === "Jessica Gailey" && a.date === "2026-08-30"
    );
    expect(jessicaSun?.flags.requestedOff).toBe(true);

    const kenzyThu = parsed.assignments.find(
      a => a.employee === "Kenzy Thompson" && a.date === "2026-09-03"
    );
    expect(kenzyThu?.hours).toBe(9);

    const ashleyTue = parsed.assignments.find(
      a => a.employee === "Ashley Holding" && a.date === "2026-09-01"
    );
    expect(ashleyTue?.flags.closes).toBe(false);
    expect(ashleyTue?.end).toBe("22:00");

    const kenzyFri = parsed.assignments.find(
      a => a.employee === "Kenzy Thompson" && a.date === "2026-09-04"
    );
    expect(kenzyFri?.hours).toBe(8);
    expect(kenzyFri?.end).toBe("24:00");
  });

  it("flags Monday as a coverage hole and Sunday RO", () => {
    const insights = buildInsights(parseWideScheduleCsv(fixture));
    expect(
      insights.some(
        i => i.kind === "coverage" && i.date === "2026-08-31" && /pizza side/i.test(i.title)
      )
    ).toBe(true);
    expect(
      insights.some(
        i => i.kind === "thin-day" && i.date === "2026-08-31"
      )
    ).toBe(true);
    expect(
      insights.some(
        i => i.kind === "requested-off" && i.date === "2026-08-30" && /Jessica/i.test(i.title)
      )
    ).toBe(true);
  });
});

describe("kitchen / driver Drive templates", () => {
  it("treats the Feb kitchen sheet as names with no times", () => {
    const csv = readFileSync(
      join(
        dirname(fileURLToPath(import.meta.url)),
        "../public/data/ctap-kitchen-schedule.csv"
      ),
      "utf8"
    );
    const parsed = parseWideScheduleCsv(csv, "Kitchen");
    expect(parsed.employees).toContain("Thomas Dorothy");
    expect(parsed.assignments).toHaveLength(0);
    const insights = buildInsights(parsed);
    expect(insights[0]?.title).toMatch(/no times posted/);
  });
});
