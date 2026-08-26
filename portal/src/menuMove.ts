export type MenuPrice = {
  name: string;
  current: number;
  proposed: number;
};

export type MenuSeed = {
  status: "PROPOSED";
  inPos: false;
  effective: null;
  driveFileId: string;
  driveTitle: string;
  estimatedAnnualGain: number;
  itemsRemoved: number;
  collisions: Array<
    MenuPrice & {
      calendar: string;
      detail: string;
    }
  >;
};

export type MenuInsight = {
  kind: "menu" | "hold";
  title: string;
  detail: string;
};

export function lift(item: MenuPrice): number {
  return item.proposed - item.current;
}

export function buildMenuInsights(seed: MenuSeed): MenuInsight[] {
  return [
    {
      kind: "menu",
      title: "Menu price move is still PROPOSED — not in POS",
      detail: `${seed.driveTitle}. Effective date is blank. ~$${seed.estimatedAnnualGain.toLocaleString()} estimated annual gain, ${seed.itemsRemoved} items removed. Do not treat these as live ring prices.`,
    },
    ...seed.collisions.map(item => ({
      kind: "hold" as const,
      title: `${item.name}: menu $${item.proposed.toFixed(2)} vs ${item.calendar}`,
      detail: item.detail,
    })),
  ];
}
