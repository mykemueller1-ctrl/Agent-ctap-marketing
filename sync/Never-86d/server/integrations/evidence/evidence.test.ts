import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { makeEvidenceDocument, sha256Hex } from "./hash";
import { extractTextFromPdfObjects, nativePdfExtractor } from "./native-pdf";
import {
  FixtureOcrVendor,
  GoogleDocumentAiOcrVendor,
  OCR_VENDOR_CHOICE,
  isDocumentAiConfigured,
} from "./ocr-vendor";
import { parserFactory } from "./parser-factory";
import { fixturePipelineDeps, ingestEvidence } from "./pipeline";
import { routeExtraction, shouldFallbackToOcr } from "./routing";
import {
  SYNTHETIC_INVOICE,
  SYNTHETIC_PNG,
  buildSyntheticInvoicePdf,
  syntheticInvoicePlainText,
} from "./synthetic-pdf";
import { buildTruth } from "./truth-engine";

const here = dirname(fileURLToPath(import.meta.url));

const FORBIDDEN_FIXTURE_MARKERS = [
  "communitypizza2026@",
  "myke@n86.app",
  "accountspayable@humesdist.com",
  "NoReply@pfgc.com",
  "Sysco",
  "Sawyer Meats",
  "Northern Lights",
  "Humes Distributing",
  "Hy-Vee",
  "239335",
  "439547404",
  "699091",
  "227930",
  "199980",
  "Community Tap",
  "Smokeworx",
];

describe("Phase 1 contracts + routing", () => {
  it("hashes evidence bytes and keeps source metadata", () => {
    const bytes = Buffer.from("synthetic");
    const doc = makeEvidenceDocument({
      id: "ev-1",
      bytes,
      filename: "note.txt",
      mimeType: "text/plain",
      sourceKind: "email_pdf",
      vendorKey: "performance_foods",
    });
    expect(doc.sha256).toBe(sha256Hex(bytes));
    expect(doc.vendorKey).toBe("performance_foods");
  });

  it("sends digital PDFs to native extract and photos to OCR", () => {
    expect(
      routeExtraction({ mimeType: "application/pdf", sourceKind: "email_pdf" })
    ).toBe("native_pdf");
    expect(
      routeExtraction({ mimeType: "image/jpeg", sourceKind: "photo_ocr" })
    ).toBe("ocr");
    expect(
      routeExtraction({ mimeType: "image/heif", sourceKind: "photo_ocr" })
    ).toBe("ocr");
    expect(
      routeExtraction({ mimeType: "image/heic", sourceKind: "photo_ocr" })
    ).toBe("ocr");
    expect(
      routeExtraction({
        mimeType: "application/pdf",
        sourceKind: "email_or_photo",
      })
    ).toBe("native_pdf");
  });

  it("does not OCR a successful email PDF extract", () => {
    expect(
      shouldFallbackToOcr({
        route: "native_pdf",
        text: syntheticInvoicePlainText(),
        sourceKind: "email_pdf",
      })
    ).toBe(false);
  });
});

describe("Phase 2 native PDF extractor", () => {
  it("reads invoice text from a synthetic native PDF", async () => {
    const pdf = buildSyntheticInvoicePdf();
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    const fromObjects = extractTextFromPdfObjects(pdf);
    expect(fromObjects).toContain("INV-1001");
    expect(fromObjects).toContain("ACME Test Produce LLC");
    expect(fromObjects).toContain("43.00");

    const extracted = await nativePdfExtractor.extract(pdf, "acme-inv-1001.pdf");
    expect(extracted.text).toContain("Invoice INV-1001");
    expect(extracted.ocrVendor).toBe("none");
    expect(extracted.method === "native_pdf" || extracted.method === "pdftotext").toBe(
      true
    );
  });
});

