import { describe, expect, it } from "vitest";
import {
  BAR_ROSTER,
  BAR_WEEK_EVENTS,
  BAR_WEEK_SHIFTS,
  BAR_WEEK_SOURCE,
  CTAP_ROSTER,
  DRIVER_ROSTER,
  KITCHEN_ROSTER,
  PAYROLL_ACCOUNTANT,
  NO_LONGER_ON_PAYROLL,
  REQUESTED_OFF,
  namesOnPayroll,
  peopleAt,
  personInSystem,
} from "./index";

const BAR_NAMES = [
  "Mychael Mueller",
  "Jessica Gailey",
  "Kenzy Thompson",
  "Bryson Cook",
  "Jeri Wilson",
  "Kaillee Miller",
  "Samantha Swearingen",
  "Sydney",
  "Araya",
  "Shantera",
  "Kaylee S.",
  "Lauren",
];

const KITCHEN_NAMES = [
  "Thomas Dorothy",
  "Moe Thomas",
  "Che Lyftogt",
  "Ryan Berg",
  "Steven Klein",
  "Aundrik Roast",
  "Aundry Roast",
  "Nash Wheaton",
  "Brodey Laughman",
  "Max George",
  "Dustin Stein",
  "Doc",
  "Ian Ebelsheiser",
  "Jacob Lawton",
  "Gavin Nore",
  "Matt Jones",
  "Kyler Preston",
  "Ben Mason",
];

const DRIVER_NAMES = [
  "Kim Pratt",
  "Bryce Delany",
  "Nate Lowrey",
  "Stephen Wheaton",
  "Aidan",
];

describe("CTAP people roster", () => {
  it("puts every bar, kitchen, and driver name in the system once", () => {
    expect(BAR_ROSTER.map((person) => person.name)).toEqual(BAR_NAMES);
    expect(KITCHEN_ROSTER.map((person) => person.name)).toEqual(KITCHEN_NAMES);
    expect(DRIVER_ROSTER.map((person) => person.name)).toEqual(DRIVER_NAMES);
    expect(namesOnPayroll()).toHaveLength(
      BAR_NAMES.length + KITCHEN_NAMES.length + DRIVER_NAMES.length
    );
    expect(new Set(CTAP_ROSTER.map((person) => person.id)).size).toBe(
      CTAP_ROSTER.length
    );
    expect(PAYROLL_ACCOUNTANT.email).toBe("cfmapayroll@yahoo.com");
    expect(personInSystem("Kinsey")?.name).toBe("Kenzy Thompson");
    expect(personInSystem("Karlee Sturtz")).toBeUndefined();
    expect(personInSystem("Ashley Holding")).toBeUndefined();
    expect(NO_LONGER_ON_PAYROLL).toEqual(["Karlee Sturtz", "Ashley Holding"]);
  });

  it("treats Mike Mueller and Matt Jones as one person each", () => {
    expect(personInSystem("Mike Mueller")?.name).toBe("Mychael Mueller");
    expect(personInSystem("Mychael Mueller")?.station).toBe("ops");
    expect(peopleAt("kitchen").some((person) => person.name === "Mychael Mueller")).toBe(
      true
    );
    expect(KITCHEN_ROSTER.some((person) => person.name === "Mychael Mueller")).toBe(
      false
    );
    expect(personInSystem("Matt Jones")?.alsoStations).toEqual(["driver"]);
    expect(DRIVER_ROSTER.some((person) => person.name === "Matt Jones")).toBe(false);
    expect(peopleAt("driver").some((person) => person.name === "Matt Jones")).toBe(
      true
    );
  });

  it("has posted times or requested-off for everyone on the paper roster", () => {
    for (const name of BAR_NAMES) {
      const worked = BAR_WEEK_SHIFTS.some((shift) => shift.name === name);
      const off = REQUESTED_OFF.some((item) => item.name === name);
      expect(worked || off, `${name} missing from paper week 8/30–9/5`).toBe(
        true
      );
    }
    expect(BAR_WEEK_SHIFTS.every((shift) => BAR_NAMES.includes(shift.name))).toBe(
      true
    );
  });

  it("uses the posted paper week, not the old Drive sheet", () => {
    expect(BAR_WEEK_SOURCE).toBe("paper-posted-week");
    expect(
      BAR_WEEK_SHIFTS.some(
        (shift) =>
          shift.name === "Kenzy Thompson" &&
          shift.date === "2026-09-05" &&
          shift.start === "10:00 AM" &&
          shift.end === "5:00 PM" &&
          shift.station === "BAR SIDE"
      )
    ).toBe(true);
    expect(
      BAR_WEEK_SHIFTS.some(
        (shift) =>
          shift.name === "Jessica Gailey" && shift.date === "2026-09-04"
      )
    ).toBe(false);
    expect(
      BAR_WEEK_SHIFTS.some(
        (shift) => /Karlee|Ashley/.test(shift.name)
      )
    ).toBe(false);
    expect(personInSystem("Azaria Silvey")?.name).toBe("Araya");
    expect(personInSystem("Kailee M.")?.name).toBe("Kaillee Miller");
    expect(
      BAR_WEEK_SHIFTS.some((shift) => shift.name === "Sydney")
    ).toBe(false);
    expect(
      REQUESTED_OFF.some(
        (item) => item.name === "Sydney" && item.date === "2026-09-05"
      )
    ).toBe(true);
    expect(BAR_WEEK_EVENTS.map((item) => item.label)).toEqual([
      "Home Dodger football game",
      "Hawk game 3:15",
      "Party of 80 at 2 p.m.",
    ]);
  });
});
