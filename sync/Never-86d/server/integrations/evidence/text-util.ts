export function money(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = Number.parseFloat(value.replace(/[$,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed.toFixed(2) : undefined;
}

/** Parentheses are credits/returns: (30.00) → -30.00 */
export function signedMoney(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const negative = /^\(.*\)$/.test(value.trim());
  const parsed = money(value.replace(/[()]/g, ""));
  if (!parsed) return undefined;
  return negative ? `-${parsed}` : parsed;
}

export function first(patterns: RegExp[], text: string): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return undefined;
}

export function last(patterns: RegExp[], text: string): string | undefined {
  let found: string | undefined;
  for (const pattern of patterns) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    const matches = [...text.matchAll(new RegExp(pattern.source, flags))];
    const value = matches.at(-1)?.[1]?.trim();
    if (value) found = value;
  }
  return found;
}

export function normalizeLines(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/\s{2,}/g, " "))
    .filter(Boolean);
}

export function isNoiseLine(line: string): boolean {
  return (
    /^\*+/.test(line) ||
    /group total|sub-?total|sales tax|county tax|pay this amount|invoice total|total due|continued|cont\. on page|last page|paca|equal opportunity/i.test(
      line
    )
  );
}

export function finishParse(input: {
  parserId: string;
  parserVersion: string;
  documentKind: import("./types").DocumentKind;
  vendorKey?: string;
  invoiceNumber?: string;
  businessDate?: string;
  totalAmount?: string;
  printedTotal?: string;
  handwrittenTotal?: string;
  continued?: boolean;
  lastPage?: boolean;
  items: import("./types").ParsedLineItem[];
  warnings?: string[];
  rawText: string;
}): import("./types").ParsedDocument {
  const warnings = [...(input.warnings ?? [])];
  if (!input.invoiceNumber && input.documentKind === "invoice") {
    warnings.push("Missing invoice number");
  }
  if (!input.businessDate) warnings.push("Missing date");
  if (!input.totalAmount) warnings.push("Missing total");
  if (input.documentKind === "invoice" && input.items.length === 0) {
    warnings.push("No line items parsed");
  }
  if (input.continued && !input.lastPage) {
    warnings.push("Continued page — wait for last page before booking the total");
  }

  const checks = [
    input.invoiceNumber ?? (input.documentKind !== "invoice" ? "ok" : undefined),
    input.businessDate,
    input.totalAmount,
    input.documentKind !== "invoice" || input.items.length > 0
      ? "items"
      : undefined,
  ];
  const confidence = Number(
    (checks.filter(Boolean).length / checks.length).toFixed(3)
  );

  return {
    parserId: input.parserId,
    parserVersion: input.parserVersion,
    documentKind: input.documentKind,
    vendorKey: input.vendorKey,
    confidence,
    needsReview:
      confidence < 0.75 ||
      warnings.length > 1 ||
      Boolean(input.handwrittenTotal) ||
      Boolean(input.continued && !input.lastPage),
    warnings,
    invoiceNumber: input.invoiceNumber,
    businessDate: input.businessDate,
    totalAmount: input.totalAmount,
    printedTotal: input.printedTotal,
    handwrittenTotal: input.handwrittenTotal,
    continued: input.continued,
    lastPage: input.lastPage,
    items: input.items,
    rawText: input.rawText.trim(),
  };
}