describe("Phase 2 OCR vendor + parser factory + truth engine", () => {
  it("chooses Google Document AI and stays dark without secrets", async () => {
    expect(OCR_VENDOR_CHOICE).toBe("google_document_ai");
    expect(isDocumentAiConfigured({})).toBe(false);
    const result = await new GoogleDocumentAiOcrVendor({}).extract({
      bytes: SYNTHETIC_PNG,
      mimeType: "image/png",
    });
    expect(result.text).toBe("");
    expect(result.warnings[0]).toMatch(/not configured/i);
    expect(result.ocrVendor).toBe("google_document_ai");
  });

  it("uses a fixture OCR vendor for photo intake — no real invoice photos", async () => {
    const ocr = new FixtureOcrVendor(syntheticInvoicePlainText());
    const result = await ocr.extract({
      bytes: SYNTHETIC_PNG,
      mimeType: "image/png",
    });
    expect(result.method).toBe("ocr_fixture");
    expect(result.text).toContain("INV-1001");
  });

  it("parses a synthetic invoice and hands Z-reports to pdq-z-report-v2", () => {
    const invoice = parserFactory.parse(syntheticInvoicePlainText(), "demo_vendor");
    expect(invoice.documentKind).toBe("invoice");
    expect(invoice.invoiceNumber).toBe("INV-1001");
    expect(invoice.totalAmount).toBe("43.00");
    expect(invoice.items).toHaveLength(2);
    expect(invoice.items[0]?.product).toMatch(/Romaine/);

    const z = parserFactory.parse(
      "Nightly Z-Report\nSales Summary\nMenu Category\nFood 100.00",
      "pdq"
    );
    expect(z.documentKind).toBe("z_report");
    expect(z.needsReview).toBe(true);
    expect(z.warnings[0]).toMatch(/pdq-z-report-v2/);
  });

  it("flags conflicting totals for review", () => {
    const base = parserFactory.parse(syntheticInvoicePlainText());
    const truth = buildTruth({
      parsed: [
        base,
        { ...base, parserId: "second", totalAmount: "99.00", confidence: 0.9 },
      ],
      extraction: {
        text: base.rawText,
        pages: [],
        method: "native_pdf",
        ocrVendor: "none",
        warnings: [],
        confidence: 0.92,
      },
    });
    expect(truth.fields.totalAmount?.conflict).toBe(true);
    expect(truth.needsReview).toBe(true);
  });

  it("runs the full pipeline on a synthetic PDF", async () => {
    const result = await ingestEvidence({
      id: "ev-pdf-1",
      bytes: buildSyntheticInvoicePdf(),
      filename: "acme-inv-1001.pdf",
      mimeType: "application/pdf",
      sourceKind: "email_pdf",
      vendorKey: "demo_vendor",
    });
    expect(result.document.sha256).toHaveLength(64);
    expect(result.parsed.invoiceNumber).toBe("INV-1001");
    expect(result.truth.fields.totalAmount?.value).toBe("43.00");
    expect(result.truth.lineItems).toHaveLength(2);
    expect(result.truth.needsReview).toBe(false);
  });

  it("runs photo intake through OCR, not native PDF", async () => {
    const result = await ingestEvidence(
      {
        id: "ev-photo-1",
        bytes: SYNTHETIC_PNG,
        filename: "demo-photo.png",
        mimeType: "image/png",
        sourceKind: "photo_ocr",
        vendorKey: "demo_vendor",
      },
      fixturePipelineDeps(syntheticInvoicePlainText())
    );
    expect(result.extraction.method).toBe("ocr_fixture");
    expect(result.parsed.invoiceNumber).toBe("INV-1001");
  });
});

describe("fixture hygiene", () => {
  it("does not embed real invoices, POS exports, or ops emails", () => {
    const sourceFiles = [
      "synthetic-pdf.ts",
      "fixtures/README.md",
      "fixtures/layouts.ts",
    ].map((name) => readFileSync(join(here, name), "utf8"));
    const blob = sourceFiles.join("\n");
    for (const marker of FORBIDDEN_FIXTURE_MARKERS) {
      expect(blob).not.toContain(marker);
    }
    expect(SYNTHETIC_INVOICE.vendorName).toMatch(/ACME Test/);
    expect(SYNTHETIC_PNG.length).toBeLessThan(128);
  });
});
