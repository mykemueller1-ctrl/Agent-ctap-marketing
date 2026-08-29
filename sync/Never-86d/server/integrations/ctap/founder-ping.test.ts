import { describe, expect, it } from "vitest";
import {
  ACCESS_BLOCKS,
  AUTONOMOUS_WORK,
  FOUNDER,
  FOUNDER_PINGS,
  classifyAgentAsk,
  founderPingCard,
  founderRuleLine,
  shouldPingFounder,
} from "./founder-ping";

describe("founder ping contract", () => {
  it("names Myke as founder and keeps communitypizza as the ops mailbox", () => {
    expect(FOUNDER.id).toBe("myke");
    expect(FOUNDER.name).toMatch(/Myke/);
    expect(FOUNDER.name).toMatch(/Mueller/);
    expect(FOUNDER.mailbox).toBe("communitypizza2026@gmail.com");
  });

  it("does the nightly work without pinging", () => {
    for (const id of [
      "parse_z",
      "nightly_loop",
      "portal_build_test",
      "drive_read",
      "kenzy_hyvee_path",
      "catalog_evidence",
      "locked_library",
      "use_tools",
      "smash",
      "hyvee",
    ]) {
      expect(classifyAgentAsk(id), id).toBe("autonomous");
      expect(shouldPingFounder(id), id).toBe(false);
    }
    expect(AUTONOMOUS_WORK.every(t => t.class === "autonomous")).toBe(true);
  });

  it("pings Myke only for founder judgment and vertical expertise", () => {
    for (const id of [
      "two_house_or_prime",
      "prime",
      "invent_operator_fact",
      "tom_food",
      "football",
      "config_b1",
      "change_locked_rails",
      "outbound_send",
      "humes",
      "never86_product",
      "verbal_yes",
    ]) {
      expect(classifyAgentAsk(id), id).toBe("ping_founder");
      expect(shouldPingFounder(id), id).toBe(true);
    }
    expect(FOUNDER_PINGS.every(t => t.class === "ping_founder")).toBe(true);
  });

  it("treats Gmail / Render / OCR / Cloud Chrome as access, not founder logic", () => {
    for (const id of ["gmail_mcp", "render_key", "document_ai", "cloud_chrome"]) {
      expect(classifyAgentAsk(id), id).toBe("access_block");
      expect(shouldPingFounder(id), id).toBe(false);
    }
    expect(ACCESS_BLOCKS.every(t => t.class === "access_block")).toBe(true);
  });

  it("unknown operator asks ping instead of inventing", () => {
    expect(classifyAgentAsk("september_food_special_from_tom")).toBe(
      "ping_founder"
    );
  });

  it("prints a card agents can follow without asking for permission", () => {
    const card = founderPingCard();
    expect(card).toMatch(/ping only for founder judgment/i);
    expect(card).toMatch(/Kenzy path/);
    expect(card).toMatch(/two-house\/prime/);
    expect(card).toMatch(/Access \(not a founder question\)/);
    expect(card).toMatch(/Do not dump liquor unit prices/);
    expect(founderRuleLine()).toMatch(/Ping Myke Mueller only/);
  });
});
