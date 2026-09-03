import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildInsights,
  displayWindow,
  parseWideScheduleCsv,
} from "./parseSchedule";

const fixture = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../public/data/ctap-bar-schedule.csv"),
  "utf8"
);

describe("parseWideScheduleCsv — posted paper week 8/30–9/5", () => {
  it("reads the paper roster and keeps Karlee/Ashley off", () => {
    const parsed = parseWideScheduleCsv(fixture, "Bar Crew");
    expect(parsed.weekStart).toBe("2026-08-30");
    expect(parsed.weekEnd).toBe("2026-09-05");
    expect(parsed.employees).toContain("Mychael Mueller");
    expect(parsed.employees).toContain("Kenzy Thompson");
    expect(parsed.employees).toContain("Araya");
    expect(parsed.employees).toContain("Sydney");
    expect(parsed.employees).not.toContain("Ashley Holding");
    expect(parsed.employees).not.toContain("Karlee Sturtz");
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
    expect(mykeSun?.station).toBe("FOH");

    const jessicaSun = parsed.assignments.find(
      a => a.employee === "Jessica Gailey" && a.date === "2026-08-30"
    );
    expect(jessicaSun?.flags.requestedOff).toBe(true);

    const kenzySat = parsed.assignments.find(
      a => a.employee === "Kenzy Thompson" && a.date === "2026-09-05"
    );
    expect(kenzySat?.hours).toBe(7);
    expect(kenzySat?.station).toBe("BAR SIDE");

    const kenzyFri = parsed.assignments.find(
      a => a.employee === "Kenzy Thompson" && a.date === "2026-09-04"
    );
    expect(kenzyFri?.hours).toBe(8);
    expect(kenzyFri?.end).toBe("24:00");
    expect(kenzyFri?.flags.closes).toBe(true);

    const kenzyTue = parsed.assignments.find(
      a => a.employee === "Kenzy Thompson" && a.date === "2026-09-01"
    );
    expect(kenzyTue?.flags.firstCut).toBe(true);
    expect(kenzyTue?.incomplete).toBe(false);
    expect(displayWindow(kenzyTue!)).toBe("5:00 PM–OPEN");

    expect(
      parsed.assignments.some(
        a => a.employee === "Jessica Gailey" && a.date === "2026-09-04"
      )
    ).toBe(false);
  });

  it("flags Monday pizza-side hole and Sunday RO", () => {
    const insights = buildInsights(parseWideScheduleCsv(fixture));
    expect(
      insights.some(
        i => i.kind === "coverage" && i.date === "2026-08-31" && /pizza side/i.test(i.title)
      )
    ).toBe(true);
    expect(
      insights.some(
        i => i.kind === "requested-off" && i.date === "2026-08-30" && /Jessica/i.test(i.title)
      )
    ).toBe(true);
    expect(
      insights.some(
        i => i.kind === "requested-off" && i.date === "2026-09-05" && /Sydney/i.test(i.title)
      )
    ).toBe(true);
    expect(
      insights.some(
        i => i.kind === "incomplete" && /Kenzy|Kaillee|Araya|Lauren|Kaylee|Jeri/i.test(i.title)
      )
    ).toBe(false);
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
