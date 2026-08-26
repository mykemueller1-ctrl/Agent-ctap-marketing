import { describe, expect, it } from "vitest";
import {
  kenzyHyveeEmail,
  liquorQtyLines,
} from "./hyvee-one-click";

describe("Kenzy one-tap Hy-Vee", () => {
  it("emits qty>0 liquor lines and stops before mixers", () => {
    const lines = liquorQtyLines([
      { name: "White Zin (Sutterhome) (1.5L)", qty: 1 },
      { name: "Chardonnay (Sutter Home) (1.5L)", qty: 0 },
      { name: "Titos Vodka", qty: 10 },
      { name: "Licor 43 Crème Brûlée", qty: 2 },
      { name: "TOTAL", qty: "" },
      { name: "Tonic", qty: 3 },
      { name: "Ginger Beer", qty: 1 },
    ]);
    expect(lines).toEqual([
      "White Zin (Sutterhome) (1.5L) - 1",
      "Titos Vodka - 10",
      "Licor 43 Crème Brûlée - 2",
    ]);
  });

  it("signs Kenzy, not Myke", () => {
    const email = kenzyHyveeEmail({
      to: "wine@example.com",
      lines: ["Captain - 7"],
    });
    expect(email.body).toContain("*Captain - 7");
    expect(email.body).toContain("Kenzy Thompson");
    expect(email.body).toContain("Bar FOH Manager");
    expect(email.body).not.toMatch(/Myke/);
    expect(email.subject).toMatch(/Community Tap & Pizza/);
  });
});
