import { describe, expect, it } from "vitest";
import {
  CTAP_HUMES_MAILBOX_SWITCH,
  CTAP_HYVEE_SENT_2026_08_24,
  CTAP_KENZY_LIQUOR_PATH,
  CTAP_NORTHERN_LIGHTS_MAILBOX,
  CTAP_OPS_MAILBOX,
  CTAP_PEOPLE,
  CTAP_PFG_MAILBOX_SWITCH,
  CTAP_SYSCO_MAILBOX_SWITCH,
  CTAP_VENDOR_CADENCE,
  INTAKE_STACK_TARGETS,
  vendorMailboxSwitchEmail,
} from "./intake";
import { HUMES_MAILBOX } from "../vendors/humes";
import { PDQ_MAILBOX } from "../pdq/detector";

describe("CTAP intake routing", () => {
  it("routes PDQ and Humes to the same ops mailbox", () => {
    expect(CTAP_OPS_MAILBOX).toBe("communitypizza2026@gmail.com");
    expect(PDQ_MAILBOX).toBe(CTAP_OPS_MAILBOX);
    expect(HUMES_MAILBOX).toBe(CTAP_OPS_MAILBOX);
  });

  it("captures operator vendor cadence including photo-first distributors", () => {
    const keys = CTAP_VENDOR_CADENCE.map(v => v.vendorKey);
    expect(keys).toEqual(
      expect.arrayContaining([
        "sysco",
        "performance_foods",
        "northern_lights",
        "sawyer_meats",
        "humes",
      ])
    );
    const northern = CTAP_VENDOR_CADENCE.find(
      v => v.vendorKey === "northern_lights"
    );
    expect(northern?.timesPerWeek.max).toBe(8);
    expect(northern?.intakeMode).toBe("photo_ocr");
    expect(northern?.notes).toMatch(/already land on communitypizza/);
    expect(CTAP_NORTHERN_LIGHTS_MAILBOX.status).toBe("already_communitypizza");
    const sawyer = CTAP_VENDOR_CADENCE.find(v => v.vendorKey === "sawyer_meats");
    expect(sawyer?.intakeMode).toBe("photo_ocr");
  });

  it("records Humes AP switch as sent from communitypizza Gmail", () => {
    expect(CTAP_HUMES_MAILBOX_SWITCH.status).toBe("sent");
    expect(CTAP_HUMES_MAILBOX_SWITCH.from).toBe(CTAP_OPS_MAILBOX);
    expect(CTAP_HUMES_MAILBOX_SWITCH.to).toBe("accountspayable@humesdist.com");
    const humes = CTAP_VENDOR_CADENCE.find(v => v.vendorKey === "humes");
    expect(humes?.notes).toMatch(/SENT 2026-08-24/);
  });

  it("drafts the same mailbox switch for PFG Scott Selim, not NoReply", () => {
    expect(CTAP_PFG_MAILBOX_SWITCH.status).toBe("sent");
    expect(CTAP_PFG_MAILBOX_SWITCH.to).toBe("scott.selim@pfgc.com");
    expect(CTAP_PFG_MAILBOX_SWITCH.doNotSendTo).toBe("NoReply@pfgc.com");
    const draft = vendorMailboxSwitchEmail({ to: CTAP_PFG_MAILBOX_SWITCH.to });
    expect(draft.body).toContain("communitypizza2026@gmail.com");
    expect(draft.body).toContain("myke@n86.app");
    const pfg = CTAP_VENDOR_CADENCE.find(v => v.vendorKey === "performance_foods");
    expect(pfg?.orderToEmail).toBe("scott.selim@pfgc.com");
  });

  it("records Sysco mailbox switch as sent from communitypizza", () => {
    expect(CTAP_SYSCO_MAILBOX_SWITCH.status).toBe("sent");
    expect(CTAP_SYSCO_MAILBOX_SWITCH.from).toBe(CTAP_OPS_MAILBOX);
  });

  it("keeps 8/24 Kenzy text as historical send and one-tap as the live path", () => {
    expect(CTAP_KENZY_LIQUOR_PATH.fills).toBe("google_sheet");
    expect(CTAP_KENZY_LIQUOR_PATH.toMyke).toBe("none");
    expect(CTAP_KENZY_LIQUOR_PATH.mykeInLoop).toBe(false);
    expect(CTAP_HYVEE_SENT_2026_08_24.lines).toEqual(
      expect.arrayContaining([
        "Titos Vodka - 10",
        "Licor 43 - 1",
        "Licor 43 Crème Brûlée - 2",
        "Champagne (Ballatore) - 1",
      ])
    );
    expect(CTAP_HYVEE_SENT_2026_08_24.lines).toHaveLength(33);
  });

  it("includes Hy-Vee Wine Sun/Mon liquor order cadence", () => {
    const hyvee = CTAP_VENDOR_CADENCE.find(v => v.vendorKey === "hyvee_wine");
    expect(hyvee?.intakeMode).toBe("outbound_email_order");
    expect(hyvee?.orderWindow).toMatch(/Sunday or Monday/i);
    expect(hyvee?.notes).toMatch(/Myke is out/);
  });

  it("names Kenzy as bar FOH manager and Tom as BOH manager", () => {
    expect(CTAP_PEOPLE.spouse.name).toBe("Kenzy Thompson");
    expect(CTAP_PEOPLE.foh.name).toBe("Kenzy Thompson");
    expect(CTAP_PEOPLE.foh.owns).toEqual(
      expect.arrayContaining([
        "beer orders",
        "liquor orders",
        "drink specials",
        "FOH staffing",
      ])
    );
    expect(CTAP_PEOPLE.boh.name).toBe("Tom Dorothy");
    expect(CTAP_PEOPLE.boh.owns).toEqual(
      expect.arrayContaining([
        "food vendor orders",
        "kitchen specials",
        "BOH staffing",
      ])
    );
    expect(JSON.stringify(CTAP_PEOPLE)).not.toMatch(/Karlee|Ashley/);
  });

  it("lists PDQ live and MarginEdge / R365 / labor silos as next targets", () => {
    const pdq = INTAKE_STACK_TARGETS.find(t => t.key === "pdq");
    const margin = INTAKE_STACK_TARGETS.find(t => t.key === "marginedge");
    expect(pdq?.status).toBe("live");
    expect(margin?.status).toBe("next");
    expect(
      INTAKE_STACK_TARGETS.some(t => t.key === "r365")
    ).toBe(true);
    expect(
      INTAKE_STACK_TARGETS.some(t =>
        ["7shifts", "hot_schedules", "sling"].includes(t.key)
      )
    ).toBe(true);
  });
});
