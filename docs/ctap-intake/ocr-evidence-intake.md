# OCR evidence intake — CTO decision

Status: Phase 1 contracts + Phase 2 implementation landed on `cursor/ocr-evidence-intake-v1-0561`.
Do not merge to production or deploy until tests stay green and Never-86d is cherry-picked.

## What shipped

Code lives under `sync/Never-86d/server/integrations/evidence/` so it can be copied into `Never-86d`.

| Layer | Decision |
|---|---|
| Native PDF | `pdftotext` when present, else PDF text operators (`Tj` / `TJ`). Digital email PDFs do **not** go to OCR. |
| OCR vendor | **Google Document AI Invoice Parser**. Textract AnalyzeExpense is the named fallback. |
| Photos | Sysco / Northern Lights / Sawyer stay `photo_ocr`. Last-week drop is 32 **HEIC** (`image/heif`) in Drive `8-16 thru 8-22`. Fixture OCR only in tests. |
| Z-reports | Detected and handed to `pdq-z-report-v2`. Not OCR-parsed here. |
| Week window | Book **2026-08-16–2026-08-22** only. See `docs/agent-memory/CTAP_Last_Week_Invoices_Sales.md`. |
| Truth engine | Field-level confidence + conflict flags. Review if confidence &lt; 0.75 or headers disagree. |

## Secrets

None in git. None in chat.

When Myke is ready to turn OCR on (not required to review this PR):

- `DOCUMENT_AI_PROJECT_ID`
- `DOCUMENT_AI_LOCATION` (default `us`)
- `DOCUMENT_AI_PROCESSOR_ID`
- `DOCUMENT_AI_ACCESS_TOKEN` (short-lived)

## Fixtures

`ACME Test Produce LLC` / `INV-1001` only. No real invoices, POS exports, or emails.
