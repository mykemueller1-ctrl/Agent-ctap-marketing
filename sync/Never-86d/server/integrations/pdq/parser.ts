import type { InsertDailySales } from "../../../drizzle/schema";

export const PDQ_PARSER_VERSION = "pdq-z-report-v2";

type MoneyString = string;

type ParsedCountAmount = {
  qty?: number;
  amount?: MoneyString;
};

export type ParsedPdqZReport = {
  parserVersion: typeof PDQ_PARSER_VERSION;
  confidence: number;
  needsReview: boolean;
  warnings: string[];
  businessDate?: string;
  grandTotal?: MoneyString;
  subtotal?: MoneyString;
  tax?: MoneyString;
  orderCounts: {
    pickup: ParsedCountAmount;
    delivery: ParsedCountAmount;
    bar: ParsedCountAmount;
    table: ParsedCountAmount;
    total: ParsedCountAmount;
  };
  categorySales: {
    food: ParsedCountAmount;
    pop: ParsedCountAmount;
    liquor: ParsedCountAmount;
    beer: ParsedCountAmount;
    largePizzas: ParsedCountAmount;
  };
  labor: {
    headcount?: number;
    total?: MoneyString;
    pct?: MoneyString;
  };
  voids: ParsedCountAmount;
  discounts: ParsedCountAmount & { pct?: MoneyString };
  cash: {
    expectedCash?: MoneyString;
    creditCards?: MoneyString;
    creditCardTips?: MoneyString;
    payOuts?: MoneyString;
  };
};

const MONEY_RE = /\(?-?\$?\d[\d,]*\.\d{2}\)?/;
const INT_RE = /\d[\d,]*/;

function money(value: string | undefined): MoneyString | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/[$,\s]/g, "").replace(/^\((.*)\)$/, "-$1");
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed.toFixed(2);
}

