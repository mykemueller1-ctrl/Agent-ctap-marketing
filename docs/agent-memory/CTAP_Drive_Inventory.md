# CTAP Google Drive inventory (owner-seat seed)

**Owner mailbox:** `communitypizza2026@gmail.com`
**Pulled:** 2026-08-24
**Used for:** Never 86'd owner portal. Live seats = Shift, Sales, Invoices. SOPs stay in Drive.

## What we actually found (not a dump)

| Kind | Drive title | How the portal uses it |
|---|---|---|
| Bar weekly schedule | `CTAP BAR SCHEDULE X1 WEEK` | Stale Drive sheet (still has Karlee/Ashley). Live Shift seat is the **posted paper week** in `portal/public/data/ctap-bar-schedule.csv` |
| Bar schedule (older) | `CTAP BAR SCHEDULE` | Same wide CSV shape; parser covers it |
| How operators post a week | `HOW TO INPUT WEEKLY SCHEDULES` | Tokens: Open / OPEN (first cut) / Close / RO; departments Bar Crew vs Kitchen; Quick Assign |
| Kitchen / drivers | `CTAP KITCHEN SCHEDULE`, `CTAP DRIVER SCHEDULE` | Same template, not filled for this week — seats stay Bar-first |
| Last-week invoice photos | folder `8-16 thru 8-22` (`1DxZBAfexSBRn1hJLRmAHl28vP_Jr2AyP`) | **Invoices** seat — 32 HEIC last week only. Live book is **8/23–8/29**. |
| Weekly invoice SOP | `Invoice Sheet for the week` | Mon Sawyer · Tue NL + Performance · Wed Sawyer · Thu Food · Fri NL + Performance + Sawyers |
| Last complete sales week | folder `Ctap Weekly sales 9-14-25 to 9-20-25` | **Sales** seat — pattern for a 7-day Z drop |
| Most recent Z nights | `7-15-2026` / `7-16-2026 ZReport_Summary Community Pizza.pdf` | **Sales** seat — last parsed Zs. Live week needs the **8/29** Z. |
| Liquor / beer order | `CTAP BAR ORDERING DOCS` / `CTAP LIQUOR _ BEER ORDERING SHEET BLANK` | Next seat (**Buy**) — par vs quantity to order, over/under budget |
| Menu | `CTAP_Updated_Menu.docx` | Pricing context for sales/food cost later |

Longer invoice / OCR / sales memory: `docs/agent-memory/CTAP_Last_Week_Invoices_Sales.md`.
Honest gap list (liquor guide, food order, kitchen/driver, Zs, Gmail): `docs/agent-memory/CTAP_What_We_Dont_Have.md`.

## Shift logic we inherited from Drive (not 7shifts)

Live week is the posted paper grid, not the Drive Google Sheet. Karlee and Ashley are gone. Paper tokens:

- **Open** — starts at open
- **OPEN** — first person cut when it slows ("O" on paper)
- **Close** — works until close
- **RO** — requested off
- **Station** — BAR SIDE, BAR SERVER, WAITRESS, PIZZA SIDE (department-specific)

The owner portal skips the download-CSV round trip for the first action: it loads the posted week, shows coverage holes, and lets Myke Quick Assign / copy Sunday onto a thin Monday.
