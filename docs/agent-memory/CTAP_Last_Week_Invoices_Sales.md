# Last week — photos, OCR chat, invoices, sales, Drive SOPs

**Locked in:** 2026-08-24  
**Owner mailbox:** `communitypizza2026@gmail.com`  
**Week this book is about:** Sunday **2026-08-16** through Saturday **2026-08-22**.

This is the memory Myke pointed at: the invoice photos from the course / OCR chats, the invoice + sales chats from last week, and the SOPs that live in Drive (not in git).

## Photos (the drop)

Drive folder **`8-16 thru 8-22`** (`1DxZBAfexSBRn1hJLRmAHl28vP_Jr2AyP`).

- **32 HEIC photos**, `IMG_6700.HEIC` through `IMG_6731.HEIC`
- Uploaded **2026-08-21 ~11:43Z** from the ops mailbox
- Mime is `image/heif` — Drive cannot OCR these in place; intake route is **`photo_ocr`** (Google Document AI Invoice Parser). Convert or send HEIC/JPEG to Document AI. Do **not** treat them as native PDFs.
- Photos themselves stay in Drive. No real invoice numbers, accounts, or store addresses in git.

## OCR chat (what already shipped)

| Chat / PR | What it decided |
|---|---|
| PR **#4** (merged) | Evidence intake: digital PDFs → native text; photos → Document AI; Z-reports → `pdq-z-report-v2`, not OCR |
| PR **#5** (open, `cursor/vendor-invoice-parsers-0561`) | Vendor parsers from these photo layouts. Book **only** 8/16–8/22. |
| PR **#3** (draft) | PDQ v2 parser (Large Pizza → Food) + Humes → ops mailbox |
| PR **#8** (draft) | Consolidate PDQ + vendor routing + evidence on one tree |

**Vendors the OCR course learned from the photos** (ACME fixtures in git, real tickets in Drive):

Sysco, Performance Food (PFG / PFS), Northern Lights, Sawyer, Humes, Fort Dodge Distributing, Confluence kegs, Hy-Vee grocery, Hy-Vee wine, PDQ payouts / labor slips.

**Out of this week's book** (parsed, not booked):

- Hy-Vee grocery + PDQ payout dated **8/11**
- Hy-Vee wine page dated **8/12/2023**
- Sawyer ticket dated **8/17/2024**
- After-midnight register timestamps on **Sat 8/22** still count in-week
- Friday beer tickets that print `Friday, Aug 21, 2026` book on 8/21, not the license expiry date
- Handwritten totals beat printed; strike-throughs drop; continued pages wait for last page (`PAY THIS AMOUNT`)

Document AI is **not live** in this repo. Secrets stay out of git (`DOCUMENT_AI_*`).

## Sales chats (what Drive actually has)

Z-report = **sales denominator**. Invoice photos = **COGS numerator**. You cannot close food / beer / liquor cost % until both exist for the same week.

| What | Where | Status for 8/16–8/22 |
|---|---|---|
| Invoice photos | `8-16 thru 8-22` | **In Drive** (32 HEIC) |
| Z-reports for that week | — | **Missing.** No `8-16` / `8-17` / Aug 2026 Z in Drive |
| Most recent Z days | `7-15-2026` and `7-16-2026 ZReport_Summary Community Pizza.pdf` | Same year, two nights only |
| How a full sales week is filed | folder `Ctap Weekly sales 9-14-25 to 9-20-25` (seven Historical Prev Day Z PDFs) | Pattern to copy when Myke drops Aug Zs |

Operating targets (from alcohol / food accounting memory): Food COGS **<30%** · Beer **<21%** · Liquor **<20%** · Labor **<28%** of sales. Labor % can be computed from a Z alone. Cost % cannot.

## SOPs live in Drive (do not rewrite them in git)

| SOP | Drive title | What the portal should obey |
|---|---|---|
| Weekly invoice sheet | `Invoice Sheet for the week` (`1BCJFMwzVchxnRNhzCiSB554ZYG1gCcdK-y7r3g_h0sM`) | Mon Sawyer · Tue Northern Lights + Performance · Wed Sawyer · Thu Food · Fri Northern Lights + Performance + Sawyers · total + date |
| How to post a schedule | `HOW TO INPUT WEEKLY SCHEDULES` | Open / OPEN (first cut) / Close / RO — already wired on Shift |
| Bar buy | folder `CTAP BAR ORDERING DOCS` + `CTAP LIQUOR _ BEER ORDERING SHEET BLANK` | Next seat **Buy** — par vs quantity, not this drop |
| Nightly sales file names | `Historical_Prev_Day_Z_Report Community Pizza.PDF` or `ZReport_Summary Community Pizza.pdf` | Sales seat ingest pattern |

The invoice sheet Doc is still blank lines. The 32 photos are the fill. Until OCR is on, the owner seat shows the cadence and the photo drop, not invented totals.

## Next action this memory implies

1. **Invoices seat** — treat `8-16 thru 8-22` as the live photo week; route HEIC → `photo_ocr`; keep 8/11, 2023, and 2024 tickets out of the book.
2. **Sales seat** — show the 8/16–8/22 **hole** (photos without Zs). Use 7/15–7/16/2026 as the last real Z nights and 9/14–9/20/2025 as the last complete weekly folder.
3. When Aug Z-reports land in Drive (same shape as the Sept 2025 weekly folder), close the week: invoices OCR'd + Z sales = prime cost.
