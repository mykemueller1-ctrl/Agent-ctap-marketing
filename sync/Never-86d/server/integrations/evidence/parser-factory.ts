import type {
  DocumentKind,
  DocumentParser,
  ParsedDocument,
  ParsedLineItem,
} from "./types";
import { VENDOR_PARSERS } from "./vendor-parsers";

function money(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = Number.parseFloat(value.replace(/[$,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed.toFixed(2) : undefined;
}

function first(patterns: RegExp[], text: string): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return undefined;
}

function parseLineItems(text: string): ParsedLineItem[] {
  const items: ParsedLineItem[] = [];
  for (const rawLine of text.split(/\n+/)) {
    const line = rawLine.trim().replace(/\s{2,}/g, " ");
    const match = line.match(
      /^(?:(\d{3,})\s+)?(.{4,}?)\s+(\d+(?:\.\d+)?)\s*(CASE|CS|EA|BTL|BOTTLE|KEG|PK|CAN|BBL|LB)?\s+\$?([\d,]+\.\d{2})\s+\$?([\d,]+\.\d{2})$/i
    );
    if (!match) continue;
    const product = match[2].trim();
    if (/invoice|subtotal|total|tax|balance|amount|payment|date/i.test(product)) {
      continue;
    }
    items.push({
      sku: match[1],
      product,
      quantity: Number.parseFloat(match[3]),
      unit: match[4]?.toUpperCase(),
      unitPrice: money(match[5]),
      total: money(match[6]),
    });
  }
  return items;
}

export function looksLikeZReport(text: string): boolean {
  return (
    /z\s*-?\s*report/i.test(text) ||
    (/sales summary/i.test(text) && /menu category/i.test(text))
  );
}

function inferKind(vendorKey: string | undefined, text: string): DocumentKind {
  if (vendorKey === "pdq" || looksLikeZReport(text)) return "z_report";
  if (/invoice|order confirmation/i.test(text)) return "invoice";
  return "unknown";
}

export const genericInvoiceParser: DocumentParser = {
  parserId: "generic-invoice",
  parserVersion: "generic-invoice-v1",
  canParse({ vendorKey, text }) {
    return inferKind(vendorKey, text) !== "z_report";
  },
  parse(text, vendorKey) {
    const invoiceNumber = first(
      [
        /invoice\s*(?:number|#)?\s*[:#]?\s*([A-Z0-9-]+)/i,
        /inv[#\s-]*([A-Z0-9-]+)/i,
      ],
      text
    );
    const businessDate = first(
      [
        /(?:invoice\s*)?date\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
        /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/,
      ],
      text
    );
    const totalAmount = money(
      first(
        [
          /(?:grand\s*)?total\s*:?\s*\$?([\d,]+\.\d{2})/i,
          /amount\s*due\s*:?\s*\$?([\d,]+\.\d{2})/i,
        ],
        text
      )
    );
    const items = parseLineItems(text);
    const warnings: string[] = [];
    if (!invoiceNumber) warnings.push("Missing invoice number");
    if (!businessDate) warnings.push("Missing invoice date");
    if (!totalAmount) warnings.push("Missing invoice total");
    if (items.length === 0) warnings.push("No line items parsed");

    const checks = [
      invoiceNumber,
      businessDate,
      totalAmount,
      items.length > 0 ? "items" : undefined,
    ];
    const confidence = Number(
      (checks.filter(Boolean).length / checks.length).toFixed(3)
    );

    return {
      parserId: this.parserId,
      parserVersion: this.parserVersion,
      documentKind: inferKind(vendorKey, text),
      vendorKey,
      confidence,
      needsReview: confidence < 0.75 || warnings.length > 1,
      warnings,
      invoiceNumber,
      businessDate,
      totalAmount,
      items,
      rawText: text.trim(),
    };
  },
};

export const zReportStubParser: DocumentParser = {
  parserId: "pdq-z-report-handoff",
  parserVersion: "pdq-z-report-v2",
  canParse({ vendorKey, text }) {
    return inferKind(vendorKey, text) === "z_report";
  },
  parse(text, vendorKey) {
    return {
      parserId: this.parserId,
      parserVersion: this.parserVersion,
      documentKind: "z_report",
      vendorKey: vendorKey ?? "pdq",
      confidence: 0.2,
      needsReview: true,
      warnings: [
        "Z-report detected — hand off to pdq-z-report-v2, do not OCR-parse it here",
      ],
      items: [],
      rawText: text.trim(),
    };
  },
};

const PARSERS: DocumentParser[] = [
  zReportStubParser,
  ...VENDOR_PARSERS,
  genericInvoiceParser,
];

export function createParserFactory(parsers: DocumentParser[] = PARSERS) {
  return {
    select(input: { vendorKey?: string; text: string }): DocumentParser {
      return (
        parsers.find((parser) => parser.canParse(input)) ?? genericInvoiceParser
      );
    },
    parse(text: string, vendorKey?: string): ParsedDocument {
      return this.select({ vendorKey, text }).parse(text, vendorKey);
    },
  };
}

export const parserFactory = createParserFactory();
