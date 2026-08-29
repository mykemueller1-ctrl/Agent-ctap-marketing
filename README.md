# Agent-ctap-marketing — one tree

Working memory for **Community Tap & Pizza** and Never 86'd **1–3 unit** intake.

**Start here:** `docs/agent-memory/CTAP_One_Tree.md`  
**Daily loop:** `docs/MYKE_BRAIN.md`  
**Agent contract:** `AGENTS.md` (skills in `.cursor/skills/`) — work without asking; ping Myke only for founder judgment.  
**Community Lab (roles / Action Shift owners):** `docs/ctap-intake/COMMUNITY_LAB.md`

`sync/Never-86d/` is a cherry-pick source for the private workers app.

## Run

```bash
npm install
npm test
npm run portal   # owner seat at http://localhost:5173
npm run build    # static files in portal/dist (Render)
npm run nightly  # loop this computer can run without Gmail
npm run close    # morning Z parse → close card (logic, not clicks)
npm run demo     # PDQ Z-report fixture (7/16)
```

## Owner portal (five seats)

| Seat | Status |
|---|---|
| Shift | Paper week 8/30–9/5 live. Karlee/Ashley off. Kitchen + drivers = Feb templates, no times |
| Sales | Live week 8/23–8/29. No 8/29 Z in Drive. 7/15–7/16 + Sept 2025 history. Menu PROPOSED |
| Buy | Kenzy one-tap. Config B1 blank. Send volume, hold qty-1. No unit prices in git |
| Invoices | 32 HEICs with Drive links. Not OCR'd |
| Calendar | September DRAFT. Smash $11.99. Thursday pizza locked. Tom food missing. Humes unsent |

## Code map

| Workflow | Where |
|---|---|
| Owner portal | `portal/` |
| Community Lab (Kenzy / Tom / crew) | `docs/ctap-intake/COMMUNITY_LAB.md` · `sync/Never-86d/server/integrations/ctap/community-lab.ts` |
| PDQ Z-report (Large Pizza → Food) | `sync/Never-86d/server/integrations/pdq/` |
| Photo invoices + week book + vendor parsers | `sync/Never-86d/server/integrations/evidence/` |
| Humes / PFG parsers | `sync/Never-86d/server/integrations/vendors/` |
| Vendor cadence / mailbox | `sync/Never-86d/server/integrations/ctap/intake.ts` |
| Monthly specials calendar | `sync/Never-86d/server/calendar/` |
| House SOPs (FOH / bar / kitchen) | `sync/Never-86d/server/handbook/` |
| Alcohol rails | `docs/agent-memory/CTAP_Alcohol_Buying_Baseline.md` |
| Food / prime cost | `docs/agent-memory/CTAP_Food_Accounting_Baseline.md` |
| POS + silos vs ICP | `docs/agent-memory/CTAP_POS_Silo_Operator_Landscape.md` |
| Last-week photos / OCR / sales | `docs/agent-memory/CTAP_Last_Week_Invoices_Sales.md` |
| Honest gaps | `docs/agent-memory/CTAP_What_We_Dont_Have.md` |
| Monday Hy-Vee + Humes + Gronk | `docs/gtm/hunter-bots/monday-morning-runbook.md` |
