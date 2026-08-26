# Agent-ctap-marketing — Myke's ops brain

This repo is the working memory for **Community Tap & Pizza** and Never 86'd **1–3 unit** intake. `sync/Never-86d/` is a cherry-pick source for the private workers app.

## Run

```bash
npm install
npm test
npm run demo    # PDQ Z-report fixture
```

## Start here

**Daily/weekly workflows:** `docs/MYKE_BRAIN.md`

| Workflow | Where |
|---|---|
| Monday morning (Hy-Vee + Humes + Gronk) | `docs/gtm/hunter-bots/monday-morning-runbook.md` |
| 1–3 unit ICP | `docs/gtm/hunter-bots/icp-1-to-3-unit.md` |
| PDQ Z-report (Large Pizza → Food) | `sync/Never-86d/server/integrations/pdq/` |
| **Community Lab (roles / Action Shift owners)** | `docs/ctap-intake/COMMUNITY_LAB.md` · `sync/Never-86d/server/integrations/ctap/community-lab.ts` |
| Photo invoices + week book | `sync/Never-86d/server/integrations/evidence/` |
| Vendor cadence / mailbox | `sync/Never-86d/server/integrations/ctap/intake.ts` |
| Alcohol rails | `docs/agent-memory/CTAP_Alcohol_Buying_Baseline.md` |
| Food / prime cost | `docs/agent-memory/CTAP_Food_Accounting_Baseline.md` |
| POS + silos vs ICP | `docs/agent-memory/CTAP_POS_Silo_Operator_Landscape.md` |
