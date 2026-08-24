import type { SpecialPerformance } from "./types";

export function grossProfit(performance: Pick<SpecialPerformance, "revenue" | "cogs">): number {
  return Number((performance.revenue - performance.cogs).toFixed(2));
}

export function recommendNextYear(performance: SpecialPerformance): string {
  const monthName = new Date(`${performance.monthKey}-01T00:00:00Z`).toLocaleString(
    "en-US",
    { month: "long", timeZone: "UTC" }
  );
  return `Bring ${performance.name} back for ${monthName}. Last year they generated $${performance.grossProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} estimated gross profit and ${capitalize(performance.peakDay)} brunch represented ${performance.peakSharePct}% of sales.`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const LEARN_LOOP = [
  "plan",
  "execute",
  "measure",
  "learn",
  "recommend",
] as const;
