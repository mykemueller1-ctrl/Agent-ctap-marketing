import { describe, expect, it } from "vitest";
import {
  CTAP_OPS_MAILBOX,
  CTAP_PEOPLE,
  CTAP_VENDOR_CADENCE,
  humesRoutingSwitchEmail,
  INTAKE_STACK_TARGETS,
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
    const sawyer = CTAP_VENDOR_CADENCE.find(v => v.vendorKey === "sawyer_meats");
    expect(sawyer?.intakeMode).toBe("photo_ocr");
  });

  it("drafts the Humes mailbox switch email", () => {
    const draft = humesRoutingSwitchEmail();
    expect(draft.to).toBe("accountspayable@humesdist.com");
    expect(draft.body).toContain("Please start sending invoices here instead:");
    expect(draft.body).toContain("communitypizza2026@gmail.com");
    expect(draft.body).toContain("myke@n86.app");
  });

  it("includes Hy-Vee Wine Sun/Mon liquor order cadence", () => {
    const hyvee = CTAP_VENDOR_CADENCE.find(v => v.vendorKey === "hyvee_wine");
    expect(hyvee?.intakeMode).toBe("outbound_email_order");
    expect(hyvee?.orderWindow).toMatch(/Sunday or Monday/i);
    expect(hyvee?.notes).toMatch(/Kenzy Thompson/);
  });

  it("names Kenzy Thompson as wife and alcohol-sheet owner", () => {
    expect(CTAP_PEOPLE.spouse.name).toBe("Kenzy Thompson");
    expect(CTAP_PEOPLE.spouse.role).toMatch(/wife/i);
    expect(CTAP_PEOPLE.spouse.role).toMatch(/Hy-Vee/);
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
