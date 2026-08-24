# CTAP / Never 86'd Agent Brief — POS + Silo Vendor Landscape & Operator Problems

**Author:** Cursor Agent (research pass, grounded in 2026 industry sources)
**Date:** 2026-08-24
**Status:** Strategy/operating baseline for future CTAP agents. Pairs with `CTAP_Food_Accounting_Baseline.md` and the intake-stack targets in `sync/Never-86d/server/integrations/ctap/intake.ts`.

## Purpose

Myke's ask: understand the ~10 POS systems and back-office "silo" vendors — what each one does and its internal logic — then, at scale, the problems with all of them, and the human/logic problems operators are voicing from 1–3 unit independents, to 1–10 unit emerging groups, all the way up to C-level multi-unit executives. This note is that map. It exists so Never 86'd builds toward the *gap between these systems* (next-action human insight) rather than rebuilding another silo.

> **Standing frame:** Every vendor below solves one slice and walls off its data. The operator is left holding 5–18 disconnected systems plus the spreadsheets that exist only to bridge them. The pain is not "no software" — it's fragmentation, latency, lock-in, and nobody turning the data into the next action. That gap is the wedge.

## 1. The POS layer — the "system of record" (what was sold)

The POS captures every transaction: sales by item/category, dayparts, order channel, labor punches, discounts, payments. It is the source of the nightly numbers the CTAP PDQ parser already reads. Roles + logic + problems:

