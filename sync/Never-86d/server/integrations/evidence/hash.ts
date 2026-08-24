import { createHash } from "node:crypto";
import type { CtapIntakeMode, EvidenceDocument, EvidenceMime } from "./types";

export function sha256Hex(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function makeEvidenceDocument(input: {
  id: string;
  bytes: Buffer;
  filename: string;
  mimeType: EvidenceMime;
  sourceKind: CtapIntakeMode;
  vendorKey?: string;
  receivedAt?: string;
}): EvidenceDocument {
  return {
    id: input.id,
    vendorKey: input.vendorKey,
    sourceKind: input.sourceKind,
    mimeType: input.mimeType,
    filename: input.filename,
    bytes: input.bytes,
    receivedAt: input.receivedAt ?? new Date().toISOString(),
    sha256: sha256Hex(input.bytes),
  };
}
