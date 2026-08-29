# One tree — stop chasing eight chats

**Branch:** `main` (one-tree cockpit + Community Lab)  
**Mailbox:** `communitypizza2026@gmail.com`  
**Portal:** `npm run portal` → http://localhost:5173  
**Nightly (no Gmail):** `npm run nightly`

This is the working copy. Split-chat draft PRs are leftovers. Form new work **into this tree**.

**Autonomy:** `AGENTS.md` · `.cursor/skills/` · `sync/Never-86d/server/integrations/ctap/founder-ping.ts`. Agents work without asking. Ping Myke only for human logic and vertical expertise.

## Where each chat landed

| Chat / PR | What it was | Now |
|---|---|---|
| Env setup (#7) | Standalone Node/Vitest | Already in this lineage |
| PDQ + Humes intake (#3 / #8) | Z-report parser, mailbox routing | `sync/Never-86d/server/integrations/pdq/` + `ctap/` |
| OCR evidence (#4, merged) | Native PDF + Document AI ports | `sync/Never-86d/server/integrations/evidence/` |
| Vendor parsers (#5 / later harden) | Layout parsers + Friday beer dates + PFG last page + labor slips | `vendor-parsers.ts`, `week-window.ts` (HEIC mime kept) |
| Hunter bots (#6 / #11) | 1–3 unit GTM | `docs/gtm/hunter-bots/` |
| Food accounting (#9) | Prime cost rails | `docs/agent-memory/CTAP_Food_Accounting_Baseline.md` |
| POS + silo landscape (#10) | Operator pain vs vendors | `docs/agent-memory/CTAP_POS_Silo_Operator_Landscape.md` |
| Ops brain | Kenzy FOH / Tom BOH / Hy-Vee one-tap | `intake.ts` + `docs/ctap-intake/CTAP_OPERATOR_LOGIC.md` + `hyvee-one-click/` |
| Community Lab | Floor roster + Action Shift owners (crew locked 8/26) | `docs/ctap-intake/COMMUNITY_LAB.md` + `community-lab.ts` |
| Owner portal + Shift | First live seat | `portal/` Shift |
| Invoices + Sales memory | Last-week photos, Z hole | `portal/` Invoices + Sales |
| Monthly calendar | Smash $11.99 · Thursday pizza lock · Kenzy/Tom/Myke → Humes | engine + **Calendar portal seat** |

## Live owner seats

1. **Shift** — posted paper week Sun 8/30–Sat 9/5. Drive Google Sheet is stale (Karlee/Ashley).
2. **Sales** — Morning close card from last parsed Z (`npm run close`). Live week **8/23–8/29**. Drive has no **8/29** Z. 7/15–7/16/2026 + Sept 2025 weekly folder are history.
3. **Buy** — liquor/beer qty-to-order from the 8/23 Drive sheet. **Kenzy one-tap Hy-Vee. Myke out.** Config B1 Hy-Vee email still blank, SEND off. Crème Brûlée row on live sheet (par 3, qty 0).
4. **Invoices** — Live book 8/23–8/29 (no folder in Drive). 32 HEICs in `8-16 thru 8-22` are **last week**. Not OCR'd.
5. **Calendar** — September DRAFT. Smash Burger **$11.99** Tuesday. Medium pizza **GOES UP Thursday $17.99**. Tom food still blank. Humes unsent.

**Sales also shows the proposed menu move** from `CTAP_Updated_Menu.docx` (not in POS). Smash plate $14.99 ≠ Tuesday BOGO $11.99.

## Daily loop

`docs/MYKE_BRAIN.md` · `npm run close` · `npm run nightly`

## Still blocked (honest)

- Live Gmail PDQ / PFG / Humes PDFs (Gmail MCP `needsAuth` — Cursor Desktop)
- Food SKU order guide (the 32 photos *are* the list until OCR)
- Posted kitchen + driver weeks
- Document AI secrets
- Hy-Vee Apps Script **onEdit trigger** (Google 2FA / Kenzy Editor share) + Config B1 still blank
- Render deploy needs Myke to pick the workspace (MCP `list_workspaces` unauthorized from here)

`render.yaml` is in the repo. Blueprint: https://dashboard.render.com/blueprint/new?repo=https://github.com/mykemueller1-ctrl/Agent-ctap-marketing

See `docs/agent-memory/CTAP_What_We_Dont_Have.md`.