| POS | Who it's for / logic | Core problems (2026) |
|---|---|---|
| **PDQ** (CTAP's POS) | Pizza/delivery-focused POS; nightly Z-report PDF is the daily close artifact | Regional; data leaves as PDF/email, not clean API → why CTAP parses the PDF at all |
| **Toast** | Full-service & multi-unit standard; deep KDS, tables, online order, payroll add-ons | Proprietary hardware; **must** use Toast Payments (no rate shopping); 2–3 yr contracts + ETFs (operators stuck owing $4,800+); Sept-2024 processing-rate hike hit non-legacy contracts — processor+software being one company = unilateral rate power |
| **Square** | New/low-volume, cafes, food trucks, QSR; low friction, no contract, published pricing, free tier | Flat blended rate (~2.6%+10¢) compounds and captures spread on premium cards; shallower restaurant-native workflow at complex full-service |
| **Clover** | General-business platform sold through **banks/ISO resellers**; hardware variety; can pair independent processor (rate leverage) | Reseller model = wildly variable price/terms/support; predatory 36-mo hardware leases; unexplained statement fees ("RPP"); struggles under high transaction load |
| **NCR Aloha** | Legacy full-service workhorse, still dense in multi-decade independents | Custom multi-line quotes; 36-mo standard; $2,500–$10,000+ implementation; bundled ~2.7–3.0% processing; buyout fees to leave |
| **Revel** | iPad-forward, complex/larger operations | 36-mo contracts; high implementation cost; history of integration failures |
| **SkyTab / Shift4** | Growing "displace-Toast" installs; bundled hardware/processing | Rates vary by reseller; Shift4 processing lock-in dynamics |
| **Oracle MICROS** | Enterprise / hotel F&B adjacency, legacy chains | Heavy, expensive, enterprise-IT-grade; slow to change; not for small independents |

**Cross-cutting POS problems:** payment-processing lock-in (processor = software vendor), multi-year contracts + early-termination fees, proprietary hardware, and **data-exit cost** — menus/customers export as CSV but loyalty balances, gift-card liabilities, and integration mappings rarely migrate cleanly (budget ~2 weeks of manager time to switch).

## 2. The back-office / "silo" layer — what it cost, who worked, what you made

These sit on top of (or beside) the POS. Each owns one domain and pulls POS data in:

| Vendor | Domain / logic | Problems |
|---|---|---|
| **MarginEdge** | Invoice OCR → daily P&L + food cost; integrates with existing POS + accounting (QuickBooks etc.); flat fee; tech + **human review** of invoices in 24–48h; costs by product, auto-categorizes spend | It's a **visibility layer, not accounting**; still one more login; the invoice archive is the commodity — weak on *what to do next* |
| **Restaurant365 (R365)** | All-in-one: accounting (GL/AP) + inventory + scheduling + payroll; consolidated multi-unit P&L; "R365 AI" trained on the full P&L | Heavy implementation & learning curve; effectively a rip-and-replace of accounting; overkill/expensive for 1–3 units; you must categorize purchases correctly |
| **7shifts** | Labor: scheduling, shift swaps, labor compliance, team comms | No accounting or inventory → forces more integrations; a point tool that becomes another silo |
| **HotSchedules** (Fourth) | Enterprise labor forecasting/scheduling & compliance | Enterprise-oriented, dated UX, costly for small ops |
| **Sling** | Lightweight scheduling for true 1-unit shops | Minimal depth; scheduling only |

**Cross-cutting silo problem:** each solves a slice and needs the others' data it can't cleanly get. Even the "all-in-one" (R365) wins by *absorbing* silos, not by connecting an operator's existing best-of-breed tools — so the operator trades fragmentation for lock-in.

## 3. The systemic problem at scale — the "Franken-stack"

- **Vendor sprawl:** the average chain runs **5–10** systems; 30–150-unit operators run **10–18** (POS, KDS, online ordering, delivery integration, loyalty, scheduling, inventory, food-cost accounting, analytics) — each bought at a different time, on different architecture.
- **Walled gardens:** vendors wall off data out of commercial self-interest (open data = replaceable). Operators "own" their data in theory; in practice accessing it means paying for API access, waiting months for custom integrations, or never getting it to flow.
- **Spreadsheet debt:** the sheets that exist only to bridge two systems are technical debt — someone maintains them, they add error + latency, and the 2022 crisis workaround is still holding up the weekly report in 2026 after its author left.
- **Reporting latency = blind spots:** by the time a problem shows in the report, it's already in the P&L. Field leaders act on days-old data.
- **AI can't save a fragmented base:** 37% of brands (Qu survey) say fragmented systems/disconnected data are the #1 reason AI underdelivers — garbage in, garbage out.
- **Direction of travel:** toward a **unified data layer / single source of truth** and integration-first (open API) stacks; consolidate the two highest-manual-work areas first (usually POS + inventory).

## 4. The human problems, by operator tier

### Tier A — 1–3 units (independents; CTAP is here)
- **Owner is all-consuming / burnout:** relentless stress, no work-life balance; viral "wouldn't wish it on my worst enemy" operator threads.
- **Profitable but cash-constrained:** 51% of owners skipped their own paycheck in the last 12 months to make payroll; ~24% borrowed just to cover payroll/opex; worst under $550K revenue.
- **Labor:** turnover >70%/yr; recruiting + retention are the top-cited challenge; 98% of operators cite labor as a top concern.
- **Wearing every hat:** they invent responses in real time (staffing, hiring, menu, repairs, complaints) with no playbook and no analyst — so data work never happens.
- **Tool fatigue:** juggling POS + online ordering + delivery tablets + scheduling + accounting that don't integrate; 27% still use paper for scheduling; delivery apps take 15–30% commission.

### Tier B — 1–10 units (emerging multi-unit)
- **Consistency across units:** different stores use different tools (one on a spreadsheet, one on an app), so there's no way to standardize reporting or compare store performance.
- **GM overload / back office drowning:** manual reconciliation between systems consumes finance-team time; questions like real food cost or labor by unit have no fast answer.
- **Cash-flow timing traps:** funding a second location out of the first's working capital (profitable *and* broke); fixed-cost timing collisions; silent working-capital erosion — all visible weeks ahead on a **13-week cash forecast**, invisible on a P&L.
- **This is the distress tier:** the 2026 Chapter 11 story is multi-unit/franchisee (shared debt facilities, rent portfolios, royalties), **not** mom-and-pop.

### Tier C — C-level / enterprise multi-unit
- **Flying blind at scale:** POS data alone misses info that lives in the labor system, delivery platform, review aggregator, loyalty DB — none connect back to the transaction.
- **Standardization & governance:** need consolidated P&L, departmental/region reporting, comparable periods (13-period calendar), and one "source of truth" to run playbooks across dozens of units.
- **TCO & procurement:** contracts, ETFs, integration fees, and "have we outgrown the stack" decisions; PE/institutional capital rewards scalable systems with predictable reporting (channels cheaper capital to disciplined groups).
- **Productivity gap:** top vs median operators differ ~40–50% on **sales per labor hour** — the real profitability driver at today's input costs, achieved via demand-matched scheduling and prep design, not headcount cuts.

## 5. What this means for Never 86'd / CTAP (the wedge)

- Do **not** build another silo or invoice archive. The commodity is data capture; the scarce thing is **the next action**.
- Be **integration-first / walled-garden-friendly:** meet the data where it leaks (PDF Z-reports, invoice emails, photos) — exactly what the PDQ parser + vendor parsers + `evidence/` OCR already do — and normalize it into one picture.
- Sell **Human Insight** to the crybaby 1–3 unit operator who has no analyst and no time: join nightly sales + parsed invoices + labor into weekly prime cost / per-category cost % and say the one thing to do next (see `CTAP_Food_Accounting_Baseline.md`). This is the stated differentiator vs. MarginEdge in `ctap/intake.ts`.
- The 1–10 unit tier is where distress + willingness-to-pay concentrate; a cross-unit "single source of truth + next action" is the natural expansion path toward the C-level story.

## 6. Agent use rules

| Rule | Required agent behavior |
|---|---|
| Map to the stack | Tie any recommendation to where CTAP's data actually lives (PDQ PDF, vendor email/photo) and where the silos fail to connect it. |
| Fragmentation is the enemy | Frame value as *connecting + next-action*, never "add another tool." |
| Respect the operator's time | For 1–3 units, assume no analyst, no spare hours; deliver the answer + one action, not a dashboard to go read. |
| Watch cash, not just P&L | Surface 13-week cash-forecast risks (payroll skips, timing collisions, working-capital creep), especially for multi-unit. |
| Know the contract traps | When POS/vendor comes up, flag processing lock-in, multi-year ETFs, and data-exit cost before any switch. |
| Segment the pain | Match language and metrics to tier (owner burnout/cash for 1–3; consistency/debt for 1–10; standardization/SPLH for C-level). |

## Sources (2026)

- POS roles/problems/pricing: restaurantlaunchpad.io, dineopen.com, katalystos.com, foodyos.com, restaurantvelocity.com; r/restaurantowners threads referenced therein.
- Back-office silos: restaurantinventorytools.com, marginedge.com, restaurant365.com.
- Fragmentation at scale: qsr.pro (Qu survey, 37%), opsage.com, restauranttech.co, unite.ai, restaurant365.com.
- Operator pain by tier: clarifycapital.com (391-owner 2026 report), tmenu.ai, kitchendivas.com, restaurantbottomline.com, tableview.com.
