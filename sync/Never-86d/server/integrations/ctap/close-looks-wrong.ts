/**
 * When a PDQ close / Z looks wrong.
 *
 * Pattern, not verdict. Missing Evidence is not $0.
 * Verbal yes does not close. One leak → one owner via Community Lab.
 */

import {
  actionOwnerForLeak,
  type LeakDomain,
  type SourceTag,
} from "./community-lab";

export const CLOSE_RAILS = {
  food: 0.3,
  beer: 0.21,
  liquor: 0.2,
  labor: 0.28,
} as const;

/** null / undefined = not on the Z. 0 = entered zero. */
export type CloseSlice = {
  businessDate: string;
  sales?: number | null;
  foodSales?: number | null;
  beerSales?: number | null;
  liquorSales?: number | null;
  popSales?: number | null;
  laborDollars?: number | null;
  expectedCash?: number | null;
  enteredDeposit?: number | null;
  voids?: number | null;
  foodCogs?: number | null;
  beerCogs?: number | null;
  liquorCogs?: number | null;
  /** Someone said it looks fine. That is not proof. */
  verbalOk?: boolean;
};

export type CloseKind = "missing_evidence" | "pattern" | "cannot_close";

export type CloseCall = {
  kind: CloseKind;
  domain: LeakDomain | "cash" | "mix";
  ownerId: "kenzy" | "tom" | "myke";
  ownerName: string;
  sourceTag: SourceTag;
  reason: string;
  nightProof: string;
  cannot: string;
};

function missing(n: number | null | undefined): boolean {
  return n === null || n === undefined;
}

function pct(num: number, den: number): number {
  return den === 0 ? 0 : num / den;
}

function ownerFor(domain: LeakDomain): CloseCall["ownerId"] {
  const id = actionOwnerForLeak(domain).person.id;
  if (id === "kenzy" || id === "tom" || id === "myke") return id;
  return "myke";
}

function ownerName(id: CloseCall["ownerId"]): string {
  if (id === "kenzy") return "Kenzy Thompson";
  if (id === "tom") return "Tom Dorothy";
  return 'Mychael "Myke" Mueller';
}

/**
 * Read a close. Return zero or more calls. Empty = nothing to do on this slice.
 * Does not invent dollars. Does not treat a missing line as $0.
 */
