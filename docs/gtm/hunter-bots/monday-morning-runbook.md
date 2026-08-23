# Monday morning go-live — Gronk is Head of Marketing

**When:** Monday 6:00 a.m. Iowa (Hy-Vee liquor window + first Hunter run)  
**Who:** Myke (phone is enough)  
**Brain:** `https://www.never86.ai/api/mcp` · tool `get_operator_system`  
**Do not:** rebuild math inside Grok · auto-post · ask portal passwords · call fees theft

This is the plan researched against live Never86 MCP, xAI Grok Connectors, and where 1–3 unit operators actually bitch (Facebook operator groups first, then Reddit `r/restaurantowners`, then X, then TikTok/LinkedIn). Grok wins Head of Marketing because it can search X natively. Cursor X MCP is optional later.

---

## 0–10 min — plug Gronk into the brain

Phone or any live computer:

1. Open https://grok.com/connectors  
2. **New Connector → Custom**  
3. Name: `Never86'd Operator Intelligence`  
4. URL: `https://www.never86.ai/api/mcp`  
5. Add. Paid Grok plan required for custom connectors.  
6. New chat. Paste **all** of `grok-first-hunt.md` (one shot).

If connectors fail on phone: open https://www.never86.ai/mcp and do it on any tablet. Same three clicks.

Also paste `system-prompts.md` § Hunter into Grok custom instructions / project instructions so every later chat stays in voice.

---

## 10–20 min — first hunt (Grok does the scan)

Grok should return **8–15 lead cards**, scored. You keep anything `score ≥ 60`.

You send **nothing** yet. Max **three** human-approved replies later (see `outreach-drafts.md`).

Verticals Gronk must cover in that first hunt (not generic “restaurants”):

| Vertical | Where they cry | What we ask for |
|---|---|---|
| Independent pizza / PDQ shops | FB pizza owner groups, Reddit pizza, X | 3P statement + Z-report |
| Neighborhood bar | FB bar owners, Humes/beer threads | 3P + invoice photo |
| 1–3 unit QSR / fast casual | r/restaurantowners, TikTok owner rants | 3P statement |
| “I already pay MarginEdge / R365 / 7shifts” | LinkedIn + X | Proof they still don’t get a next action |
| Iowa / Midwest independents | On the Line 515 adjacency | Victor intro, not a cold SaaS pitch |

Drop: dashers, consumers, 20+ unit groups, vendors selling software.

---

## 20–25 min — store ops (same morning)

You already deferred this:

- Email Humes: please start sending invoices here instead → `communitypizza2026@gmail.com`
- Email Hy-Vee Wine the liquor lines with qty > 0 from the Drive sheet

Hunter and trucks are the same Monday. Don’t skip food for tweets.

---

## 25–30 min — Desk

For each kept lead, file lives in a note (Notes app is fine until Gmail MCP works):

```
date:
url:
score:
file_to_ask:
reply_approved: no
```

Hook never changes: one redacted statement → https://www.never86.ai/audit

---

## What “best in vertical” actually means here

Not HubSpot. Not a sales army.

Best independent-restaurant acquisition in 2026 is:

1. **Listen** where owners already yell (FB groups > Reddit > X > TikTok).
2. **One file**, no login (audit.never86.ai).
3. **Human reply** that answers the thread, one link, disclose Never 86'd.
4. **Same MCP brain** in Grok/ChatGPT/Claude/Gemini so the 3P math cannot drift.
5. **Iowa trust flywheel** (Victor / On the Line 515) for in-state, Grok hunter for national.

Never86 already has the 52-week 3P authority system and the Aug 14 public-signal sample. Hunter feeds that desk. It does not replace it with fake Reddit accounts.

---

## ChatGPT / Claude / Gemini (same morning if you have 5 extra minutes)

Same MCP URL. Different wording, same formulas.

- ChatGPT: Settings → Connectors / MCP → `https://www.never86.ai/api/mcp`
- Claude: Custom connector / MCP remote
- Gemini: MCP if the client supports remote HTTP; otherwise use the browser audit

Paste Close Reader prompt into Claude. Paste Outreach prompt into ChatGPT. Grok stays Hunter.

---

## Blocked vs live

| Thing | Monday morning |
|---|---|
| Gronk + Never86 MCP | **You can turn this on from a phone** |
| First X/web hunt | **Grok native search — does not need Cursor X MCP** |
| Cursor cloud X/Gmail | Still dead until a computer authenticates MCP |
| Auto-posting | Never. That’s the product. |

If Grok returns zero operator-voice hits, run the Facebook group pain phrases by hand (you already live there). Score with `node --test` logic in `lead-desk.mjs` or just keep score ≥ 60 by gut matching the ICP card.
