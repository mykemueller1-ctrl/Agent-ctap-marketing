# CTAP Monthly Calendar Engine — Never86'd

Status: contracts + in-memory engine on `cursor/monthly-calendar-engine-0561`.
Copy into `Never-86d` under `server/calendar/`. This agent still cannot push that repo.

## Roles

| Person | Side | What they own |
|---|---|---|
| **Kenzy** | Bar | Drink specials, glassware/garnish, football promo *decisions* |
| **Tom** | Kitchen manager | Food specials, monthly food feature |
| **Myke** | Operations | Final approval. The only person who can release the Humes email |

## Hard rules

- `DRAFT` → `MANAGER_REVIEW` → `MYKE_REVIEW` → `APPROVED` → `SENT_TO_HUMES`
- The agent never emails Humes on its own judgment.
- Thursday medium pizza stays Thursday. Edit once in the Recurring Specials Library.
- Football games may appear on the planning screen. They are not promotions. Monday/Thursday Night Football promos are **NOT CREATED** until Kenzy/Myke record a decision.
- Suggest events. Never silently add a promotion Myke has not approved.
- Ignore internet holidays. Labor Day and football are MUST USE traffic.

## Cadence (for the *next* month)

| Day | Action |
|---|---|
| 1st | Create `CTAP — [Next Month] Special Events Calendar` |
| 10th | Internal notice: % complete + missing items (Tom food, Kenzy drink, football decisions, unconfirmed events) |
| 13th | Lock except explicit exceptions |
| 14th | Myke packet: preview, food, drink, holidays, events, weekly promos, prices, changed specials. Buttons **APPROVE / EDIT / HOLD** |
| 15th | If approved, generate the Humes email. Subject `CTAP — {Month Year} Calendar`. Log `sent_at`, `recipient`, `calendar_version`, `sent_by`, `approval_by`, `attachment_hash` |

## Intelligence

Not just a calendar generator. `special_performance` feeds plan → execute → measure → learn → recommend (example: Apple Cider Mimosas back next September from last year's gross profit and Sunday brunch mix).