function numberValue(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value.replace(/[,\s]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * PDQ PDF text extraction often puts the label on one line and the value on the
 * next (`Grand Total:\n$4,645.04`). Allow whitespace/newlines between them.
 */
function firstMoneyAfter(
  text: string,
  labels: string[]
): MoneyString | undefined {
  for (const label of labels) {
    const pattern = new RegExp(
      `${escapeRegExp(label)}\\b\\s*[:\\-]?\\s*(?:\\n\\s*){0,3}(${MONEY_RE.source})`,
      "i"
    );
    const match = text.match(pattern);
    const parsed = money(match?.[1]);
    if (parsed) return parsed;
  }
  return undefined;
}

function firstPercentAfter(
  text: string,
  labels: string[]
): MoneyString | undefined {
  for (const label of labels) {
    const pattern = new RegExp(
      `${escapeRegExp(label)}\\s*[:\\-]?\\s*(?:\\n\\s*){0,4}(-?\\d+(?:\\.\\d+)?)\\s*%?`,
      "i"
    );
    const match = text.match(pattern);
    if (match?.[1]) return Number.parseFloat(match[1]).toFixed(2);
  }
  return undefined;
}

function firstIntegerAfter(text: string, labels: string[]): number | undefined {
  for (const label of labels) {
    const pattern = new RegExp(
      `${escapeRegExp(label)}\\s*[:\\-]?\\s*(?:\\n\\s*){0,3}(${INT_RE.source})`,
      "i"
    );
    const match = text.match(pattern);
    const parsed = numberValue(match?.[1]);
    if (parsed !== undefined) return parsed;
  }
  return undefined;
}

/**
 * Slice a named report section. PDQ Z-reports are multi-page and repeat the
 * header; section titles are unique enough for scoping table rows.
 */
function sectionBetween(
  text: string,
  startLabel: string,
  endLabels: string[]
): string {
  const start = new RegExp(`(?:^|\\n)\\s*${escapeRegExp(startLabel)}\\b`, "i");
  const startMatch = start.exec(text);
  if (!startMatch || startMatch.index === undefined) return "";
  const from = startMatch.index + startMatch[0].length;
  const rest = text.slice(from);
  let endAt = rest.length;
  for (const endLabel of endLabels) {
    const end = new RegExp(`(?:^|\\n)\\s*${escapeRegExp(endLabel)}\\b`, "i");
    const endMatch = end.exec(rest);
    if (endMatch?.index !== undefined && endMatch.index < endAt) {
      endAt = endMatch.index;
    }
  }
  return rest.slice(0, Math.min(endAt, 2500));
}

/**
 * Table rows look like:
 *   Pickup
 *   20
 *   $603.56
 *   $30.18
 * with optional same-line leftovers for older layouts.
 */
function countAndAmount(text: string, labels: string[]): ParsedCountAmount {
  for (const label of labels) {
    const escaped = escapeRegExp(label);

    const multi = new RegExp(
      `(?:^|\\n)\\s*${escaped}\\s*:?\\s*(?:\\n\\s*)+(${INT_RE.source})\\s*(?:\\n\\s*)+(${MONEY_RE.source})`,
      "i"
    );
    const multiMatch = text.match(multi);
    if (multiMatch) {
      return {
        qty: numberValue(multiMatch[1]),
        amount: money(multiMatch[2]),
      };
    }

    const linePattern = new RegExp(`^.*${escaped}.*$`, "gim");
    const line = text.match(linePattern)?.[0];
    if (!line) continue;
    const amounts = Array.from(line.matchAll(new RegExp(MONEY_RE, "g")))
      .map(m => money(m[0]))
      .filter(Boolean) as string[];
    const integers = Array.from(
      line.matchAll(/(?:^|\s)(\d{1,6})(?:\s|$)/g)
    )
      .map(m => numberValue(m[1]))
      .filter((n): n is number => n !== undefined);
    if (amounts.length || integers.length) {
      return {
        qty: integers[0],
        amount: amounts.at(-1),
      };
    }
  }
  return {};
}

/** CTAP rule: Large Pizza menu category rolls into Food (qty + $). */
function mergeCountAmount(
  primary: ParsedCountAmount,
  extra: ParsedCountAmount
): ParsedCountAmount {
  const qty =
    primary.qty !== undefined || extra.qty !== undefined
      ? (primary.qty ?? 0) + (extra.qty ?? 0)
      : undefined;
  const amountParts = [primary.amount, extra.amount]
    .map(v => (v !== undefined ? Number.parseFloat(v) : undefined))
    .filter((n): n is number => n !== undefined && Number.isFinite(n));
  const amount =
    amountParts.length > 0
      ? amountParts.reduce((a, b) => a + b, 0).toFixed(2)
      : undefined;
  return { qty, amount };
}

function extractBusinessDate(text: string): string | undefined {
  const explicit = text.match(
    /(?:business\s*date|z\s*report\s*date|report\s*date|date)\D{0,40}(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/i
  );
  if (!explicit) return undefined;
  const month = explicit[1].padStart(2, "0");
  const day = explicit[2].padStart(2, "0");
  const rawYear = explicit[3];
  const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
  return `${year}-${month}-${day}`;
}

function scoreConfidence(parsed: ParsedPdqZReport): number {
  let score = 0;
  const checks = [
    parsed.businessDate,
    parsed.grandTotal,
    parsed.tax,
    parsed.orderCounts.total.qty,
    parsed.categorySales.food.amount,
    parsed.labor.total,
  ];
  score += checks.filter(Boolean).length / checks.length;
  if (
    parsed.grandTotal &&
    parsed.orderCounts.total.amount &&
    parsed.grandTotal === parsed.orderCounts.total.amount
  )
    score += 0.1;
  return Math.max(0, Math.min(1, Number(score.toFixed(3))));
}

/**
 * Parse a PDQ Z-report text dump into the existing daily_sales shape. Real PDQ
 * PDF extracts put labels and values on separate lines; older same-line layouts
 * still work. Section scoping avoids "Total" collisions across deposit/charge/
 * labor blocks.
 */
export function parsePdqZReportText(rawText: string): ParsedPdqZReport {
  const text = rawText.replace(/\r\n/g, "\n");

  const salesSummary = sectionBetween(text, "Sales Summary", [
    "Charge Summary",
    "House Account Charge Summary",
    "Cashier Summary",
    "Labor Summary",
    "Menu Category",
  ]);
  const menuCategory = sectionBetween(text, "Menu Category", [
    "Business Date",
    "Labor Summary",
    "Discount Summary",
  ]);
  const laborSummary = sectionBetween(text, "Labor Summary", [
    "Discount Summary",
    "Payout Summary",
    "Misc Summary",
    "Menu Category",
  ]);
  const discountSummary = sectionBetween(text, "Discount Summary", [
    "Payout Summary",
    "Misc Summary",
    "Menu Category",
  ]);
  const miscSummary = sectionBetween(text, "Misc Summary", [
    "Table Service Guest Summary",
    "Menu Category",
    "Business Date",
  ]);
  const transactionBreakdown = sectionBetween(text, "Transaction Breakdown", [
    "Sales Summary",
    "Shift Deposit",
  ]);
  // Fallback: top of report often IS the transaction block without the title.
  const totalsBlock =
    transactionBreakdown ||
    text.slice(0, Math.min(text.indexOf("Sales Summary") || 1200, 1200));

  const laborTotalRow = countAndAmount(laborSummary, ["Total"]);
  // Labor Total block: qty, $, then fraction (0.34) or percent (34%).
  const laborPct = (() => {
    const row = laborSummary.match(
      /(?:^|\n)\s*Total\s*:?\s*(?:\n\s*)+(\d[\d,]*)\s*(?:\n\s*)+(\(?-?\$?\d[\d,]*\.\d{2}\)?)\s*(?:\n\s*)+(\d*\.?\d+)\s*%?/i
    );
    if (!row?.[3]) return firstPercentAfter(laborSummary, ["Labor %", "Labor Percent"]);
    const n = Number.parseFloat(row[3]);
    if (!Number.isFinite(n)) return undefined;
    return (n <= 1 ? n * 100 : n).toFixed(2);
  })();

  const discountTotal = countAndAmount(discountSummary, ["Total"]);
  const discountPct = (() => {
    const row = discountSummary.match(
      /(?:^|\n)\s*Total\s*:?\s*(?:\n\s*)+(\d[\d,]*)\s*(?:\n\s*)+(\(?-?\$?\d[\d,]*\.\d{2}\)?)\s*(?:\n\s*)+(\d*\.?\d+)\s*%/i
    );
    if (!row?.[3]) {
      return firstPercentAfter(discountSummary, [
        "Discount %",
        "Discount Percent",
      ]);
    }
    return Number.parseFloat(row[3]).toFixed(2);
  })();

  const parsed: ParsedPdqZReport = {
    parserVersion: PDQ_PARSER_VERSION,
    confidence: 0,
    needsReview: false,
    warnings: [],
    businessDate: extractBusinessDate(text),
    grandTotal: firstMoneyAfter(totalsBlock, [
      "Grand Total",
      "Net Sales",
      "Total Sales",
    ]),
    subtotal: firstMoneyAfter(totalsBlock, [
      "Subtotal",
      "Sub Total",
      "Gross Sales",
    ]),
    tax: firstMoneyAfter(totalsBlock, ["Sales Tax", "Taxes", "Tax"]),
    orderCounts: {
      pickup: countAndAmount(salesSummary, [
        "Pickup",
        "Pick Up",
        "Carryout",
        "Carry Out",
      ]),
      delivery: countAndAmount(salesSummary, ["Delivery"]),
      bar: countAndAmount(salesSummary, ["Bar"]),
      table: countAndAmount(salesSummary, ["Table", "Dine In", "Dining"]),
      total: countAndAmount(salesSummary, [
        "Total Orders",
        "Order Total",
        "Total",
      ]),
    },
    categorySales: (() => {
      const food = countAndAmount(menuCategory, ["Food", "Food Sales"]);
      const pop = countAndAmount(menuCategory, [
        "Pop",
        "Soda",
        "Soft Drinks",
        "Beverage",
      ]);
      const liquor = countAndAmount(menuCategory, ["Liquor", "Spirits"]);
      const beer = countAndAmount(menuCategory, ["Beer"]);
      // PDQ lists Large Pizzas as its own menu category; CTAP treats that as food.
      const largePizzas = countAndAmount(menuCategory, [
        "Large Pizza",
        "Large Pizzas",
      ]);
      return {
        food: mergeCountAmount(food, largePizzas),
        pop,
        liquor,
        beer,
        largePizzas,
      };
    })(),
    labor: {
      headcount:
        laborTotalRow.qty ??
        firstIntegerAfter(laborSummary, [
          "Labor Headcount",
          "Employees",
          "Labor Count",
          "Total",
        ]),
      total:
        laborTotalRow.amount ??
        firstMoneyAfter(laborSummary, ["Labor Total", "Labor", "Wages", "Total"]),
      pct: laborPct,
    },
    voids: countAndAmount(miscSummary, ["# Voids", "Voids", "Void"]),
    discounts: {
      ...discountTotal,
      pct: discountPct,
    },
    cash: {
      expectedCash: firstMoneyAfter(text, [
        "Expected Cash",
        "Cash Due",
      ]),
      creditCards: firstMoneyAfter(totalsBlock, [
        "Credit Cards",
        "Credit Card",
        "Card Total",
      ]),
      creditCardTips: firstMoneyAfter(totalsBlock, [
        "Credit Cards Tips",
        "Credit Card Tips",
        "Card Tips",
      ]),
      payOuts: firstMoneyAfter(totalsBlock, [
        "Pay Outs",
        "Payouts",
        "Paid Outs",
      ]),
    },
  };

  // Prefer the explicit Tax line over any earlier Taxable/Non Tax noise.
  const taxLine = totalsBlock.match(
    /(?:^|\n)\s*Tax\b\s*:?\s*(?:\n\s*){0,2}(\(?-?\$?\d[\d,]*\.\d{2}\)?)/i
  );
  if (taxLine?.[1]) parsed.tax = money(taxLine[1]);

  if (!parsed.businessDate) parsed.warnings.push("Missing business date");
  if (!parsed.grandTotal) parsed.warnings.push("Missing grand total");
  if (!parsed.tax) parsed.warnings.push("Missing tax");
  if (!parsed.orderCounts.total.qty && !parsed.orderCounts.total.amount)
    parsed.warnings.push("Missing total order count/amount");
  if (!parsed.categorySales.food.amount)
    parsed.warnings.push("Missing food category sales");

  parsed.confidence = scoreConfidence(parsed);
  parsed.needsReview = parsed.confidence < 0.75 || parsed.warnings.length > 2;
  return parsed;
}

export function toDailySalesInsert(
  parsed: ParsedPdqZReport,
  provenance: Pick<
    InsertDailySales,
    | "sourceProvider"
    | "sourceMailbox"
    | "sourceMessageId"
    | "sourceAttachmentHash"
    | "dedupeKey"
    | "rawText"
  >
): InsertDailySales | null {
  if (!parsed.businessDate) return null;
  return {
    businessDate: parsed.businessDate,
    grandTotal: parsed.grandTotal,
    tax: parsed.tax,
    pickupQty: parsed.orderCounts.pickup.qty,
    pickupAmount: parsed.orderCounts.pickup.amount,
    deliveryQty: parsed.orderCounts.delivery.qty,
    deliveryAmount: parsed.orderCounts.delivery.amount,
    barQty: parsed.orderCounts.bar.qty,
    barAmount: parsed.orderCounts.bar.amount,
    tableQty: parsed.orderCounts.table.qty,
    tableAmount: parsed.orderCounts.table.amount,
    totalQty: parsed.orderCounts.total.qty,
    totalAmount: parsed.orderCounts.total.amount ?? parsed.grandTotal,
    catFoodQty: parsed.categorySales.food.qty,
    catFoodAmount: parsed.categorySales.food.amount,
    catBeerQty: parsed.categorySales.beer.qty,
    catBeerAmount: parsed.categorySales.beer.amount,
    catLiquorQty: parsed.categorySales.liquor.qty,
    catLiquorAmount: parsed.categorySales.liquor.amount,
    catPopQty: parsed.categorySales.pop.qty,
    catPopAmount: parsed.categorySales.pop.amount,
    catLargePizzasQty: parsed.categorySales.largePizzas.qty,
    catLargePizzasAmount: parsed.categorySales.largePizzas.amount,
    laborHeadcount: parsed.labor.headcount,
    laborTotal: parsed.labor.total,
    laborPct: parsed.labor.pct,
    voidsCount: parsed.voids.qty,
    voidsAmount: parsed.voids.amount,
    discountCount: parsed.discounts.qty,
    discountTotal: parsed.discounts.amount,
    discountPct: parsed.discounts.pct,
    expectedCash: parsed.cash.expectedCash,
    creditCards: parsed.cash.creditCards,
    creditCardTips: parsed.cash.creditCardTips,
    payOuts: parsed.cash.payOuts,
    parserVersion: parsed.parserVersion,
    parserConfidence: parsed.confidence.toFixed(3),
    needsReview: parsed.needsReview,
    ...provenance,
  };
}
