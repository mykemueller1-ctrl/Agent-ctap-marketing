# CTAP / Never 86'd Agent Brief — Restaurant & Food Accounting Baseline

**Author:** Cursor Agent (research pass, grounded in 2026 industry sources)
**Date:** 2026-08-24
**Status:** Operating baseline for future CTAP agents. Pairs with `CTAP_Alcohol_Buying_Baseline.md`.
**Concept:** Community Tap & Pizza (CTAP) — independent single-unit **pizza + bar**, Fort Dodge IA, POS = PDQ.

## Purpose

This note is the "food accounting 101 → operator level" reference future agents should use when helping Myke read a P&L, a nightly PDQ Z-report, or a vendor invoice, and when turning that data into next-action coaching. It defines the vocabulary, the formulas, the target ranges for a pizza/bar concept, and how each number maps to fields the code in this repo already extracts. Myke will layer his own store-specific teaching on top of this — treat this as the shared baseline, not the final word.

> **Standing rule:** Never coach from a single number in isolation. A cost % only means something against the sales it was spent to produce, tracked over a consistent period, and compared to the same period last year. Ground every recommendation in POS movement + on-hand inventory + invoices, exactly like the alcohol-buying baseline.

## 1. The one number that decides profitability: Prime Cost

**Prime Cost = COGS (food + beverage + paper) + Total Labor (hourly, salaried, payroll tax, benefits, workers' comp).**

It is the largest controllable expense and the single best predictor of whether the restaurant makes money. Independent net margins are thin (~3–9%), so a 2-point prime-cost drift can erase a year's profit. **Track it weekly, not just at period close.** Investigate immediately if it drifts >1.5 points above the rolling average.

| Concept | Target Prime Cost | Food Cost % | Labor Cost % |
|---|---:|---:|---:|
| Pizzeria (industry) | 52–60% | 22–28% | 28–34% |
| Bar / beverage-led (industry) | 48–58% | 18–24% (pour) | 22–35% |
| **CTAP owner targets (this repo)** | **~≤58% blended** | **Food <30%** · **Beer <21%** · **Liquor <20%** | **Labor <28%** |

Health bands (share of revenue): **Excellent ≤58% · Good 58–62% · Average 62–65% · Struggling >65% · Crisis >70%.** CTAP being a pizza+bar hybrid should out-perform full-service casual because pizza food cost and spirits pour cost are both favorable — the owner targets above are appropriately tighter than generic full-service.

## 2. Cost of Goods Sold (COGS) and cost percentages

**Cost % = Category COGS ÷ Category Sales.** Compute per category, never one blended food+bev number.

**Actual COGS (from inventory) = Beginning Inventory + Purchases − Ending Inventory** for the period.

Beverage / pour-cost targets by category (blend to CTAP's <21% beer / <20% liquor owner rule):

| Category | Industry pour-cost target | Note |
|---|---:|---|
| Spirits / cocktails | 15–22% | Highest margin; protect with standard pours |
| Draft beer | 20–26% | Keg foam/line waste is the leak |
| Bottled / canned beer | 20–28% | Easier to count than draft |
| Wine | 28–38% | Spoilage on open bottles = 100% waste |
| Non-alcoholic / pop | 8–20% | Very high margin |
| Food (pizzeria) | 22–28% | Dough/cheese/protein are the movers |

## 3. Actual vs. Theoretical (the profit-leak finder)

- **Theoretical cost** = recipe/plate cost × units sold (from POS mix). What it *should* have cost with perfect portions and zero waste.
- **Actual cost** = inventory math above. What it *really* cost, including waste, over-portioning, comps, spoilage, theft, and bad invoicing.
- **Variance = Actual % − Theoretical %.** Target variance **1–3 points**. A large or growing variance is money leaking.

To close variance: find the highest-variance items first, then tighten portioning, verify invoices, log waste, and count more often. Use **EP (edible portion)** cost, not just **AP (as-purchased)** invoice price, or theoretical is structurally understated and "variance" is partly just math.

**Receiving discipline (biggest independent leak):** audit invoices *at the door* — weigh catch-weight items (meats, cheese) and verify piece counts against the invoice before the driver leaves; note discrepancies on a credit memo on the spot. Invoices tossed in a folder for an offsite bookkeeper = short-ships never get disputed. This is exactly why CTAP routes all vendor invoices into one ops mailbox and parses them (Humes, PFS, etc.).

## 4. Restaurant P&L structure (top to bottom)

| Section | Captures | Key metric / target |
|---|---|---|
| Net Sales | Food, pop, liquor, beer, delivery by category | Revenue baseline |
| COGS | Food + beverage + paper/packaging | Food cost % (22–28% pizza) |
| Gross Profit | Net Sales − COGS | Gross margin |
| Labor | Hourly, salaried, taxes, benefits | Labor % (<28% CTAP) |
| **Prime Cost** | **COGS + Labor** | **≤58–62%** |
| Controllable expenses | Supplies, repairs, marketing, card fees | Controllable profit |
| Occupancy | Rent, CAM, property tax, insurance | 6–10% of sales |
| Operating Profit | Revenue − all above | EBITDA precursor |
| Below-the-line | Depreciation, interest, G&A | Net profit (3–9% typical) |

## 5. Accounting calendar: use 4-week periods, not calendar months

Most serious operators run a **13-period (13 × 4-week)** or **4-4-5** calendar instead of 12 months. Every period has the same count of each weekday, so period-over-period and same-store-sales comparisons aren't distorted by month length / weekend count. Bonus: with bi-weekly payroll, 4-week periods make two pay cycles land cleanly, reducing payroll accruals. Monthly fixed costs (rent, insurance) get prorated/accrued (~11/12 each period, trued up in period 13). A lightweight **weekly flash report** (sales, prime cost) fills the gap between period closes.

## 6. Chart of accounts — USAR (Uniform System of Accounts for Restaurants)

Standard 4-digit coding so POS, bookkeeper, and CPA speak the same language: **1000 Assets · 2000 Liabilities · 3000 Equity · 4000 Revenue · 5000–9000 Expenses.** Inventory sub-accounts already split the way CTAP thinks: `1310 Food · 1330 Soft Beverages · 1340 Liquor · 1345 Beer · 1350 Wine · 1360 Paper`. Taxes collected are liabilities (`2310 Sales Tax`, `2320 Liquor Tax`) — held, not revenue.

## 7. How this maps to the code in this repo

The nightly **PDQ Z-report parser** (`sync/Never-86d/server/integrations/pdq/parser.ts`) already extracts the raw inputs for the metrics above. Field → accounting use:

| Parsed field | Accounting use |
|---|---|
| `grandTotal`, `subtotal`, `tax` | Net sales baseline; tax is a liability, not revenue |
| `categorySales.food` (Large Pizzas rolled in) | Food sales denominator for food cost % |
| `categorySales.pop / liquor / beer` | Per-category beverage sales for pour cost % |
| `orderCounts.{pickup,delivery,bar,table,total}` (qty + avg check) | Daypart/channel mix, covers, average check |
| `labor.{headcount,total,pct}` | Labor % (the labor half of prime cost) |
| `discounts`, `voids`, `cash.payOuts` | Leak/comp tracking, deposit reconciliation |

**The gap the parser does NOT close:** the Z-report gives *sales* (the denominator). Cost % and prime cost also need *COGS* (the numerator) which comes from the **vendor invoices** (`vendors/humes.ts`, `vendors/pfs.ts`, and the `evidence/` OCR intake). The product win for CTAP / Never 86'd is joining nightly PDQ sales + parsed vendor invoices + on-hand inventory into weekly per-category cost % and prime cost, then surfacing next-action coaching (e.g. "beer pour cost ran 26% vs your 21% target this week — check draft waste / recent Humes price bumps"). That is the differentiator vs. MarginEdge (invoice archive) noted in `ctap/intake.ts`.

## 8. Agent use rules

| Rule | Required agent behavior |
|---|---|
| Prime cost first | Lead with prime cost weekly; food and labor are its two halves. |
| Category-level, never blended | Split food / pop / liquor / beer against their own sales. |
| Actual vs. theoretical | Frame overages as variance (leak), not just "cost is high." |
| Numerator needs invoices | Cost % requires vendor invoice COGS, not just the PDQ sales side. |
| Verify at the door | Push door-side invoice/catch-weight audits before disputes are impossible. |
| Consistent period | Compare 4-week periods / same period last year, not ragged months. |
| Plain owner language | Say whether a number is healthy, tight, or bleeding, and the one next action. |

## Sources (2026)

- Prime cost / food / labor benchmarks: levelcfo.com, stockcount.io, VantaInsights; NRA Operations Data.
- Pour cost by category: barguard.app, altametrics, purimax, getbackbar.
- Actual vs. theoretical & receiving: bookkeepingchef.com, getmeez.com, restaurant365.com, crunchtime.com.
- P&L / 13-period / USAR chart of accounts: gsslp.com, restaurantowner.com, getmyfixe.com, legalclarity.org.
