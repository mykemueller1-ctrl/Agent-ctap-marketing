import { finishParse, first, last, money, normalizeLines, signedMoney } from "./text-util";
import type { DocumentParser, ParsedLineItem } from "./types";
import { detectVendorKey } from "./vendor-detect";

function vendorMatch(expected: string, vendorKey?: string, text = ""): boolean {
  return detectVendorKey(text, vendorKey) === expected;
}

function skipItem(product: string): boolean {
  return /invoice|subtotal|group total|sales tax|county tax|balance|amount|payment|date|fuel surcharge|deposit|empty|return|paca/i.test(
    product
  );
}

/** PFS delivery invoice: [order] [ship] unit size brand sku description price extension */
function parsePfsLines(text: string): ParsedLineItem[] {
  const items: ParsedLineItem[] = [];
  for (const line of normalizeLines(text)) {
    const match = line.match(
      /^(\d+(?:\.\d+)?)(?:\s+(\d+(?:\.\d+)?))?\s+(CS|EA|SCS|LB)\s+\S+\s+\S+\s+(\S+)\s+(.+?)\s+\$?([\d,]+\.\d{2})\s+\$?([\d,]+\.\d{2})$/i
    );
    if (!match) continue;
    const product = match[5].replace(/\s+\d+\s+1\s+(EA|OZ|LB|GAL).*$/i, "").trim();
    if (skipItem(product)) continue;
    const shipQty = match[2] ?? match[1];
    items.push({
      sku: match[4],
      product,
      quantity: Number.parseFloat(shipQty),
      unit: match[3].toUpperCase(),
      unitPrice: money(match[6]),
      total: money(match[7]),
    });
  }
  return items;
}

/** Sysco: qty u/m ... description itemCode price extension */
function parseSyscoLines(text: string): ParsedLineItem[] {
  const items: ParsedLineItem[] = [];
  for (const line of normalizeLines(text)) {
    const match = line.match(
      /^(\d+(?:\.\d+)?)\s+(CS|EA|S|SCS)\s+.+?\s+(\d{5,})\s+\$?([\d,]+\.\d{2,3})\s+\$?([\d,]+\.\d{2})$/i
    );
    if (!match) continue;
    const productMatch = line.match(
      /^\d+(?:\.\d+)?\s+(?:CS|EA|S|SCS)\s+(?:\S+\s+){0,3}(.+?)\s+\d{5,}\s+/i
    );
    const product = (productMatch?.[1] ?? "item").trim();
    if (skipItem(product) || /\*\*/.test(product)) continue;
    items.push({
      sku: match[3],
      product,
      quantity: Number.parseFloat(match[1]),
      unit: match[2].toUpperCase(),
      unitPrice: money(match[4]),
      total: money(match[5]),
    });
  }
  return items;
}

/** Northern Lights: item# upc? description pack qty price extended */
function parseNlLines(text: string): ParsedLineItem[] {
  const items: ParsedLineItem[] = [];
  for (const line of normalizeLines(text)) {
    if (/\*\*/.test(line)) continue;
    const match = line.match(
      /^(\d{4,})\s+(?:\d{8,}\s+)?(.+?)\s+(\d+(?:\.\d+)?)\s+\$?([\d,]+\.\d{2})\s+\$?([\d,]+\.\d{2})$/
    );
    if (!match) continue;
    const product = match[2].replace(/\s+\S+$/, "").trim();
    if (skipItem(product)) continue;
    items.push({
      sku: match[1],
      product,
      quantity: Number.parseFloat(match[3]),
      unitPrice: money(match[4]),
      total: money(match[5]),
    });
  }
  return items;
}

/** Humes / FT Dodge beer: code qty description price ... amount */
function parseBeerLines(text: string): ParsedLineItem[] {
  const items: ParsedLineItem[] = [];
  for (const line of normalizeLines(text)) {
    const match = line.match(
      /^(\d{3,})\s+(\(?-?\d+\)?)\s+(.+?)\s+(-?\$?[\d,]+\.\d{2}|\(\$?[\d,]+\.\d{2}\))$/
    );
    if (!match) continue;
    const product = match[3]
      .replace(/\d{11,}/g, "")
      .replace(/\$?[\d,]+\.\d{2}/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!product || /fuel surcharge|invoice total|total due/i.test(product)) {
      continue;
    }
    const qtyRaw = match[2].replace(/[()]/g, "");
    const qty = Number.parseFloat(qtyRaw);
    items.push({
      sku: match[1],
      product,
      quantity: match[2].includes("(") || match[2].startsWith("-") ? -Math.abs(qty) : qty,
      total: signedMoney(match[4]),
    });
  }
  return items;
}

