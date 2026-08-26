import { describe, expect, it } from "vitest";
import { keepForDesk, scoreLead } from "./lead-desk.mjs";

describe("hunter lead desk", () => {
  it("scores a 1-unit DoorDash complaint as ICP", () => {
    const scored = scoreLead({
      platform: "x",
      url: "https://x.com/example/status/1",
      unitsGuess: "1",
      text: "I own a pizza shop and DoorDash commission plus ads ate the whole week. Payout doesn't match.",
    });
    expect(scored.icpFit).toBe(true);
    expect(scored.score).toBeGreaterThanOrEqual(60);
    expect(scored.fileToAsk).toBe("3p_statement");
    expect(scored.hook).toMatch(/never86\.ai\/audit/);
  });

  it("drops dasher / consumer threads", () => {
    const scored = scoreLead({
      platform: "reddit",
      url: "https://reddit.com/r/doordash/1",
      text: "Dasher here, they cut my base pay again",
    });
    expect(scored.icpFit).toBe(false);
    expect(scored.score).toBe(0);
  });

  it("drops 40-unit enterprise noise", () => {
    const scored = scoreLead({
      platform: "linkedin",
      url: "https://linkedin.com/x",
      unitsGuess: "too-big",
      text: "Our 40 locations and DoorDash enterprise contract",
    });
    expect(scored.dropReason).toBe("too-big");
    expect(scored.icpFit).toBe(false);
  });

  it("keepForDesk only returns ICP fits", () => {
    const kept = keepForDesk([
      {
        platform: "facebook",
        url: "u1",
        unitsGuess: "2-3",
        text: "We own two bars. Grubhub payout is short every Thursday.",
      },
      {
        platform: "tiktok",
        url: "u2",
        text: "Food was cold, one star",
      },
    ]);
    expect(kept).toHaveLength(1);
    expect(kept[0].url).toBe("u1");
  });
});
