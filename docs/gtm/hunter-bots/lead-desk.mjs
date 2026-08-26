export const HOOK =
  "Upload one redacted DoorDash/Uber/Grubhub statement at https://www.never86.ai/audit — dates, totals, fees, ads, refunds, payout. No portal password.";

const DROP_PATTERNS = [
  /\bdasher\b/i,
  /\bdriver\b/i,
  /\bfood was cold\b/i,
  /\bcoupon code\b/i,
  /\bnever\s?86/i,
];

const OPERATOR_VOICE = [
  /\b(my restaurant|our restaurant|we own|i own|owner|gm\b|operator)\b/i,
  /\b(pizza shop|bar I|our bar|our kitchen|store #?\d)\b/i,
];

const THREE_P_PAIN = [
  /doordash/i,
  /uber\s?eats/i,
  /grubhub/i,
  /\b3p\b/i,
  /third[- ]party delivery/i,
  /commission/i,
  /payout/i,
  /error charge/i,
  /marketplace ads?/i,
];

const OPS_PAIN = [
  /food cost/i,
  /labor %/i,
  /prime cost/i,
  /invoice/i,
  /z[- ]?report/i,
  /end of (day|night)/i,
  /marginedge/i,
  /restaurant365|\br365\b/i,
  /7shifts/i,
  /hotschedules/i,
];

const TOO_BIG = [
  /\b(20|30|40|50|\d{3})\s+(locations|stores|units)\b/i,
  /\benterprise\b/i,
  /\bfranchisee of\b/i,
];

function hits(text, patterns) {
  return patterns.filter(p => p.test(text)).map(p => p.source);
}

export function scoreLead(lead) {
  const text = `${lead.author ?? ""} ${lead.text}`;
  const drop = DROP_PATTERNS.find(p => p.test(text));
  if (drop) {
    return {
      ...lead,
      score: 0,
      icpFit: false,
      pain: [],
      dropReason: `excluded:${drop.source}`,
      hook: HOOK,
      fileToAsk: "none",
    };
  }

  const operator = hits(text, OPERATOR_VOICE);
  const threeP = hits(text, THREE_P_PAIN);
  const ops = hits(text, OPS_PAIN);
  const tooBig =
    lead.unitsGuess === "too-big" || TOO_BIG.some(p => p.test(text));

  let score = 0;
  if (operator.length) score += 35;
  if (threeP.length) score += 35;
  if (ops.length) score += 15;
  if (lead.unitsGuess === "1" || lead.unitsGuess === "2-3") score += 15;
  if (lead.unitsGuess === "unknown" && operator.length) score += 5;
  if (tooBig) score -= 50;

  score = Math.max(0, Math.min(100, score));
  const icpFit = score >= 60 && !tooBig && operator.length > 0;

  const pain = [...threeP, ...ops].slice(0, 6);
  const fileToAsk = threeP.length
    ? "3p_statement"
    : ops.some(s => /z|end of/i.test(s))
      ? "z_report"
      : ops.some(s => /invoice|marginedge/i.test(s))
        ? "invoice_photo"
        : "none";

  return {
    ...lead,
    score,
    icpFit,
    pain,
    dropReason: tooBig ? "too-big" : undefined,
    hook: HOOK,
    fileToAsk,
  };
}

export function keepForDesk(leads) {
  return leads
    .map(scoreLead)
    .filter(l => l.icpFit)
    .sort((a, b) => b.score - a.score);
}