function parseSawyerLines(text: string): ParsedLineItem[] {
  const items: ParsedLineItem[] = [];
  for (const line of normalizeLines(text)) {
    if (/strike|~~/i.test(line)) continue;
    const match = line.match(
      /^(.{3,}?)\s+(\d+\.\d{2})\s+(\d+(?:\.\d+)?)\s+(\d+\.\d{2})$/
    );
    if (!match) continue;
    if (/total|sold to|date/i.test(match[1])) continue;
    items.push({
      product: match[1].trim(),
      unitPrice: money(match[2]),
      quantity: Number.parseFloat(match[3]),
      unit: "LB",
      total: money(match[4]),
    });
  }
  return items;
}

function parseHyveeWineLines(text: string): ParsedLineItem[] {
  const items: ParsedLineItem[] = [];
  for (const line of normalizeLines(text)) {
    const match = line.match(
      /^(\d+)\s+(\d+)\s+(\d{4,})\s+([\d.]+)\s+(?:Liter\s+)?(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})$/i
    );
    if (!match) continue;
    items.push({
      sku: match[3],
      product: match[5].trim(),
      quantity: Number.parseFloat(match[2]),
      unit: "BTL",
      unitPrice: money(match[6]),
      total: money(match[7]),
    });
  }
  return items;
}

function parseGroceryLines(text: string): ParsedLineItem[] {
  const items: ParsedLineItem[] = [];
  for (const line of normalizeLines(text)) {
    const match = line.match(
      /^(.+?)\s+(\d+)\s*@\s*([\d.]+)\s+([\d,]+\.\d{2})/i
    );
    if (!match) continue;
    items.push({
      product: match[1].trim(),
      quantity: Number.parseFloat(match[2]),
      unitPrice: money(match[3]),
      total: money(match[4]),
    });
  }
  return items;
}

const WEEKDAY_NAMED_DATE =
  /(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?),?\s+((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4})/i;

