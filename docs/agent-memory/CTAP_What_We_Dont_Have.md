# What this agent does not have (honest gap list)

**Pulled:** 2026-08-24 against `communitypizza2026@gmail.com` Drive.
**Ask:** liquor guide, food-type order list, schedules — name everything missing.

Two different holes: **in Drive but not in the portal**, vs **not in Drive at all**.

## In Drive, not wired into the portal yet

| What | Drive title | Status |
|---|---|---|
| Liquor / beer **guide + this week's order** | `CTAP LIQUOR _ BEER ORDERING SHEET BLANK` (modified 2026-08-23) | Filled. **Buy seat is live** — names, par, qty, category totals. Unit prices stay in Drive. Combined ~**$3,173** (par-fill risk vs ~$1,400 replacement buy). |
| Liquor par (older xlsx) | `CTAP LIQUOR PAR SHEET` copies in `CTAP BAR ORDERING DOCS` | Exists. Not the live weekly sheet. |
| Menu + price move | `CTAP_Updated_Menu.docx` | **Wired into Sales.** Status **PROPOSED**, not in POS. Effective date blank. Tuesday Smash $11.99 stays the special; menu plate is $14.99 proposed. |
| Weekly numbers SOP | `Community_Tap_Weekly_Numbers_Tracking_Guide.docx` | How to log daily food/beer/liquor sales vs purchases. No sheet actually filled this way. |
| Kitchen roster template | `CTAP KITCHEN SCHEDULE` | Names only. Week **2/22–2/28/2026**. Every start/end/station blank. |
| Driver roster template | `CTAP DRIVER SCHEDULE` | Same — names, Feb 2026, no times. |
| Invoice photos | folder `8-16 thru 8-22` | 32 HEICs catalogued **with Drive file IDs**. Portal chips open Drive. **Not OCR'd** (Document AI secrets not in this repo). |
| Vendor intake template | `Fort Dodge_Vendor_Intake` (shared by Tammy) | Headers only. No vendors filled. |

## Not in this Drive at all (or blank)

**Food-type order list**
- No Sysco / Northern Lights / Performance / Sawyer **standing order guide** (SKU + par + qty).
- Thursday "Food" on `Invoice Sheet for the week` is a **dollar blank**, not a product list.
- No cheese / meat / dough par, no morning pizza prep list, no recipes / plate cost in this mailbox.
- This week's food order **is the 32 photos**. Until OCR runs, there is no typed food order.

**Schedules**
- **Kitchen** — no posted week for 8/16–8/22 or 8/30–9/5. Template is six months stale and empty.
- **Drivers** — same.
- **Bar** is the only live posted week (`CTAP BAR SCHEDULE X1 WEEK`, Sun 8/30–Sat 9/5).
- No waitstaff checklist, kitchen protocol, or "Ashley Nightly Beer & Liquor Order Guide" under this mailbox (those lived on Chase / older pulls, not here).

**Sales / cost close**
- No Z-reports for **8/16–8/22** (invoice week).
- No Z after **7/16/2026**. Last full weekly folder is **9/14–9/20/2025**.
- No Hourly Sales, Void/Promo, or Menu Mix PDFs in this Drive right now.
- No on-hand bottle/keg **count** (the liquor sheet is par + qty to order, not a walk).
- No waste / comps / paper-chemicals log (the weekly numbers guide describes it; nobody is filling it).

**Mailbox / books (blocked)**
- **Gmail MCP is not connected** (`needsAuth`). That is where daily PDQ reports and PFG/Vestis invoices actually live.
- No QuickBooks / P&L / payroll exports.
- `CTAP ACCOUNTS` exists; not opened here (credentials).

## What *is* live in the owner portal

- **Shift** — bar week 8/30–9/5.
- **Sales** — 7/15–7/16/2026 Zs + the Sept 2025 weekly pattern + the 8/16–8/22 Z hole + proposed menu (not in POS).
- **Buy** — liquor/beer qty-to-order from the 8/23 Drive sheet. Kenzy one-tap. Config B1 still blank. No unit prices in git.
- **Invoices** — 32-photo week with Drive links. Totals not booked.
- **Calendar** — September DRAFT seat. Smash $11.99 · Thursday pizza locked. Tom food blank. Humes unsent.

## Highest-leverage drops from Myke

1. Food order guide (Sysco / NL / Performance / Sawyer par + SKU) — or say "the photos *are* the list, turn OCR on."
2. Posted **kitchen** and **driver** weeks (same CSV shape as bar).
3. This week's **Z-reports** (Aug 16–22).
4. Connect **Gmail** so PDQ dailies and digital vendor PDFs stop being a hole.