export function closeLooksWrong(slice: CloseSlice): CloseCall[] {
  const out: CloseCall[] = [];
  const named = new Set<string>();
  const push = (c: CloseCall) => {
    const key = `${c.kind}:${c.domain}:${c.reason}`;
    if (named.has(key)) return;
    named.add(key);
    out.push(c);
  };

  if (slice.verbalOk) {
    push({
      kind: "cannot_close",
      domain: "prime",
      ownerId: "myke",
      ownerName: ownerName("myke"),
      sourceTag: "UNVERIFIED",
      reason: "Verbal yes is not night proof.",
      nightProof: "Re-drop the Z, or attach deposit / invoice for that business date.",
      cannot: "Close a ticket because someone said it looks right.",
    });
  }

  if (missing(slice.sales)) {
    push({
      kind: "cannot_close",
      domain: "prime",
      ownerId: "myke",
      ownerName: ownerName("myke"),
      sourceTag: "UNVERIFIED",
      reason: "No sales denominator. The Z is not on this close.",
      nightProof: "PDQ Z for that business date in communitypizza.",
      cannot: "Invent sales. Treat a missing Z as $0.",
    });
    return out;
  }

  const sales = slice.sales as number;

  for (const [label, value, domain] of [
    ["Food", slice.foodSales, "food"],
    ["Beer", slice.beerSales, "beer"],
    ["Liquor", slice.liquorSales, "liquor"],
  ] as const) {
    if (missing(value)) {
      push({
        kind: "missing_evidence",
        domain,
        ownerId: ownerFor(domain),
        ownerName: ownerName(ownerFor(domain)),
        sourceTag: "UNVERIFIED",
        reason: `${label} mix is not on the Z. That is Missing Evidence, not $0.`,
        nightProof: "Re-drop the Z. Large Pizza already rolls into Food.",
        cannot: `Write ${label} sales as $0 because the line is blank.`,
      });
    }
  }

  if (missing(slice.popSales)) {
    push({
      kind: "missing_evidence",
      domain: "mix",
      ownerId: "myke",
      ownerName: ownerName("myke"),
      sourceTag: "UNVERIFIED",
      reason: "Pop / other mix is not on the Z. Missing Evidence, not $0.",
      nightProof: "Re-drop the Z. Do not pad mix to make it tie.",
      cannot: "Fill pop as $0 to force a tie-out.",
    });
  }

  const cashBlank = missing(slice.expectedCash) || missing(slice.enteredDeposit);
  const cashZero =
    slice.expectedCash === 0 || slice.enteredDeposit === 0;
  if (cashBlank || cashZero) {
    push({
      kind: "missing_evidence",
      domain: "cash",
      ownerId: "myke",
      ownerName: ownerName("myke"),
      sourceTag: "UNVERIFIED",
      reason:
        "Unentered or $0 cash is not a shortage. Need expected cash and a matching deposit.",
      nightProof: "Expected cash from the Z plus the deposit record for that day.",
      cannot: "Call a cash shortage from a blank or $0 field.",
    });
  }

  const railHits: Array<"food" | "beer" | "liquor" | "labor"> = [];

  if (!missing(slice.foodCogs) && !missing(slice.foodSales) && slice.foodSales! > 0) {
    if (pct(slice.foodCogs!, slice.foodSales!) > CLOSE_RAILS.food) {
      railHits.push("food");
      push({
        kind: "pattern",
        domain: "food",
        ownerId: "tom",
        ownerName: ownerName("tom"),
        sourceTag: "ESTIMATED",
        reason: `Food cost ${Math.round(pct(slice.foodCogs!, slice.foodSales!) * 1000) / 10}% vs rail <30%. Pattern, not verdict.`,
        nightProof: "Same-day food invoices (handwritten total) against this Z.",
        cannot: "Change the order guide from one night.",
      });
    }
  } else if (!missing(slice.foodSales) && missing(slice.foodCogs)) {
    push({
      kind: "cannot_close",
      domain: "food",
      ownerId: "tom",
      ownerName: ownerName("tom"),
      sourceTag: "UNVERIFIED",
      reason: "Food sales are on the Z. Food invoices are not. Cannot close food %.",
      nightProof: "Tom's food vendor photos/PDFs for that business date.",
      cannot: "Close food cost on sales alone.",
    });
  }

  if (!missing(slice.beerCogs) && !missing(slice.beerSales) && slice.beerSales! > 0) {
    if (pct(slice.beerCogs!, slice.beerSales!) > CLOSE_RAILS.beer) {
      railHits.push("beer");
      push({
        kind: "pattern",
        domain: "beer",
        ownerId: "kenzy",
        ownerName: ownerName("kenzy"),
        sourceTag: "ESTIMATED",
        reason: `Beer cost ${Math.round(pct(slice.beerCogs!, slice.beerSales!) * 1000) / 10}% vs rail <21%. Pattern, not verdict.`,
        nightProof: "Humes / Fort Dodge Dist invoice for that drop vs this Z.",
        cannot: "Fill every beer par hole because one night ran high.",
      });
    }
  } else if (!missing(slice.beerSales) && missing(slice.beerCogs)) {
    push({
      kind: "cannot_close",
      domain: "beer",
      ownerId: "kenzy",
      ownerName: ownerName("kenzy"),
      sourceTag: "UNVERIFIED",
      reason: "Beer sales are on the Z. Beer invoices are not. Cannot close beer %.",
      nightProof: "Humes PDF in communitypizza for that week.",
      cannot: "Close beer cost on sales alone.",
    });
  }

  if (!missing(slice.liquorCogs) && !missing(slice.liquorSales) && slice.liquorSales! > 0) {
    if (pct(slice.liquorCogs!, slice.liquorSales!) > CLOSE_RAILS.liquor) {
      railHits.push("liquor");
      push({
        kind: "pattern",
        domain: "liquor",
        ownerId: "kenzy",
        ownerName: ownerName("kenzy"),
        sourceTag: "ESTIMATED",
        reason: `Liquor cost ${Math.round(pct(slice.liquorCogs!, slice.liquorSales!) * 1000) / 10}% vs rail <20%. Pattern, not verdict.`,
        nightProof: "Hy-Vee send vs this Z. Kenzy's sheet, not a par-fill.",
        cannot: "Put Myke back in the Hy-Vee loop.",
      });
    }
  } else if (!missing(slice.liquorSales) && missing(slice.liquorCogs)) {
    push({
      kind: "cannot_close",
      domain: "liquor",
      ownerId: "kenzy",
      ownerName: ownerName("kenzy"),
      sourceTag: "UNVERIFIED",
      reason: "Liquor sales are on the Z. Liquor invoices are not. Cannot close liquor %.",
      nightProof: "Hy-Vee invoice / Kenzy sheet qty for that week.",
      cannot: "Close liquor cost on sales alone.",
    });
  }

  if (!missing(slice.laborDollars) && sales > 0) {
    if (pct(slice.laborDollars!, sales) > CLOSE_RAILS.labor) {
      railHits.push("labor");
      push({
        kind: "pattern",
        domain: "labor",
        ownerId: "myke",
        ownerName: ownerName("myke"),
        sourceTag: "ESTIMATED",
        reason: `Labor ${Math.round(pct(slice.laborDollars!, sales) * 1000) / 10}% vs rail <28%. Pattern, not verdict.`,
        nightProof: "Z labor dollars plus who was posted that night (FOH Kenzy, BOH Tom).",
        cannot: "Cut a body from one night's %.",
      });
    }
  } else if (missing(slice.laborDollars)) {
    push({
      kind: "missing_evidence",
      domain: "labor",
      ownerId: "myke",
      ownerName: ownerName("myke"),
      sourceTag: "UNVERIFIED",
      reason: "Labor is not on the Z. Missing Evidence, not $0 labor.",
      nightProof: "Z labor section for that business date.",
      cannot: "Treat missing labor as a perfect night.",
    });
  }

  const houseRails = railHits.filter(r => r !== "labor");
  if (houseRails.length >= 2 || (houseRails.length >= 1 && railHits.includes("labor"))) {
    push({
      kind: "pattern",
      domain: "prime",
      ownerId: "myke",
      ownerName: ownerName("myke"),
      sourceTag: "ESTIMATED",
      reason: "More than one rail moved. That is prime / two-house — Myke, not a manager duel.",
      nightProof: "Same business date: Z + food invoices + beer/liquor invoices.",
      cannot: "Hand Kenzy and Tom competing verdicts for one night.",
    });
  }

  return out;
}

export function closeLooksWrongCard(slice: CloseSlice): string {
  const calls = closeLooksWrong(slice);
  if (calls.length === 0) {
    return `${slice.businessDate}: close has nothing to flag. Still pattern, not a clean bill of health.`;
  }
  return [
    `${slice.businessDate} — close looks wrong (${calls.length})`,
    ...calls.map(
      c =>
        `- [${c.kind}] ${c.ownerName} · ${c.domain}: ${c.reason} Proof: ${c.nightProof} Cannot: ${c.cannot}`
    ),
  ].join("\n");
}
