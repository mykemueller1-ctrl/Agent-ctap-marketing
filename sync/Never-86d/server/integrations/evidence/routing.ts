import type { CtapIntakeMode, EvidenceMime, ExtractMethod } from "./types";

export type ExtractRoute = "native_pdf" | "ocr" | "plain_text";

/**
 * Digital PDFs go through native text extract first. Photos (Sysco, Northern
 * Lights, Sawyer — including last week's HEIC drop) go to the OCR vendor.
 * Mixed email/photo vendors try native PDF when the payload is a PDF,
 * otherwise OCR.
 */
export function routeExtraction(input: {
  mimeType: EvidenceMime;
  sourceKind: CtapIntakeMode;
}): ExtractRoute {
  if (input.mimeType === "text/plain") return "plain_text";
  if (input.mimeType === "application/pdf") {
    if (input.sourceKind === "photo_ocr") return "ocr";
    return "native_pdf";
  }
  if (input.mimeType.startsWith("image/")) return "ocr";
  if (input.sourceKind === "photo_ocr") return "ocr";
  return "native_pdf";
}

export function methodForRoute(route: ExtractRoute): ExtractMethod {
  if (route === "ocr") return "ocr_document_ai";
  if (route === "plain_text") return "utf8";
  return "native_pdf";
}

export function shouldFallbackToOcr(input: {
  route: ExtractRoute;
  text: string;
  sourceKind: CtapIntakeMode;
}): boolean {
  if (input.route !== "native_pdf") return false;
  if (input.sourceKind === "email_pdf") return false;
  return input.text.trim().length < 24;
}
