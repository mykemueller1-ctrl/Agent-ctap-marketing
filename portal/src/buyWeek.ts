export type BuyAction = "send" | "hold";

export type BuyLine = {
  name: string;
  qty: number;
  par?: number;
  category: "liquor" | "wine" | "cordial" | "beer" | "keg";
};

/** Volume movers + well brands. Qty-1 premium / one-offs get held. */
const SEND_NEEDLES = [
  "titos",
  "captain",
  "hawkeye vodka",
  "crown apple",
  "crown peach",
  "pinot grigio",
  "black velvet",
  "peppermint schnapps",
  "cherry mcguillicuddys",
  "ultra bottles",
  "busch light",
  "coors light",
  "miller light",
  "miller high life",
  "bud light bottles",
  "budweiser bottles",
];

export function decideBuyAction(line: BuyLine): BuyAction {
  if (line.qty <= 0) return "hold";
  if (line.category === "keg") return "send";
  const name = line.name.toLowerCase().replace(/\./g, "");
  if (SEND_NEEDLES.some(needle => name.includes(needle))) return "send";
  if (line.qty >= 3) return "send";
  return "hold";
}

export function withActions(lines: BuyLine[]): Array<BuyLine & { action: BuyAction }> {
  return lines.map(line => ({ ...line, action: decideBuyAction(line) }));
}

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
  kind: "par-fill" | "send" | "hold" | "liquor" | "beer" | "mixers" | "prices";
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
  const tagged = withActions([...seed.liquor.lines, ...seed.beer.lines]).filter(
    line => line.qty > 0
  );
  const send = tagged.filter(line => line.action === "send");
  const hold = tagged.filter(line => line.action === "hold");
  const liquorTop = formatNames(biggest(qtyLines(seed.liquor.lines)));
  const beerTop = formatNames(biggest(qtyLines(seed.beer.lines)));
  const liquorUnder = seed.liquor.overUnder < 0;
  const beerUnder = seed.beer.overUnder < 0;

  return [
    {
      kind: "send",
      title: `Send ${send.length} volume + keg lines. Hold ${hold.length} qty-1 premium / one-offs`,
      detail: `I took the Buy call. Par-fill is $${combined.toFixed(2)} vs a ~$${seed.baselineWeeklySpend.toLocaleString()} replacement buy. Send: ${formatNames(biggest(send, 4))}. Hold the rest until POS mix says otherwise.`,
    },
    {
      kind: "par-fill",
      title: `Sheet total $${combined.toFixed(0)} is a par-fill, not the send`,
      detail: `May baseline: ~$${seed.baselineWeeklySpend.toLocaleString()}/wk was fine against ~$13k alcohol sales. Full-guide risk ~$${seed.parFillRisk.toLocaleString()}. Do not email Hy-Vee / Humes this whole list.`,
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
