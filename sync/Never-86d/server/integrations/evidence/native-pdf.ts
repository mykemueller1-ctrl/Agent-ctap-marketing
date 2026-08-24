import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type { ExtractionResult, NativePdfExtractor } from "./types";

const execFileAsync = promisify(execFile);

export type PdfExtractionResult = {
  text: string;
  method: "pdftotext" | "native_pdf_objects" | "utf8-fallback";
  warnings: string[];
};

export function normalizePdfText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\t ]+$/gm, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function unescapePdfLiteral(value: string): string {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

/**
 * Read text from uncompressed PDF string operators. Covers the synthetic
 * fixtures and many native vendor PDFs that do not need OCR.
 */
export function extractTextFromPdfObjects(buffer: Buffer): string {
  const raw = buffer.toString("latin1");
  const chunks: string[] = [];

  for (const match of raw.matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj/g)) {
    chunks.push(unescapePdfLiteral(match[1] ?? ""));
  }
  for (const match of raw.matchAll(/\[([\s\S]*?)\]\s*TJ/g)) {
    for (const inner of (match[1] ?? "").matchAll(
      /\(((?:\\.|[^\\)])*)\)/g
    )) {
      chunks.push(unescapePdfLiteral(inner[1] ?? ""));
    }
  }

  return normalizePdfText(chunks.join("\n"));
}

async function tryPdftotext(
  buffer: Buffer,
  filename: string
): Promise<PdfExtractionResult | undefined> {
  const tempDir = await mkdtemp(join(tmpdir(), "ctap-pdf-"));
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_") || "source.pdf";
  const pdfPath = join(
    tempDir,
    safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`
  );
  const textPath = join(tempDir, "extracted.txt");

  try {
    await writeFile(pdfPath, buffer);
    await execFileAsync("pdftotext", ["-layout", pdfPath, textPath], {
      maxBuffer: 10 * 1024 * 1024,
    });
    const text = normalizePdfText(await readFile(textPath, "utf8"));
    return {
      text,
      method: "pdftotext",
      warnings: text ? [] : ["pdftotext completed but returned no text"],
    };
  } catch {
    return undefined;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function extractPdfTextFromBuffer(
  buffer: Buffer,
  filename = "source.pdf"
): Promise<PdfExtractionResult> {
  const fromPdftotext = await tryPdftotext(buffer, filename);
  if (fromPdftotext?.text) return fromPdftotext;

  const fromObjects = extractTextFromPdfObjects(buffer);
  if (fromObjects) {
    return {
      text: fromObjects,
      method: "native_pdf_objects",
      warnings: fromPdftotext
        ? fromPdftotext.warnings
        : ["pdftotext unavailable; used native PDF text operators"],
    };
  }

  const fallback = normalizePdfText(buffer.toString("utf8"));
  return {
    text: fallback,
    method: "utf8-fallback",
    warnings: [
      "native PDF extract returned no text; utf8 fallback used",
      ...(fromPdftotext?.warnings ?? []),
    ],
  };
}

export async function extractPdfTextFromFile(
  path: string
): Promise<PdfExtractionResult> {
  const buffer = await readFile(path);
  return extractPdfTextFromBuffer(buffer, path.split("/").pop() ?? "source.pdf");
}

export function toExtractionResult(
  result: PdfExtractionResult
): ExtractionResult {
  return {
    text: result.text,
    pages: result.text ? [{ page: 1, text: result.text }] : [],
    method: result.method === "pdftotext" ? "pdftotext" : "native_pdf",
    ocrVendor: "none",
    warnings: result.warnings,
    confidence: result.text ? (result.method === "utf8-fallback" ? 0.35 : 0.92) : 0,
  };
}

export const nativePdfExtractor: NativePdfExtractor = {
  async extract(bytes, filename) {
    return toExtractionResult(await extractPdfTextFromBuffer(bytes, filename));
  },
};
