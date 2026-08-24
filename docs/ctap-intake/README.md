# CTAP intake — PDQ dial-in + mailbox routing (Aug 23 2026)

## Weekly alcohol order / delivery calendar (Kenzy one-tap)
- Kenzy fills qty on the Google liquor sheet → checks **SEND** on Config → Hy-Vee is emailed from `communitypizza2026@gmail.com`
- **Myke is out of this loop.** Script: `docs/ctap-intake/hyvee-one-click/`
- Add Licor 43 Crème Brûlée as a sheet row so 1-click matches what she orders
- **Monday:** Hy-Vee wine/liquor delivery lands
- **Sunday night:** beer order for Budweiser path → **Tuesday** Humes / Fort Dodge Distributing drop
- **Tuesday night:** beer order for **Friday** Humes drop
- **Friday:** Humes delivery
- **Kenzy Thompson** — wife, **bar FOH manager**. Bar orders (beer + liquor), drink specials, staffing out front. One-tap Hy-Vee. Myke out of the Hy-Vee email loop.
- **Tom Dorothy** — **BOH manager**. Same job in back: food vendor orders (Sysco, PFG, NL, Sawyer), kitchen specials, staffing BOH.
- Karlee Sturtz / Ashley Holding — **not on the floor**

## Canonical logic (Drive + git)
Full Community operator logic: `docs/ctap-intake/CTAP_OPERATOR_LOGIC.md`  
Put a copy in Google Docs on `communitypizza2026@gmail.com` titled **CTAP — Community operator logic**. This cloud agent can read that Drive; create/copy returns 403 so the first paste is from phone/desktop.
All CTAP POS + vendor mail → **`communitypizza2026@gmail.com`**

| Source | Cadence | Mode | Notes |
|---|---|---|---|
| PDQ Z-report | Nightly | Email PDF | Already → communitypizza |
| Sysco | ~1×/wk | Photo OCR | **Tom** / BOH. Mailbox switch **sent 8/24** |
| Performance Foods / PFG | ~2×/wk | Email or photo | **Tom** / BOH. Switch **sent 8/24** to Scott Selim. Never `NoReply@pfgc.com` |
| Northern Lights | 2–8×/wk | Photo OCR + PDF | **Tom** / BOH. **Already on communitypizza** — do not send a switch |
| Sawyer Meats | 2–3×/wk | Photo OCR | **Tom** / BOH. Always pictures |
| Humes Distributing | ~2×/wk (Tue + Fri) | Email PDF | **Kenzy** / FOH beer. Switch **sent 8/24**. Watch Tue/Fri PDFs land here, not `myke@n86.app` |
| Hy-Vee Wine & Spirits | 1×/wk | Outbound email order | **Kenzy** / FOH liquor. Sun/Mon one-tap |
| Fort Dodge Distributing | with Tue beer run | Photo OCR | **Kenzy** / FOH beer. With Tuesday Humes path |

## PDQ parse rules (`pdq-z-report-v2`)
- Real PDQ PDF text is **multiline** (label, then `$` on the next line).
- Section-scoped: Sales Summary, Menu Category, Labor, Discount, Misc.
- **Large Pizza / Large Pizzas rolls into Food** (qty + $). Raw Large Pizza line kept for audit.
- Fixtures + tests: `sync/Never-86d/server/integrations/pdq/`

## Next POS / silo dial order
**POS:** PDQ (live) → Toast → Square → Clover → Aloha → Revel → SkyTab → MICROS  
**Silos:** MarginEdge (beat on next-action / Human Insight) → R365 → 7shifts → HotSchedules → Sling

## Code landing
Cloud agent can push **Agent-ctap-marketing** only. Full patch lives under `sync/Never-86d/` for cherry-pick into `mykemueller1-ctrl/Never-86d` (push to that repo returned 403 for this agent). Local commit on Never-86d clone: `f6901ea` on branch `cursor/pdq-parser-humes-intake-ceda`.

## Monday Aug 24 6am Iowa go-live
- Hunter files confirmed: `docs/gtm/hunter-bots/monday-morning-runbook.md` + `grok-first-hunt.md`
- Live path: grok.com/connectors → Custom → `https://www.never86.ai/api/mcp` → paste `grok-first-hunt.md`
- Hy-Vee liquor **sent 8/24** from Kenzy’s Excel text (33 lines, includes Licor 43 Crème Brûlée ×2). Do not re-send
- Humes AP switch **sent 8/24 from `communitypizza2026@gmail.com`**. Do not re-send. Next proof: Tue invoice PDF in that inbox
- PFG + Sysco mailbox switches **sent 8/24** (operator confirmed). Do not re-send
- Northern Lights **already on communitypizza** (photos + PDF Inv684607). Do not send a switch
- Tuesday beer draft (`humes-beer-order-draft.txt`) — skip; this week’s alcohol orders are done

## Blocked this run
- **Gmail MCP** still `needsAuth` on the cloud agent — cannot read PFG/Humes mail from here. Outbound vendor mail is live from `communitypizza2026@gmail.com` (phone/desktop).
