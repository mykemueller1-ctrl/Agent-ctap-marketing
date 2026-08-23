# CTAP intake — PDQ dial-in + mailbox routing (Aug 23 2026)

## Ops mailbox (single intake)
All CTAP POS + vendor mail → **`communitypizza2026@gmail.com`**

| Source | Cadence | Mode | Notes |
|---|---|---|---|
| PDQ Z-report | Nightly | Email PDF | Already → communitypizza |
| Sysco | ~1×/wk | Photo OCR | |
| Performance Foods / PFG | ~2×/wk | Email or photo | |
| Northern Lights | 2–8×/wk | Photo OCR | Spikes when in town |
| Sawyer Meats | 2–3×/wk | Photo OCR | Always pictures |
| Humes Distributing | ~2×/wk | Email PDF | **Switch off `myke@n86.app`** — draft in `humes-mailbox-switch-email.txt` |

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
