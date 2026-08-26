# Community Lab

This is the living lab. Public brand is **Never 86'd**. The mechanic is **Action Shift**. The store is **Community Tap & Pizza**. Do not invent a second product name.

Code: `sync/Never-86d/server/integrations/ctap/community-lab.ts`  
Mailbox: `communitypizza2026@gmail.com`  
MCP: `https://www.never86.ai/api/mcp` → `get_operator_system` first, then this overlay.

## Where we are (Wed 8/26, Iowa night)

**Locked**
- Kenzy Thompson = bar / FOH manager. Beer, liquor, drink specials, staffing out front.
- Tom Dorothy = BOH manager. Food orders, kitchen specials, staffing back.
- Karlee Sturtz and Ashley Holding are not on the floor.
- Floor crew still there: Jessica, Che, Gavin, Moe, Sally, Bryson (Wed 8/26).
- Hy-Vee 8/24 sent. Humes / Sysco / PFG mailbox switches sent. Do not re-send.
- Liquor sheet has Licor 43 Crème Brûlée + Config SEND. Script saved.

**Not in this agent**
- Gmail and GitHub Pages are machine-local. This run cannot flip them.
- No PDQ Z-report in Drive after 8/24 from here.

## Roles (AI-native)

One leak → one owner. Pattern, not verdict.

| Role | Person | House | Never86 seat | Owns |
|---|---|---|---|---|
| Owner-operator | Myke | owner | Owner | prime cost, 3P, books, approve the card |
| Bar FOH manager | Kenzy | front | Bar Manager | beer + liquor orders, drink specials, FOH staffing |
| BOH manager | Tom | back | Chef | food vendors, kitchen specials, BOH staffing |
| Bartender | Jessica Gailey, Che Lyftogt | front | Crew | pours, bar execution |
| Server | crew | front | Crew | tables, tips |
| Driver | crew | front | Crew | delivery time |
| Pizza maker | crew | back | Crew | make line. Large Pizza rolls into Food |
| Fry line | crew | back | Crew | fry execution |
| Dishwasher / In-shop / Extra | crew | back | Crew | labor hours only |

Action Shift routing in code: liquor/beer/FOH labor → Kenzy. Food/BOH labor → Tom. Prime / 3P / blended labor → Myke.

## When a close looks wrong

Morning Z parse: `npm run close`. Uses `closeLooksWrong()` (`sync/Never-86d/server/integrations/ctap/close-looks-wrong.ts`). Logic, not clicks. Reads actual deposit off the Z. Missing food + beer/liquor invoices escalate to Myke, not a Kenzy/Tom duel.

1. **Missing line ≠ $0.** Blank food / beer / liquor / pop / labor is Missing Evidence. Do not pad.
2. **Blank or $0 cash is not a shortage.** Need expected cash and a matching deposit.
3. **Cannot close a cost % on sales alone.** Z is the denominator. Invoices are the numerator. Same business date.
4. **One rail → that house.** Food → Tom. Beer / liquor → Kenzy. Labor / prime / 3P → Myke.
5. **Two rails or two houses → Myke.** Do not give Kenzy and Tom competing verdicts for one night.
6. **Verbal yes does not close.** Night proof is a Z, an invoice, or a deposit — not “yeah that looks right.”
7. **Pattern, not verdict.** One night does not rewrite the order guide or cut a body.

Large Pizza already rolls into Food. Action Shift is the prior complete day, not today.

## Crew on the floor (presence locked Wed 8/26)

| Person | House | Job | Job confidence |
|---|---|---|---|
| Jessica Gailey | front | Bartender | VERIFIED (PDQ) |
| Che Lyftogt | front | Bartender | VERIFIED (PDQ) |
| Gavin Noore | front | Server | ESTIMATED from old PDQ cashier line |
| Moe Thomas | front | Server | ESTIMATED from old PDQ cashier line |
| Sally Hart | front | Server | ESTIMATED from old PDQ cashier line |
| Bryson Cook | back | Extra | ESTIMATED from old PDQ cashier + payouts |

PDQ prints **Ctap Manger** and **Thomas Dorothy**. That is Kenzy / Tom, not a third manager. Action Shift still routes leaks to Kenzy / Tom / Myke, not to crew.
