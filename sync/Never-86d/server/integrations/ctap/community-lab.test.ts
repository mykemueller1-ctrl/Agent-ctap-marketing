import { describe, expect, it } from "vitest";
import {
  COMMUNITY_LAB,
  COMMUNITY_PEOPLE,
  COMMUNITY_ROLES,
  CTAP_PEOPLE,
  actionOwnerForLeak,
  communityLabCard,
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
  });
});
