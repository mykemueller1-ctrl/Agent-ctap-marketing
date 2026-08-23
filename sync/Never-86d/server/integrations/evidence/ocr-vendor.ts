import type { ExtractionResult, EvidenceMime, OcrVendor } from "./types";

export const OCR_VENDOR_CHOICE = "google_document_ai" as const;

/**
 * Google Document AI Invoice Parser.
 *
 * Why this vendor: CTAP already lives on Google (ops mailbox + Drive).
 * Invoice Parser returns structured invoice fields instead of raw OCR.
 * Textract AnalyzeExpense is the fallback if GCP is a non-starter.
 *
 * No keys in repo or chat. Read only from environment:
 *   DOCUMENT_AI_PROJECT_ID
 *   DOCUMENT_AI_LOCATION          (default us)
 *   DOCUMENT_AI_PROCESSOR_ID
 *   DOCUMENT_AI_ACCESS_TOKEN      (short-lived; never commit)
 */
export type DocumentAiConfig = {
  projectId?: string;
  location?: string;
  processorId?: string;
  accessToken?: string;
  fetchImpl?: typeof fetch;
};

export function readDocumentAiConfig(
  env: NodeJS.ProcessEnv = process.env
): DocumentAiConfig {
  return {
    projectId: env.DOCUMENT_AI_PROJECT_ID,
    location: env.DOCUMENT_AI_LOCATION ?? "us",
    processorId: env.DOCUMENT_AI_PROCESSOR_ID,
    accessToken: env.DOCUMENT_AI_ACCESS_TOKEN,
  };
}

export function isDocumentAiConfigured(config: DocumentAiConfig): boolean {
  return Boolean(config.projectId && config.processorId && config.accessToken);
}

function notConfigured(warnings: string[] = []): ExtractionResult {
  return {
    text: "",
    pages: [],
    method: "ocr_document_ai",
    ocrVendor: "google_document_ai",
    warnings: [
      "Google Document AI is not configured; OCR vendor stayed behind the interface",
      ...warnings,
    ],
    confidence: 0,
  };
}

type DocumentAiEntity = {
  type?: string;
  mentionText?: string;
  confidence?: number;
};

type DocumentAiResponse = {
  document?: {
    text?: string;
    pages?: Array<{ layout?: { textAnchor?: unknown } }>;
    entities?: DocumentAiEntity[];
  };
  error?: { message?: string };
};

function flattenEntities(entities: DocumentAiEntity[] | undefined): string {
  if (!entities?.length) return "";
  return entities
    .map((entity) =>
      entity.mentionText
        ? `${entity.type ?? "field"}: ${entity.mentionText}`
        : undefined
    )
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

export class GoogleDocumentAiOcrVendor implements OcrVendor {
  readonly vendorId = "google_document_ai" as const;

  constructor(private readonly config: DocumentAiConfig = readDocumentAiConfig()) {}

  async extract(input: {
    bytes: Buffer;
    mimeType: EvidenceMime;
    filename?: string;
  }): Promise<ExtractionResult> {
    if (!isDocumentAiConfigured(this.config)) {
      return notConfigured();
    }

    const location = this.config.location ?? "us";
    const url = `https://${location}-documentai.googleapis.com/v1/projects/${this.config.projectId}/locations/${location}/processors/${this.config.processorId}:process`;
    const fetchImpl = this.config.fetchImpl ?? fetch;

    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rawDocument: {
          content: input.bytes.toString("base64"),
          mimeType: input.mimeType,
        },
      }),
    });

    if (!response.ok) {
      return notConfigured([
        `Document AI HTTP ${response.status} ${response.statusText}`,
      ]);
    }

    const payload = (await response.json()) as DocumentAiResponse;
    if (payload.error?.message) {
      return notConfigured([payload.error.message]);
    }

    const text = (payload.document?.text ?? "").trim();
    const entityText = flattenEntities(payload.document?.entities);
    const combined = [text, entityText].filter(Boolean).join("\n");

    return {
      text: combined,
      pages: combined ? [{ page: 1, text: combined }] : [],
      method: "ocr_document_ai",
      ocrVendor: "google_document_ai",
      warnings: combined ? [] : ["Document AI returned no text"],
      confidence: combined ? 0.88 : 0,
    };
  }
}

/** Test-only vendor. Never used for store photos. */
export class FixtureOcrVendor implements OcrVendor {
  readonly vendorId = "fixture" as const;

  constructor(private readonly text: string) {}

  async extract(): Promise<ExtractionResult> {
    return {
      text: this.text,
      pages: [{ page: 1, text: this.text }],
      method: "ocr_fixture",
      ocrVendor: "none",
      warnings: ["fixture OCR — synthetic text only"],
      confidence: 0.8,
    };
  }
}
