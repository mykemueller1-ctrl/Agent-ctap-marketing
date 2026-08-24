export type BuyLine = {
  name: string;
  qty: number;
  par?: number;
  category: "liquor" | "wine" | "cordial" | "beer" | "keg";
};

export type BuySection = {
  total: number;
  overUnder: number;
  lines: BuyLine[];
};

export type BuySeed = {
  driveFileId: string;
  driveTitle: string;
  modifiedAt: string;
  pricesInGit: false;
  baselineWeeklySpend: number;
  parFillRisk: number;
  liquor: BuySection;
  beer: BuySection;
  mixersOrdered: number;
};

export type BuyInsight = {
  kind: "par-fill" | "liquor" | "beer" | "mixers" | "prices";
  title: string;
  detail: string;
};

export function combinedTotal(seed: BuySeed): number {
  return seed.liquor.total + seed.beer.total;
}

export function qtyLines(lines: BuyLine[]): BuyLine[] {
  return lines.filter(line => line.qty > 0);
}

export function biggest(lines: BuyLine[], n = 3): BuyLine[] {
  return [...lines].sort((a, b) => b.qty - a.qty).slice(0, n);
}

export function formatNames(lines: BuyLine[]): string {
  return lines.map(line => `${line.name} ×${line.qty}`).join(", ");
}

export function assertNoPrices(seed: BuySeed): string[] {
  const blob = JSON.stringify(seed);
  const hits: string[] = [];
  if (seed.pricesInGit !== false) hits.push("pricesInGit must stay false");
  if (/"unitCost"|"costPer"|"price"\s*:/i.test(blob)) {
    hits.push("unit prices leaked into the Buy seed");
  }
  if (/\$\d/.test(blob)) hits.push("dollar unit prices leaked into the Buy seed");
  return hits;
}

export function buildBuyInsights(seed: BuySeed): BuyInsight[] {
  const combined = combinedTotal(seed);
  const liquorTop = formatNames(biggest(qtyLines(seed.liquor.lines)));
  const beerTop = formatNames(biggest(qtyLines(seed.beer.lines)));
  const liquorUnder = seed.liquor.overUnder < 0;
  const beerUnder = seed.beer.overUnder < 0;

  return [
    {
      kind: "par-fill",
      title: `This sheet is a $${combined.toFixed(0)} par-fill, not a $${seed.baselineWeeklySpend.toLocaleString()} replacement buy`,
      detail: `May baseline: ~$${seed.baselineWeeklySpend.toLocaleString()}/wk spend was fine against ~$13k alcohol sales. Full-guide par-fill risk was ~$${seed.parFillRisk.toLocaleString()}. Combined qty-to-order is $${combined.toFixed(2)}. Do not send until POS movement matches the holes.`,
    },
    {
      kind: "liquor",
      title: `Liquor / wine / cordial qty-to-order $${seed.liquor.total.toFixed(2)}`,
      detail: `${liquorUnder ? "Under" : "Over"} the sheet budget by $${Math.abs(seed.liquor.overUnder).toFixed(2)}. Biggest holes: ${liquorTop}.`,
    },
    {
      kind: "beer",
      title: `Beer / kegs qty-to-order $${seed.beer.total.toFixed(2)}`,
      detail: `${beerUnder ? "Under" : "Over"} the sheet budget by $${Math.abs(seed.beer.overUnder).toFixed(2)}. Biggest holes: ${beerTop}.`,
    },
    {
      kind: "mixers",
      title:
        seed.mixersOrdered === 0
          ? "Mixers are all zero — not the hole"
          : `${seed.mixersOrdered} mixer lines have qty`,
      detail: "Tonic / soda / mix stay in Drive. This week's cash is bottles, cans, and kegs.",
    },
    {
      kind: "prices",
      title: "Unit costs stay in Drive",
      detail: `${seed.driveTitle} (modified ${seed.modifiedAt}). Portal lists name, par, and qty only.`,
    },
  ];
}
