export { EVIDENCE_INTAKE_VERSION } from "./types";
export type {
  CtapIntakeMode,
  DocumentKind,
  DocumentParser,
  EvidenceDocument,
  EvidenceField,
  EvidenceMime,
  EvidencePipelineResult,
  ExtractionResult,
  NativePdfExtractor,
  OcrVendor,
  ParsedDocument,
  ParsedLineItem,
  TruthDocument,
} from "./types";

export { makeEvidenceDocument, sha256Hex } from "./hash";
export {
  extractPdfTextFromBuffer,
  extractPdfTextFromFile,
  extractTextFromPdfObjects,
  nativePdfExtractor,
  normalizePdfText,
} from "./native-pdf";
export {
  FixtureOcrVendor,
  GoogleDocumentAiOcrVendor,
  OCR_VENDOR_CHOICE,
  isDocumentAiConfigured,
  readDocumentAiConfig,
} from "./ocr-vendor";
export {
  createParserFactory,
  genericInvoiceParser,
  looksLikeZReport,
  parserFactory,
  zReportStubParser,
} from "./parser-factory";
export { detectVendorKey } from "./vendor-detect";
export { VENDOR_PARSERS } from "./vendor-parsers";
export {
  createDefaultDeps,
  extractEvidence,
  fixturePipelineDeps,
  ingestEvidence,
} from "./pipeline";
export { routeExtraction, shouldFallbackToOcr } from "./routing";
export {
  SYNTHETIC_INVOICE,
  SYNTHETIC_PNG,
  buildMinimalPdf,
  buildSyntheticInvoicePdf,
  syntheticInvoicePlainText,
} from "./synthetic-pdf";
export { REVIEW_CONFIDENCE_FLOOR, buildTruth } from "./truth-engine";
