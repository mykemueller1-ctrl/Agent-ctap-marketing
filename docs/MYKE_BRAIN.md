# Myke brain — CTAP + Never 86'd workflows

**One working tree:** `docs/agent-memory/CTAP_One_Tree.md`. Ignore the split chat PRs.

This is the operating loop. Agents execute it. Humans only approve sends.

**ICP:** 1–3 unit owner-operator. Floor + books. Burnt on SaaS. One file, no demo. Specimen = CTAP.

**Mailbox:** `communitypizza2026@gmail.com`  
**MCP brain:** `https://www.never86.ai/api/mcp` → `get_operator_system`  
**Public wedge:** https://www.never86.ai/audit  
**Lab:** Community Lab (`docs/ctap-intake/COMMUNITY_LAB.md`) — store overlay on Never 86'd. Kenzy front, Tom back, Myke owner.  
**People (managers locked 8/24; crew presence locked 8/26, operator confirmed):** Kenzy Thompson (wife, **bar FOH manager** — bar orders / beer + liquor, drink specials, staffing out front) · Tom Dorothy (**BOH manager** — same job in back: food orders, kitchen specials, BOH staffing). Karlee and Ashley are not on the floor. Floor crew still there: Jessica Gailey, Che Lyftogt (bartenders) · Gavin Noore, Moe Thomas, Sally Hart, Bryson Cook (job titles still estimated).  
**Logic when a close looks wrong:** `docs/ctap-intake/COMMUNITY_LAB.md` — missing ≠ $0, cash blank ≠ shortage, one rail → Kenzy/Tom, two houses → Myke, verbal yes does not close.

---

## Every night
1. PDQ Z-report PDF lands in Gmail/Drive.
2. Parse with `pdq-z-report-v2`. **Large Pizza rolls into Food.**
3. One Action Shift for the **prior complete business day** (not today).

## Every Monday morning (Iowa)
1. **Hy-Vee Wine** — Kenzy fills qty on the Google Sheet and checks SEND. Apps Script emails Hy-Vee from communitypizza. **Myke is out.** **Mon 8/24 SENT** (Kenzy text, 33 lines, Crème Brûlée 2) — historical, do not re-send. Live path: `docs/ctap-intake/hyvee-one-click/`. Crème Brûlée row is on the live sheet (par 3, qty 0 this week). Trigger still needs Google phone Yes (2FA).
2. **Humes / Sysco / PFG AP** — mailbox switches **SENT 8/24 from `communitypizza2026@gmail.com`.** Do not re-send. Next: invoices land in that inbox, not `myke@n86.app`.
3. **Gronk Hunter** — grok.com/connectors → Never86 MCP → paste `docs/gtm/hunter-bots/grok-first-hunt.md`. Keep score ≥ 60. Max 3 human-approved replies. No auto-post.
4. Beer order path: Sunday night for **Tuesday** Humes / Fort Dodge Distributing (Kenzy).

## Vendor book (photo + email)
Window this week: **Sun 8/16 – Sat 8/22** (see `week-window.ts`).

| Vendor | Cadence | Mode |
|---|---|---|
| Sysco | ~1× | photo OCR — **Tom** / BOH. mailbox switch sent 8/24 |
| PFG / Performance | Mon/Thu | email PDF — **Tom** / BOH. switch sent 8/24 to Scott Selim |
| Northern Lights | 2–8× | **Tom** / BOH. already on communitypizza |
| Sawyer Meats | Mon/Wed/Fri (~2–3×) | photo OCR — **Tom** / BOH |
| Humes | Tue/Fri | email PDF — **Kenzy** / FOH beer → **must land communitypizza** |
| Hy-Vee Wine | Sun/Mon order, Mon delivery | Kenzy one-tap outbound from communitypizza |
| PDQ | nightly | email PDF |

Truth: handwritten totals beat printed. Strike-throughs dropped. Out-of-year tickets out of the book.

8/16–8/22 known (OCR agent): Food **$2,718.82** · Beer **$1,391.80** · Liquor **$1,247.62** · ~**$5,358**. Still missing: PFS p2, Fri Humes, Fri Sawyer.

## Rails (CTAP)
Food <30% · Beer <21% · Liquor <20% · Labor <28%. Prime cost = COGS + labor. Pattern not verdict.

## Never 86'd product ladder
Free 3P audit → free Action Shift (1 store / 1 login) → paid seats → Command only if they leave 1–3 units.

Issue still open on never86: **#118 self-serve one-store activation**.

## Recurring library (locked this week)
- **Tuesday Smash Burger $11.99** BOGO second with side.
- **Thursday medium pizza $17.99 all day — GOES UP Thursday, never Wednesday.**

## What this computer cannot do until MCP attaches
- Send Gmail (Humes / Hy-Vee / PFG pull)
- Scan X from Cursor (Grok.com can)
- Push `Never-86d` (403)
- Open ChatGPT “Tom” kitchen project
- Call Document AI without processor env

Phone send is valid. Gronk on grok.com is valid.
