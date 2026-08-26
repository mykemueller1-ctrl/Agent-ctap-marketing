/**
 * CTAP evidence intake — shared types.
 *
 * Phase 1: contracts only consumers should depend on.
 * Phase 2: native PDF + OCR vendor + parser factory + truth engine
 * implement these types. No production secrets belong here.
 */

export const EVIDENCE_INTAKE_VERSION = "ocr-evidence-intake-v1";

export type CtapIntakeMode =
  | "email_pdf"
  | "photo_ocr"
  | "email_or_photo"
  | "outbound_email_order";

export type EvidenceMime =
  | "application/pdf"
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/heif"
  | "image/heic"
  | "text/plain";

export type DocumentKind =
  | "invoice"
  | "z_report"
  | "grocery_receipt"
  | "payout"
  | "unknown";

export type VendorKey =
  | "performance_foods"
  | "sysco"
  | "northern_lights"
  | "sawyer_meats"
  | "humes"
  | "hyvee_wine"
  | "hyvee_grocery"
  | "fort_dodge_distributing"
  | "confluence"
  | "pdq"
  | "pdq_payout"
  | "demo_vendor";

export type ExtractMethod =
  | "native_pdf"
  | "pdftotext"
  | "ocr_document_ai"
  | "ocr_fixture"
  | "utf8";

export type EvidenceDocument = {
  id: string;
  vendorKey?: string;
  sourceKind: CtapIntakeMode;
  mimeType: EvidenceMime;
  filename: string;
  bytes: Buffer;
  receivedAt: string;
  sha256: string;
};

export type ExtractedPage = {
  page: number;
  text: string;
};

export type ExtractionResult = {
  text: string;
  pages: ExtractedPage[];
  method: ExtractMethod;
  ocrVendor: "google_document_ai" | "none";
  warnings: string[];
  confidence: number;
};

export type EvidenceField<T = string> = {
  path: string;
  value?: T;
  confidence: number;
  sources: Array<{ extractor: string; raw: string }>;
  conflict: boolean;
};

export type ParsedLineItem = {
  sku?: string;
  product: string;
  quantity?: number;
  unit?: string;
  unitPrice?: string;
  total?: string;
};

export type ParsedDocument = {
  parserId: string;
  parserVersion: string;
  documentKind: DocumentKind;
  vendorKey?: string;
  confidence: number;
  needsReview: boolean;
  warnings: string[];
  invoiceNumber?: string;
  businessDate?: string;
  totalAmount?: string;
  printedTotal?: string;
  handwrittenTotal?: string;
  continued?: boolean;
  lastPage?: boolean;
  items: ParsedLineItem[];
  rawText: string;
};

export type TruthLineItem = {
  product?: EvidenceField;
  quantity?: EvidenceField<number>;
  unit?: EvidenceField;
  unitPrice?: EvidenceField;
  total?: EvidenceField;
};

export type TruthDocument = {
  intakeVersion: typeof EVIDENCE_INTAKE_VERSION;
  vendorKey?: string;
  documentKind: DocumentKind;
  fields: {
    invoiceNumber?: EvidenceField;
    businessDate?: EvidenceField;
    totalAmount?: EvidenceField;
  };
  lineItems: TruthLineItem[];
  needsReview: boolean;
  warnings: string[];
  confidence: number;
  inWeekWindow?: boolean;
  excludeFromBook?: boolean;
  extraction: Pick<ExtractionResult, "method" | "ocrVendor" | "confidence">;
};

export type NativePdfExtractor = {
  extract(bytes: Buffer, filename?: string): Promise<ExtractionResult>;
};

export type OcrVendor = {
  readonly vendorId: "google_document_ai" | "fixture";
  extract(input: {
    bytes: Buffer;
    mimeType: EvidenceMime;
    filename?: string;
  }): Promise<ExtractionResult>;
};

export type DocumentParser = {
  readonly parserId: string;
  readonly parserVersion: string;
  canParse(input: { vendorKey?: string; text: string }): boolean;
  parse(text: string, vendorKey?: string): ParsedDocument;
};

export type EvidencePipelineResult = {
  document: EvidenceDocument;
  extraction: ExtractionResult;
  parsed: ParsedDocument;
  truth: TruthDocument;
};
