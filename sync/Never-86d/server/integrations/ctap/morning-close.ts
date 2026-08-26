/**
 * Morning close. One parse. Logic, not clicks.
 *
 *   npm run close
 *
 * Z text in → close card out. Invoices are not on the Z.
 */
import { parsePdqZReportText } from "../pdq/parser";
import {
  closeLooksWrong,
  closeSliceFromPdq,
  toCloseArtifact,
  type CloseArtifact,
  type CloseCall,
  type CloseSlice,
} from "./close-looks-wrong";

export function morningCloseFromText(
  raw: string,
  source: string
): {
  parsed: ReturnType<typeof parsePdqZReportText>;
  slice: CloseSlice;
  calls: CloseCall[];
  artifact: CloseArtifact;
} {
  const parsed = parsePdqZReportText(raw);
  const slice = closeSliceFromPdq(parsed);
  const calls = closeLooksWrong(slice);
  return {
    parsed,
    slice,
    calls,
    artifact: toCloseArtifact(slice, source),
  };
}
