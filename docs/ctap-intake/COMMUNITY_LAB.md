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
- Hy-Vee 8/24 sent. Humes / Sysco / PFG mailbox switches sent. Do not re-send.
- Liquor sheet has Licor 43 Crème Brûlée + Config SEND. Script saved. Trigger still needs Google phone Yes as communitypizza.

**Not yet in this agent**
- No PDQ Z-report in Drive after 8/24. Gmail MCP is not connected, so Tue Humes PDF cannot be confirmed from here.
- Kenzy / Tom emails unknown. Hy-Vee Wine order-to email unknown (Config B1 empty).
- Crew below managers is ESTIMATED from PDQ cashier lines (Sep–Oct 2025). Confirm who is still on the floor.

## Roles (AI-native)

One leak → one owner. Pattern, not verdict.

| Role | Person | House | Never86 seat | Owns |
|---|---|---|---|---|
| Owner-operator | Myke | owner | Owner | prime cost, 3P, books, approve the card |
| Bar FOH manager | Kenzy | front | Bar Manager | beer + liquor orders, drink specials, FOH staffing |
| BOH manager | Tom | back | Chef | food vendors, kitchen specials, BOH staffing |
| Bartender | crew | front | Crew | pours, bar execution |
| Server | crew | front | Crew | tables, tips |
| Driver | crew | front | Crew | delivery time |
| Pizza maker | crew | back | Crew | make line. Large Pizza rolls into Food |
| Fry line | crew | back | Crew | fry execution |
| Dishwasher / In-shop / Extra | crew | back | Crew | labor hours only |

Action Shift routing in code: liquor/beer/FOH labor → Kenzy. Food/BOH labor → Tom. Prime / 3P / blended labor → Myke.

## Crew observed on PDQ (ESTIMATED — confirm)

Jessica Gailey · Che Lyftogt · Gavin Noore · Moe Thomas · Sally Hart · Bryson Cook

PDQ prints **Ctap Manger** and **Thomas Dorothy**. That is Kenzy / Tom, not a third manager.

## What Myke still has to unlock (not paste code)

1. **Connect Gmail** in Cursor desktop as `communitypizza2026@gmail.com`. Without that I cannot see nightly PDQ or Tuesday Humes.
2. **One line:** who of Jessica / Che / Gavin / Moe / Sally / Bryson is still on the floor, and their PDQ job.
3. Kenzy email + Tom email (or “they use communitypizza”).
4. Hy-Vee Wine order email → Config B1.
5. Google Yes on the phone when I retry Kenzy’s SEND trigger as communitypizza.

That is the whole ask. The role book is already in git. Tomorrow’s finish line is: Gmail live + crew confirmed + Action Shift routing to Kenzy / Tom / Myke on a real Z-report.
