---
name: ctap-owner-portal
description: Five-seat owner cockpit (Shift, Sales, Buy, Invoices, Calendar). Use when changing portal UI, seats, or portal JSON.
---

# Owner portal

```bash
npm run portal   # 0.0.0.0:5173
npm run build    # portal/dist for Render
```

| Seat | Honest state |
|---|---|
| Shift | Bar week from Drive. Kitchen + drivers are templates if times are blank — do not invent hours. |
| Sales | Morning close from last Z. Menu from docx is PROPOSED, not POS. |
| Buy | Names / par / qty. Kenzy one-tap. No unit prices in git. Config B1 blank → ping, do not invent email. |
| Invoices | HEIC Drive chips. No OCR totals without Document AI. Week window Sun–Sat only. |
| Calendar | Smash $11.99 Tue. Thursday pizza $17.99 GOES UP Thursday. Tom food blank until he names it. Only Myke emails Humes. |

Claim a public URL only after curl HTTP 200. `render.yaml` + Blueprint on `main`.
