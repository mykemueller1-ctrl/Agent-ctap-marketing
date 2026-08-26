export type WeeklySpecial = {
  day: string;
  name: string;
  price?: string;
  locked?: boolean;
  goesUp?: boolean;
  poster?: boolean;
};

export type CalendarSeed = {
  monthKey: string;
  monthLabel: string;
  status: "DRAFT" | "MANAGER_REVIEW" | "MYKE_REVIEW" | "APPROVED" | "SENT_TO_HUMES";
  humesRule: string;
  drink: { name: string; owner: string; approved: boolean };
  food: { name: string | null; owner: string; approved: boolean };
  weekly: WeeklySpecial[];
  events: Array<{ name: string; date: string; status: string }>;
  football: {
    planningOnly: true;
    promosCreated: false;
    games: Array<{ label: string; date: string }>;
  };
};

export type CalendarInsight = {
  kind: "gap" | "hold" | "ok" | "weekly";
  title: string;
  detail: string;
};

export function smashBurger(seed: CalendarSeed): WeeklySpecial | undefined {
  return seed.weekly.find(item => /smash burger/i.test(item.name));
}

export function thursdayPizza(seed: CalendarSeed): WeeklySpecial | undefined {
  return seed.weekly.find(item => item.goesUp || /medium pizza/i.test(item.name));
}

export function assertPizzaStaysThursday(seed: CalendarSeed): string[] {
  const pizza = thursdayPizza(seed);
  const hits: string[] = [];
  if (!pizza) hits.push("Thursday medium pizza missing from weekly library");
  else if (pizza.day !== "Thursday") hits.push("Thursday medium pizza must stay Thursday");
  else if (!pizza.locked) hits.push("Thursday medium pizza must stay locked");
  return hits;
}

export function buildCalendarInsights(seed: CalendarSeed): CalendarInsight[] {
  const insights: CalendarInsight[] = [];
  const smash = smashBurger(seed);
  const pizza = thursdayPizza(seed);
  if (smash?.price) {
    insights.push({
      kind: "weekly",
      title: `Tuesday Smash Burger is $${smash.price} BOGO`,
      detail: "Second Smash Burger with a side. Poster required. Price lives in the recurring library — edit once.",
    });
  }
  if (pizza) {
    insights.push({
      kind: "ok",
      title: `${pizza.name} GOES UP Thursday`,
      detail: `$${pizza.price ?? "17.99"} all day. Never Wednesday. Locked in the weekly library.`,
    });
  }
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
