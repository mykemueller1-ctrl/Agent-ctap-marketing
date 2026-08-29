import { describe, expect, it } from "vitest";
import {
  COMMUNITY_LAB,
  COMMUNITY_PEOPLE,
  COMMUNITY_ROLES,
  CTAP_PEOPLE,
  actionOwnerForLeak,
  communityLabCard,
  floorCrew,
  personOnFloor,
} from "./community-lab";

describe("Community Lab", () => {
  it("is Community Tap & Pizza under Never 86'd, not a second brand", () => {
    expect(COMMUNITY_LAB.id).toBe("community-lab");
    expect(COMMUNITY_LAB.storeName).toBe("Community Tap & Pizza");
    expect(COMMUNITY_LAB.publicBrand).toBe("Never 86'd");
    expect(COMMUNITY_LAB.mechanic).toBe("Action Shift");
    expect(COMMUNITY_LAB.mailbox).toBe("communitypizza2026@gmail.com");
  });

  it("locks Kenzy front and Tom back; Karlee and Ashley off the floor", () => {
    expect(CTAP_PEOPLE.foh.name).toBe("Kenzy Thompson");
    expect(CTAP_PEOPLE.boh.name).toBe("Tom Dorothy");
    const karlee = COMMUNITY_PEOPLE.find(p => p.id === "karlee");
    const ashley = COMMUNITY_PEOPLE.find(p => p.id === "ashley");
    expect(karlee?.status).toBe("not_on_floor");
    expect(ashley?.status).toBe("not_on_floor");
    expect(personOnFloor().map(p => p.name).join(" ")).not.toMatch(
      /Karlee|Ashley/
    );
  });

  it("routes bar leaks to Kenzy and food leaks to Tom", () => {
    expect(actionOwnerForLeak("liquor").person.id).toBe("kenzy");
    expect(actionOwnerForLeak("beer").person.id).toBe("kenzy");
    expect(actionOwnerForLeak("food").person.id).toBe("tom");
    expect(actionOwnerForLeak("kitchen_specials").person.id).toBe("tom");
    expect(actionOwnerForLeak("prime").person.id).toBe("myke");
    expect(actionOwnerForLeak("3p").person.id).toBe("myke");
  });

  it("maps PDQ job names onto houses", () => {
    const fohJobs = COMMUNITY_ROLES.filter(r => r.house === "front").flatMap(
      r => r.pdqJobNames
    );
    const bohJobs = COMMUNITY_ROLES.filter(r => r.house === "back").flatMap(
      r => r.pdqJobNames
    );
    expect(fohJobs).toEqual(
      expect.arrayContaining(["Bartender", "Server", "Driver", "Ctap Manger"])
    );
    expect(bohJobs).toEqual(
      expect.arrayContaining(["Pizza Maker", "Fry Line", "Dishwasher"])
    );
  });

  it("prints a lab card agents can paste", () => {
    const card = communityLabCard();
    expect(card).toMatch(/Kenzy Thompson/);
    expect(card).toMatch(/Tom Dorothy/);
    expect(card).toMatch(/Do not put Karlee/);
    expect(card).toMatch(/Jessica Gailey — Bartender \[VERIFIED\]/);
    expect(card).toMatch(/Gavin Noore — Server \[presence VERIFIED, job ESTIMATED\]/);
    expect(card).toMatch(/Ping Myke Mueller only/);
  });

  it("locks the six crew as still on the floor (operator 2026-08-26)", () => {
    const names = floorCrew().map(p => p.name);
    expect(names).toEqual([
      "Jessica Gailey",
      "Che Lyftogt",
      "Gavin Noore",
      "Moe Thomas",
      "Sally Hart",
      "Bryson Cook",
    ]);
    for (const p of floorCrew()) {
      expect(p.sourceTag).toBe("VERIFIED");
      expect(p.confirmedOn).toBe("2026-08-26");
      expect(p.status).toBe("on_floor");
    }
    const jessica = COMMUNITY_PEOPLE.find(p => p.id === "jessica");
    const che = COMMUNITY_PEOPLE.find(p => p.id === "che");
    expect(jessica?.roleId).toBe("bartender");
    expect(jessica?.roleSourceTag).toBe("VERIFIED");
    expect(che?.roleId).toBe("bartender");
    expect(che?.roleSourceTag).toBe("VERIFIED");
    for (const id of ["gavin", "moe", "sally", "bryson"]) {
      expect(COMMUNITY_PEOPLE.find(p => p.id === id)?.roleSourceTag).toBe(
        "ESTIMATED"
      );
    }
  });
});