function headerFields(text: string) {
  return {
    invoiceNumber: first(
      [
        /invoice\s*(?:num(?:ber)?|#)?\s*[:#]?\s*([A-Z]?-?\d{4,})/i,
        /inv[#\s-]*([A-Z]?-?\d{4,})/i,
      ],
      text
    ),
    businessDate: first(
      [
        WEEKDAY_NAMED_DATE,
        /(?:invoice|delivery|print)?\s*date\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
        /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/,
      ],
      text
    ),
    continued: /continued|cont\.?\s*on page/i.test(text),
    lastPage:
      /last page|page\s+\d+\s+of\s+\d+|page 1 of 1|pay this amount/i.test(text),
    handwrittenTotal: money(
      first(
        [
          /handwritten\s*(?:total)?\s*:?\s*\$?([\d,]+\.\d{2})/i,
          /\$([\d,]+\.\d{2})\s*check/i,
        ],
        text
      )
    ),
  };
}

function pickTotal(text: string, extra: RegExp[] = []): string | undefined {
  return money(
    last(
      [
        ...extra,
        /pay this amount\s*:?\s*\$?([\d,]+\.\d{2})/i,
        /invoice total\s*:?\s*\$?([\d,]+\.\d{2})/i,
        /total due\s*:?\s*\$?([\d,]+\.\d{2})/i,
        /(?:^|\n)\s*total\s*:?\s*\$?([\d,]+\.\d{2})/im,
      ],
      text
    )
  );
}

function makeParser(
  parserId: string,
  vendorKey: string,
  parseItems: (text: string) => ParsedLineItem[],
  documentKind: import("./types").DocumentKind = "invoice"
): DocumentParser {
  return {
    parserId,
    parserVersion: `${parserId}-v1`,
    canParse({ vendorKey: hinted, text }) {
      return vendorMatch(vendorKey, hinted, text);
    },
    parse(text, hinted) {
      const headers = headerFields(text);
      const printedTotal = pickTotal(text);
      const totalAmount = headers.handwrittenTotal ?? printedTotal;
      return finishParse({
        parserId,
        parserVersion: `${parserId}-v1`,
        documentKind,
        vendorKey: detectVendorKey(text, hinted) ?? vendorKey,
        ...headers,
        printedTotal,
        totalAmount,
        items: parseItems(text),
        rawText: text,
        warnings: headers.handwrittenTotal
          ? ["Handwritten total overrides printed total"]
          : [],
      });
    },
  };
}

export const pfsDeliveryParser = makeParser(
  "pfs-delivery",
  "performance_foods",
  parsePfsLines
);
export const syscoInvoiceParser = makeParser("sysco-invoice", "sysco", parseSyscoLines);
export const northernLightsParser = makeParser(
  "nl-invoice",
  "northern_lights",
  parseNlLines
);
export const humesInvoiceParser = makeParser("humes-invoice", "humes", parseBeerLines);
export const fortDodgeParser = makeParser(
  "fdd-invoice",
  "fort_dodge_distributing",
  parseBeerLines
);
export const hyveeWineParser = makeParser(
  "hyvee-wine",
  "hyvee_wine",
  parseHyveeWineLines
);
export const sawyerTicketParser = makeParser(
  "sawyer-ticket",
  "sawyer_meats",
  parseSawyerLines
);
export const confluenceParser = makeParser(
  "confluence-invoice",
  "confluence",
  (text) => {
    const items: ParsedLineItem[] = [];
    for (const line of normalizeLines(text)) {
      const match = line.match(
        /^(\d+)\s+(.+?)\s+\$?([\d,]+\.\d{2})\s+\$?([\d,]+\.\d{2})$/
      );
      if (!match || /total|empty/i.test(match[2])) continue;
      items.push({
        product: match[2].trim(),
        quantity: Number.parseFloat(match[1]),
        unitPrice: money(match[3]),
        total: money(match[4]),
      });
    }
    return items;
  }
);

export const hyveeGroceryParser: DocumentParser = {
  parserId: "hyvee-grocery",
  parserVersion: "hyvee-grocery-v1",
  canParse({ vendorKey, text }) {
    return vendorMatch("hyvee_grocery", vendorKey, text);
  },
  parse(text, vendorKey) {
    const headers = headerFields(text);
    const totalAmount = pickTotal(text, [/subtotal\s*(?:\[\d+\])?\s*\$?([\d,]+\.\d{2})/i]);
    return finishParse({
      parserId: "hyvee-grocery",
      parserVersion: "hyvee-grocery-v1",
      documentKind: "grocery_receipt",
      vendorKey: detectVendorKey(text, vendorKey) ?? "hyvee_grocery",
      invoiceNumber: first([/trx\s*:?\s*([\d\s]+)/i], text),
      businessDate: headers.businessDate,
      totalAmount,
      printedTotal: totalAmount,
      items: parseGroceryLines(text),
      rawText: text,
    });
  },
};

export const pdqPayoutParser: DocumentParser = {
  parserId: "pdq-payout",
  parserVersion: "pdq-payout-v1",
  canParse({ vendorKey, text }) {
    return vendorMatch("pdq_payout", vendorKey, text);
  },
  parse(text, vendorKey) {
    const printed = money(first([/amount\s*:?\s*\$?([\d,]+\.\d{2})/i], text));
    const paidOut = money(first([/\$?([\d,]+\.\d{2})\s*paid\s*out/i], text));
    const priorPaid = money(
      first([/\$?([\d,]+\.\d{2})\s+PAID\b(?!\s*out)/i], text)
    );
    const hours = first([/(\d+(?:\.\d+)?)\s*hrs?\b/i], text);
    const rateTimes = text.match(
      /(\d+\.\d{2})\s*[x×]\s*(\d+(?:\.\d+)?)/i
    );
    const amount = paidOut ?? printed;
    const account = first([/account\s*name\s*:?\s*(.+)$/im], text);
    const description = first([/description\s*:?\s*(.+)$/im], text);
    const warnings: string[] = [];
    if (hours && rateTimes) {
      warnings.push(`Labor slip: ${hours} hrs × ${rateTimes[1]}`);
    }
    if (priorPaid) {
      warnings.push(`Previous payout ${priorPaid} noted on slip`);
    }
    if (paidOut) {
      warnings.push("Handwritten total overrides printed total");
    }
    const laborProduct =
      hours && rateTimes ? `Labor ${hours} hrs × ${rateTimes[1]}` : undefined;
    return finishParse({
      parserId: "pdq-payout",
      parserVersion: "pdq-payout-v1",
      documentKind: "payout",
      vendorKey: detectVendorKey(text, vendorKey) ?? "pdq_payout",
      invoiceNumber: first([/account\s*number\s*:?\s*(\d+)/i], text),
      businessDate: first(
        [
          /(\d{1,2}\/\d{1,2}\/\d{4})\s+\d{1,2}:\d{2}/,
          /(\d{1,2}-\d{1,2}-\d{4})/,
          /(\d{1,2}\/\d{1,2}\/\d{4})/,
        ],
        text
      ),
      totalAmount: amount,
      printedTotal: printed,
      handwrittenTotal: paidOut,
      items: account
        ? [{ product: `${account}${description ? ` / ${description}` : ""}`, total: amount }]
        : laborProduct
          ? [{ product: laborProduct, total: amount }]
          : [],
      warnings,
      rawText: text,
    });
  },
};

export const VENDOR_PARSERS: DocumentParser[] = [
  pdqPayoutParser,
  hyveeWineParser,
  hyveeGroceryParser,
  pfsDeliveryParser,
  syscoInvoiceParser,
  northernLightsParser,
  sawyerTicketParser,
  humesInvoiceParser,
  fortDodgeParser,
  confluenceParser,
];
