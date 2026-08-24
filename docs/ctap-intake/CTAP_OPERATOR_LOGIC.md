# Community Tap & Pizza — operator logic
Living lab. Last locked Mon Aug 24, 2026. Owner of this Drive: communitypizza2026@gmail.com

This is how Community runs. Agents and humans follow it. Do not invent a second mailbox or a second liquor order path.

## Store
- Community Tap & Pizza (CTAP), Fort Dodge, Iowa
- Pizza + bar. One store. Owner-operator.
- POS: PDQ (nightly Z-report PDF)
- Ops mailbox (intake + outbound): communitypizza2026@gmail.com
- Do not send vendor/POS mail to myke@n86.app

## People
- Myke Mueller — owner. Not in the weekly Hy-Vee email loop.
- Kenzy Thompson — wife. Liquor/beer par. Fills the Google liquor sheet. One-tap SEND to Hy-Vee. Myke out.
- Karlee Sturtz — bar manager (floor, schedule, inventory input)
- Ashley Holding — bar floor
- Tom Dorothy — kitchen. Northern Lights / Sawyer photos.

## Rails (do not blend beer + liquor)
- Food cost under 30% of food sales
- Beer cost under 21% of beer sales
- Liquor cost under 20% of liquor sales
- Labor under 28% of sales
- Prime cost = COGS + labor. Track weekly. Pattern, not verdict.
- Handwritten invoice totals beat printed. Strike-throughs dropped. Out-of-year tickets out of the week book.

## Alcohol buy rule
Do not fill every par hole. Buy from POS movement + on-hand + replacement need. Separate beer from liquor. A $1,400 alcohol week can be fine if sales support it. Full-guide par-fill is the overbuy risk.

## Nightly
1. PDQ Z-report lands in communitypizza Gmail / Drive
2. Parse multiline (label, then $ on the next line)
3. Large Pizza / Large Pizzas rolls into Food (qty and $). Keep the raw Large Pizza line for audit.
4. Action Shift is for the prior complete business day, not today.

## Alcohol calendar (Iowa)
- Sun/Mon: Kenzy puts liquor qty on the Google sheet, checks SEND, Hy-Vee is emailed from communitypizza. Myke does not forward texts.
- Monday: Hy-Vee liquor delivery
- Sunday night: beer order → Tuesday Humes / Fort Dodge Distributing
- Tuesday night: beer order → Friday Humes
- Friday: Humes delivery

Liquor sheet: https://docs.google.com/spreadsheets/d/1_gAesi5ufLOHsQ_uan3PEfzcOaVg4gxP8P7F_YHMHbU/edit
Add a row for Licor 43 Crème Brûlée so the sheet matches what Kenzy actually orders.

One-tap setup (once, logged into communitypizza): Extensions → Apps Script → paste Code.gs → allow → trigger onEditInstallable → Config B1 = Hy-Vee Wine email you already use.

## Vendors
| Vendor | Cadence | How it arrives | Mailbox |
|---|---|---|---|
| PDQ | nightly | email PDF | already communitypizza |
| Sysco | ~1×/week | photo | switch sent 8/24 |
| Performance Foods / PFG | ~2× (Mon/Thu) | email PDF from NoReply@pfgc.com | switch sent 8/24 to Scott Selim scott.selim@pfgc.com — never email NoReply |
| Northern Lights | 2–8× | photo + PDF | already communitypizza |
| Sawyer Meats | 2–3× (Mon/Wed/Fri) | photo | photos to communitypizza |
| Humes | Tue + Fri | email PDF | switch sent 8/24 to accountspayable@humesdist.com |
| Hy-Vee Wine | Sun/Mon order, Mon delivery | Kenzy one-tap outbound | from communitypizza |
| Fort Dodge Distributing | with Tuesday beer | TBD | with Humes Tuesday path |

## Invoice truth
Photo vendors (Sysco, Northern Lights, Sawyer) always need a picture. Email vendors must land in communitypizza. Next proof for Humes: Tuesday PDF in this inbox, not myke@n86.app.

## Week book 8/16–8/22 (OCR, still holes)
Food $2,718.82 · Beer $1,391.80 · Liquor $1,247.62 · about $5,358. Missing: PFS page 2, Friday Humes, Friday Sawyer.

## Monday 8/24 already done — do not duplicate
- Hy-Vee liquor: Kenzy’s 33-line text, including Tito’s 10, Captain 7, Crown Apple 4, Licor 43 Crème Brûlée 2, Champagne (Ballatore) 1. Sent from communitypizza.
- Humes / Sysco / PFG: “send invoices here instead: communitypizza2026@gmail.com”

## Never 86'd note (this store is the specimen)
1–3 unit owner-operator. Floor + books. One file, no demo. Beat MarginEdge on next action, not another invoice database. Public wedge: https://www.never86.ai/audit
