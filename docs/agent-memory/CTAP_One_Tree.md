# One tree — stop chasing eight chats

**Branch:** `cursor/grab-all-one-tree-c931`  
**Mailbox:** `communitypizza2026@gmail.com`  
**Portal:** `npm run portal` → http://localhost:5173

This is the working copy. The other draft PRs are leftovers from split chats. Do not keep stacking on them.

## Where each chat landed

| Chat / PR | What it was | Now |
|---|---|---|
| Env setup (#7) | Standalone Node/Vitest | Already in this lineage (merged) |
| PDQ + Humes intake (#3 / #8) | Z-report parser, mailbox routing | `sync/Never-86d/server/integrations/pdq/` + `ctap/` |
| OCR evidence (#4, merged) | Native PDF + Document AI ports | `sync/Never-86d/server/integrations/evidence/` |
| Vendor parsers (#5) | Layout parsers + 8/16–8/22 week book | `evidence/vendor-parsers.ts`, `week-window.ts` |
| Hunter bots (#6 / #11) | 1–3 unit GTM | `docs/gtm/hunter-bots/` |
| Food accounting (#9) | Prime cost rails | `docs/agent-memory/CTAP_Food_Accounting_Baseline.md` |
| POS + silo landscape (#10) | Operator pain vs vendors | `docs/agent-memory/CTAP_POS_Silo_Operator_Landscape.md` |
| Ops brain (#11) | Closest previous “everything” without a portal | PDQ + vendors + mailbox emails + MYKE_BRAIN |
| Owner portal + Shift (#12) | First live seat | `portal/` Shift |
| Invoices + Sales memory (#13) | Last-week photos, Z hole | `portal/` Invoices + Sales |
| Monthly calendar (#14) | Kenzy bar / Tom kitchen / Myke → Humes | `sync/Never-86d/server/calendar/` (engine, not a portal seat yet) |

## Live owner seats

1. **Shift** — bar week Sun 8/30–Sat 9/5 from Drive.
2. **Sales** — 7/15–7/16/2026 Zs + Sept 2025 weekly folder. No Aug 16–22 Zs in Drive.
3. **Buy** — liquor/beer qty-to-order from the 8/23 Drive sheet. Names, par, qty. **No unit prices in git.** Combined ~$3,173 — treat as par-fill risk, not the $1,400 replacement buy.
4. **Invoices** — 32 HEICs in `8-16 thru 8-22`. SOP cadence. Not OCR'd.

## Daily loop

`docs/MYKE_BRAIN.md`

## Still not in this tree (honest)

- Live Gmail PDQ / PFG / Humes PDFs (Gmail MCP `needsAuth`)
- Food SKU order guide (the 32 photos *are* the list until OCR)
- Posted kitchen + driver weeks
- Calendar as a portal seat
- Menu prices in Sales
- Document AI secrets

See `docs/agent-memory/CTAP_What_We_Dont_Have.md`.
