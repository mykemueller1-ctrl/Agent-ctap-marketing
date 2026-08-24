# Agent-ctap-marketing — one tree

Working memory for **Community Tap & Pizza** and Never 86'd **1–3 unit** intake.

**Start here:** `docs/agent-memory/CTAP_One_Tree.md`  
**Daily loop:** `docs/MYKE_BRAIN.md`

`sync/Never-86d/` is a cherry-pick source for the private workers app.

## Run

```bash
npm install
npm test
npm run portal   # owner seat at http://localhost:5173
npm run demo     # PDQ Z-report fixture (7/16)
```

## Owner portal (four seats)

| Seat | Status |
|---|---|
| Shift | Live — bar week 8/30–9/5 |
| Sales | Live — 7/15–7/16 Zs + Sept 2025 week. Aug 16–22 Z hole |
| Buy | Live — liquor/beer qty from Drive. No unit prices in git |
| Invoices | Live — 32 HEIC photos, not OCR'd |

## Code map

| Workflow | Where |
|---|---|
| Owner portal | `portal/` |
| PDQ Z-report (Large Pizza → Food) | `sync/Never-86d/server/integrations/pdq/` |
| Photo invoices + week book + vendor parsers | `sync/Never-86d/server/integrations/evidence/` |
| Humes / PFG parsers | `sync/Never-86d/server/integrations/vendors/` |
| Vendor cadence / mailbox | `sync/Never-86d/server/integrations/ctap/intake.ts` |
| Monthly specials calendar | `sync/Never-86d/server/calendar/` |
| Alcohol rails | `docs/agent-memory/CTAP_Alcohol_Buying_Baseline.md` |
| Food / prime cost | `docs/agent-memory/CTAP_Food_Accounting_Baseline.md` |
| POS + silos vs ICP | `docs/agent-memory/CTAP_POS_Silo_Operator_Landscape.md` |
| Last-week photos / OCR / sales | `docs/agent-memory/CTAP_Last_Week_Invoices_Sales.md` |
| Honest gaps | `docs/agent-memory/CTAP_What_We_Dont_Have.md` |
| Monday Hy-Vee + Humes + Gronk | `docs/gtm/hunter-bots/monday-morning-runbook.md` |
