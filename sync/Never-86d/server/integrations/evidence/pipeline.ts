import { makeEvidenceDocument } from "./hash";
import { nativePdfExtractor } from "./native-pdf";
import {
  FixtureOcrVendor,
  GoogleDocumentAiOcrVendor,
  type DocumentAiConfig,
} from "./ocr-vendor";
import { parserFactory } from "./parser-factory";
import { routeExtraction, shouldFallbackToOcr } from "./routing";
import { buildTruth } from "./truth-engine";
import {
  CTAP_WEEK_2026_08_16,
  applyWeekWindow,
  type DateWindow,
} from "./week-window";
import type {
  CtapIntakeMode,
  EvidenceDocument,
  EvidenceMime,
  EvidencePipelineResult,
  ExtractionResult,
  NativePdfExtractor,
  OcrVendor,
} from "./types";

export type PipelineDeps = {
  pdf: NativePdfExtractor;
  ocr: OcrVendor;
};

export function createDefaultDeps(config?: DocumentAiConfig): PipelineDeps {
  return {
    pdf: nativePdfExtractor,
    ocr: new GoogleDocumentAiOcrVendor(config),
  };
}

export async function extractEvidence(
  document: EvidenceDocument,
  deps: PipelineDeps
): Promise<ExtractionResult> {
  const route = routeExtraction({
    mimeType: document.mimeType,
    sourceKind: document.sourceKind,
  });

  if (route === "plain_text") {
    const text = document.bytes.toString("utf8").trim();
    return {
      text,
      pages: text ? [{ page: 1, text }] : [],
      method: "utf8",
      ocrVendor: "none",
      warnings: [],
      confidence: text ? 0.95 : 0,
    };
  }

  if (route === "ocr") {
    return deps.ocr.extract({
      bytes: document.bytes,
      mimeType: document.mimeType,
      filename: document.filename,
    });
  }

  const native = await deps.pdf.extract(document.bytes, document.filename);
  if (
    shouldFallbackToOcr({
      route,
      text: native.text,
      sourceKind: document.sourceKind,
    })
  ) {
    const ocr = await deps.ocr.extract({
      bytes: document.bytes,
      mimeType: document.mimeType,
      filename: document.filename,
    });
    if (ocr.text) {
      return {
        ...ocr,
        warnings: [
          ...native.warnings,
          "native PDF text was thin; fell back to OCR vendor",
          ...ocr.warnings,
        ],
      };
    }
    return {
      ...native,
      warnings: [
        ...native.warnings,
        "OCR fallback produced no text; keeping native extract",
        ...ocr.warnings,
      ],
    };
  }

  return native;
}

export async function ingestEvidence(
  input: {
    id: string;
    bytes: Buffer;
    filename: string;
    mimeType: EvidenceMime;
    sourceKind: CtapIntakeMode;
    vendorKey?: string;
    weekWindow?: DateWindow;
  },
  deps: PipelineDeps = createDefaultDeps()
): Promise<EvidencePipelineResult> {
  const document = makeEvidenceDocument(input);
  const extraction = await extractEvidence(document, deps);
  const parsed = parserFactory.parse(extraction.text, document.vendorKey);
  const truth = applyWeekWindow(
    buildTruth({ parsed: [parsed], extraction }),
    parsed,
    input.weekWindow ?? CTAP_WEEK_2026_08_16
  );
  return { document, extraction, parsed, truth };
}

export function fixturePipelineDeps(ocrText: string): PipelineDeps {
  return {
    pdf: nativePdfExtractor,
    ocr: new FixtureOcrVendor(ocrText),
  };
}
