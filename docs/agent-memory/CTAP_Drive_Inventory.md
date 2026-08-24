# CTAP Google Drive inventory (owner-seat seed)

**Owner mailbox:** `communitypizza2026@gmail.com`
**Pulled:** 2026-08-24
**Used for:** Never 86'd owner portal, first live seat = Shift.

## What we actually found (not a dump)

| Kind | Drive title | How the portal uses it |
|---|---|---|
| Bar weekly schedule | `CTAP BAR SCHEDULE X1 WEEK` | Seeded as `portal/public/data/ctap-bar-schedule.csv` (posted week **Sun 8/30–Sat 9/5/2026**) |
| Bar schedule (older) | `CTAP BAR SCHEDULE` | Same wide CSV shape; parser covers it |
| How operators post a week | `HOW TO INPUT WEEKLY SCHEDULES` | Tokens: Open / OPEN (first cut) / Close / RO; departments Bar Crew vs Kitchen; Quick Assign |
| Kitchen / drivers | `CTAP KITCHEN SCHEDULE`, `CTAP DRIVER SCHEDULE` | Same template, not filled for this week — seats stay Bar-first |
| Liquor / beer order | `CTAP LIQUOR _ BEER ORDERING SHEET BLANK` | Next seat (**Buy**) — par vs quantity to order, over/under budget |
| Nightly sales | `7-15-2026` / `7-16-2026 ZReport_Summary Community Pizza.pdf` | Next seat (**Sales**) |
| Menu | `CTAP_Updated_Menu.docx` | Pricing context for sales/food cost later |

## Shift logic we inherited from Drive (not 7shifts)

Ashley / Karlee still build the week in a Google Sheet, download CSV, upload into Never 86'd. Paper tokens:

- **Open** — starts at open
- **OPEN** — first person cut when it slows ("O" on paper)
- **Close** — works until close
- **RO** — requested off
- **Station** — BAR SIDE, BAR SERVER, WAITRESS, PIZZA SIDE (department-specific)

The owner portal skips the download-CSV round trip for the first action: it loads the posted week, shows coverage holes, and lets Myke Quick Assign / copy Sunday onto a thin Monday.
