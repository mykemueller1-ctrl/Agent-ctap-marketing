export type CalendarSeed = {
  monthKey: string;
  monthLabel: string;
  status: "DRAFT" | "MANAGER_REVIEW" | "MYKE_REVIEW" | "APPROVED" | "SENT_TO_HUMES";
  humesRule: string;
  drink: { name: string; owner: string; approved: boolean };
  food: { name: string | null; owner: string; approved: boolean };
  events: Array<{ name: string; date: string; status: string }>;
  football: {
    planningOnly: true;
    promosCreated: false;
    games: Array<{ label: string; date: string }>;
  };
};

export type CalendarInsight = {
  kind: "gap" | "hold" | "ok";
  title: string;
  detail: string;
};

export function buildCalendarInsights(seed: CalendarSeed): CalendarInsight[] {
  const insights: CalendarInsight[] = [];
  if (!seed.food.name) {
    insights.push({
      kind: "gap",
      title: "Tom still owes the September food special",
      detail: "Kitchen monthly feature is blank. Do not invent one.",
    });
  }
  if (!seed.drink.approved) {
    insights.push({
      kind: "hold",
      title: `${seed.drink.name} is Kenzy's drink — not approved`,
      detail: "Glassware/garnish still with Kenzy. Agent does not email Humes.",
    });
  }
  if (!seed.football.promosCreated) {
    insights.push({
      kind: "ok",
      title: "Football is on the planning screen only",
      detail: "Monday/Thursday Night Football promos are NOT CREATED until Kenzy/Myke decide.",
    });
  }
  insights.push({
    kind: "hold",
    title: "Humes calendar email stays unsent",
    detail: seed.humesRule,
  });
  return insights;
}
