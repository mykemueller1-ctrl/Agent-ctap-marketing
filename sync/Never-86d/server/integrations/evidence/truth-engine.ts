import {
  EVIDENCE_INTAKE_VERSION,
  type EvidenceField,
  type ExtractionResult,
  type ParsedDocument,
  type TruthDocument,
  type TruthLineItem,
} from "./types";

export const REVIEW_CONFIDENCE_FLOOR = 0.75;

function field<T>(
  path: string,
  values: Array<{ extractor: string; value?: T; raw?: string; confidence: number }>
): EvidenceField<T> | undefined {
  const present = values.filter((item) => item.value !== undefined);
  if (present.length === 0) return undefined;

  const first = present[0];
  const conflict = present.some(
    (item) => String(item.value) !== String(first.value)
  );
  const confidence = conflict
    ? Math.min(...present.map((item) => item.confidence)) * 0.5
    : Math.max(...present.map((item) => item.confidence));

  return {
    path,
    value: first.value,
    confidence: Number(confidence.toFixed(3)),
    sources: present.map((item) => ({
      extractor: item.extractor,
      raw: item.raw ?? String(item.value),
    })),
    conflict,
  };
}

function lineItemsFromParsed(parsed: ParsedDocument[]): TruthLineItem[] {
  const primary = parsed.find((item) => item.items.length > 0);
  if (!primary) return [];
  return primary.items.map((item, index) => ({
    product: field(`items.${index}.product`, [
      {
        extractor: primary.parserId,
        value: item.product,
        confidence: primary.confidence,
      },
    ]),
    quantity: field(`items.${index}.quantity`, [
      {
        extractor: primary.parserId,
        value: item.quantity,
        confidence: primary.confidence,
      },
    ]),
    unit: field(`items.${index}.unit`, [
      {
        extractor: primary.parserId,
        value: item.unit,
        confidence: primary.confidence,
      },
    ]),
    unitPrice: field(`items.${index}.unitPrice`, [
      {
        extractor: primary.parserId,
        value: item.unitPrice,
        confidence: primary.confidence,
      },
    ]),
    total: field(`items.${index}.total`, [
      {
        extractor: primary.parserId,
        value: item.total,
        confidence: primary.confidence,
      },
    ]),
  }));
}

export function buildTruth(input: {
  parsed: ParsedDocument[];
  extraction: ExtractionResult;
}): TruthDocument {
  const parsed = input.parsed.filter(Boolean);
  const warnings = parsed.flatMap((item) => item.warnings);
  const invoiceNumber = field(
    "invoiceNumber",
    parsed.map((item) => ({
      extractor: item.parserId,
      value: item.invoiceNumber,
      raw: item.invoiceNumber,
      confidence: item.confidence,
    }))
  );
  const businessDate = field(
    "businessDate",
    parsed.map((item) => ({
      extractor: item.parserId,
      value: item.businessDate,
      raw: item.businessDate,
      confidence: item.confidence,
    }))
  );
  const totalAmount = field(
    "totalAmount",
    parsed.map((item) => ({
      extractor: item.parserId,
      value: item.totalAmount,
      raw: item.totalAmount,
      confidence: item.confidence,
    }))
  );

  const conflicts = [invoiceNumber, businessDate, totalAmount].filter(
    (item) => item?.conflict
  );
  if (conflicts.length) {
    warnings.push(
      `Truth engine flagged ${conflicts.length} conflicting header field(s)`
    );
  }

  const fieldScores = [invoiceNumber, businessDate, totalAmount]
    .filter((item): item is NonNullable<typeof item> => Boolean(item?.value))
    .map((item) => item.confidence);
  const parseScore =
    parsed.reduce((sum, item) => sum + item.confidence, 0) /
    Math.max(parsed.length, 1);
  const confidence = Number(
    (
      (fieldScores.length
        ? fieldScores.reduce((a, b) => a + b, 0) / fieldScores.length
        : parseScore) *
      (input.extraction.confidence || 0.5)
    ).toFixed(3)
  );

  const documentKind =
    parsed.find((item) => item.documentKind !== "unknown")?.documentKind ??
    "unknown";
  const needsReview =
    confidence < REVIEW_CONFIDENCE_FLOOR ||
    conflicts.length > 0 ||
    parsed.some((item) => item.needsReview) ||
    documentKind === "unknown";

  return {
    intakeVersion: EVIDENCE_INTAKE_VERSION,
    vendorKey: parsed.find((item) => item.vendorKey)?.vendorKey,
    documentKind,
    fields: { invoiceNumber, businessDate, totalAmount },
    lineItems: lineItemsFromParsed(parsed),
    needsReview,
    warnings: [...new Set(warnings)],
    confidence,
    extraction: {
      method: input.extraction.method,
      ocrVendor: input.extraction.ocrVendor,
      confidence: input.extraction.confidence,
    },
  };
}
