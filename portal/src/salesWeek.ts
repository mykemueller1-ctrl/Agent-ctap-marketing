export const LABOR_TARGET = 0.28;
export const FOOD_COST_TARGET = 0.3;
export const BEER_COST_TARGET = 0.21;
export const LIQUOR_COST_TARGET = 0.2;

export type ChannelRow = {
  name: string;
  amount: number;
};

export type ZDay = {
  date: string;
  label: string;
  source: string;
  grandTotal: number;
  foodSales: number;
  beerSales: number;
  liquorSales: number;
  largePizzaSales: number;
  labor: number;
  expectedCash: number;
  actualDeposit: number | null;
  channels: ChannelRow[];
};

export type SalesSeed = {
  invoiceWeekStart: string;
  invoiceWeekEnd: string;
  invoiceWeekHasZ: boolean;
  recentZ: ZDay[];
  lastCompleteWeek: {
    folder: string;
    start: string;
    end: string;
    days: ZDay[];
  };
};

export type SalesInsight = {
  kind: "gap" | "labor-over" | "labor-ok" | "cash-short" | "pattern";
  title: string;
  detail: string;
};

export function money(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function pct(part: number, whole: number): number {
  if (!whole) return 0;
  return part / whole;
}

export function pctLabel(part: number, whole: number): string {
  return `${(pct(part, whole) * 100).toFixed(1)}%`;
}

export function rollup(days: ZDay[]) {
  return days.reduce(
    (acc, day) => {
      acc.grandTotal += day.grandTotal;
      acc.foodSales += day.foodSales;
      acc.beerSales += day.beerSales;
      acc.liquorSales += day.liquorSales;
      acc.largePizzaSales += day.largePizzaSales;
      acc.labor += day.labor;
      acc.expectedCash += day.expectedCash;
      acc.actualDeposit += day.actualDeposit ?? 0;
      return acc;
    },
    {
      grandTotal: 0,
      foodSales: 0,
      beerSales: 0,
      liquorSales: 0,
      largePizzaSales: 0,
      labor: 0,
      expectedCash: 0,
      actualDeposit: 0,
    }
  );
}

export function buildSalesInsights(seed: SalesSeed): SalesInsight[] {
  const insights: SalesInsight[] = [];
  if (!seed.invoiceWeekHasZ) {
    insights.push({
      kind: "gap",
      title: `No Z-reports for ${seed.invoiceWeekStart} → ${seed.invoiceWeekEnd}`,
      detail:
        "Last week's invoice photos are in Drive. Sales denominator is not. Drop the Aug Z PDFs the same way the Sept 2025 weekly folder was filed.",
    });
  }

  for (const day of seed.recentZ) {
    const laborShare = pct(day.labor, day.grandTotal);
    if (laborShare > LABOR_TARGET) {
      insights.push({
        kind: "labor-over",
        title: `${day.label} labor ${pctLabel(day.labor, day.grandTotal)} — over the 28% target`,
        detail: `${money(day.labor)} labor on ${money(day.grandTotal)} sales. Cost % still needs invoices; this number is from the Z alone.`,
      });
    } else {
      insights.push({
        kind: "labor-ok",
        title: `${day.label} labor ${pctLabel(day.labor, day.grandTotal)} — under 28%`,
        detail: `${money(day.labor)} labor on ${money(day.grandTotal)} sales.`,
      });
    }
    if (
      day.actualDeposit != null &&
      day.expectedCash - day.actualDeposit > 5
    ) {
      insights.push({
        kind: "cash-short",
        title: `${day.label} deposit short ${money(day.expectedCash - day.actualDeposit)}`,
        detail: `Expected ${money(day.expectedCash)}, actual ${money(day.actualDeposit)}.`,
      });
    }
  }

  const week = rollup(seed.lastCompleteWeek.days);
  insights.push({
    kind: "pattern",
    title: `Last complete Z week ${seed.lastCompleteWeek.start} → ${seed.lastCompleteWeek.end}`,
    detail: `${money(week.grandTotal)} sales · labor ${pctLabel(week.labor, week.grandTotal)} of ${money(week.labor)}. Folder: ${seed.lastCompleteWeek.folder}.`,
  });
  return insights;
}
