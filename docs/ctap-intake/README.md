# CTAP intake — PDQ dial-in + mailbox routing (Aug 23 2026)

## Weekly alcohol order / delivery calendar (Myke + bar managers)
- **Sun or Mon morning:** email **liquor order → Hy-Vee Wine** (from CTAP liquor/beer ordering sheet)
- **Monday:** Hy-Vee wine/liquor delivery lands
- **Sunday night:** beer order for Budweiser path → **Tuesday** Humes / Fort Dodge Distributing drop
- **Tuesday night:** beer order for **Friday** Humes drop
- **Friday:** Humes delivery
- Ashley Holding owns weekly liquor/beer Google Sheet workflow; Karlee/Ashley bar managers

## Ops mailbox (single intake)
All CTAP POS + vendor mail → **`communitypizza2026@gmail.com`**

| Source | Cadence | Mode | Notes |
|---|---|---|---|
| PDQ Z-report | Nightly | Email PDF | Already → communitypizza |
| Sysco | ~1×/wk | Photo OCR | |
| Performance Foods / PFG | ~2×/wk | Email or photo | |
| Northern Lights | 2–8×/wk | Photo OCR | Spikes when in town |
| Sawyer Meats | 2–3×/wk | Photo OCR | Always pictures |
| Humes Distributing | ~2×/wk (Tue + Fri) | Email PDF | **Switch off `myke@n86.app`** — draft in `humes-mailbox-switch-email.txt` |
| Hy-Vee Wine & Spirits | 1×/wk | Outbound email order | Sun/Mon morning liquor order email |
| Fort Dodge Distributing | with Tue beer run | TBD | Named in bar-manager workflow doc |

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

## Blocked this run
- **Gmail MCP** still `needsAuth` on the cloud agent — cannot send Humes switch or Hy-Vee liquor order until Gmail connects on *this* agent (desktop auth alone is not enough).
