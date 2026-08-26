import { describe, expect, it } from "vitest";
import {
  BAR_ROSTER,
  BAR_WEEK_SHIFTS,
  CTAP_ROSTER,
  DRIVER_ROSTER,
  KITCHEN_ROSTER,
  PAYROLL_ACCOUNTANT,
  NO_LONGER_ON_PAYROLL,
  namesOnPayroll,
  peopleAt,
  personInSystem,
} from "./index";

const BAR_NAMES = [
  "Mychael Mueller",
  "Jessica Gailey",
  "Kenzy Thompson",
  "Jeri Wilson",
  "Bryson Cook",
  "Kaillee Miller",
  "Samantha Swearingen",
  "Azaria Silvey",
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

  it("has posted times for the live bar week", () => {
    for (const name of BAR_NAMES) {
      expect(
        BAR_WEEK_SHIFTS.some((shift) => shift.name === name),
        `${name} missing from bar week 8/30–9/5`
      ).toBe(true);
    }
  });
});
