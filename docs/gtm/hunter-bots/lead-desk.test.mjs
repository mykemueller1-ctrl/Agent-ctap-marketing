import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { keepForDesk, scoreLead } from "./lead-desk.mjs";

describe("hunter lead desk", () => {
  it("scores a 1-unit DoorDash complaint as ICP", () => {
    const scored = scoreLead({
      platform: "x",
      url: "https://x.com/example/status/1",
      unitsGuess: "1",
      text: "I own a pizza shop and DoorDash commission plus ads ate the whole week. Payout doesn't match.",
    });
    assert.equal(scored.icpFit, true);
    assert.ok(scored.score >= 60);
    assert.equal(scored.fileToAsk, "3p_statement");
    assert.match(scored.hook, /never86\.ai\/audit/);
  });

  it("drops dasher / consumer threads", () => {
    const scored = scoreLead({
      platform: "reddit",
      url: "https://reddit.com/r/doordash/1",
      text: "Dasher here, they cut my base pay again",
    });
    assert.equal(scored.icpFit, false);
    assert.equal(scored.score, 0);
  });

  it("drops 40-unit enterprise noise", () => {
    const scored = scoreLead({
      platform: "linkedin",
      url: "https://linkedin.com/x",
      unitsGuess: "too-big",
      text: "Our 40 locations and DoorDash enterprise contract",
    });
    assert.equal(scored.dropReason, "too-big");
    assert.equal(scored.icpFit, false);
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
    assert.equal(kept.length, 1);
    assert.equal(kept[0].url, "u1");
  });
});
