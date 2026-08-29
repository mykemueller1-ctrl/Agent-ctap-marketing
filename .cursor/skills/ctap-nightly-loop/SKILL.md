---
name: ctap-nightly-loop
description: Nightly CTAP close — PDQ Z parse, Action Shift, rails. Use when running nightly, close, morning Z, or when a close looks wrong.
---

# Nightly / morning close

```bash
npm run close
npm run nightly
```

- Action Shift is the **prior complete business day**, not today.
- Parser: `pdq-z-report-v2`. **Large Pizza rolls into Food.**
- Rails: Food <30% · Beer <21% · Liquor <20% · Labor <28%. Pattern, not verdict.
- Missing line ≠ $0. Blank cash ≠ shortage. Cannot close cost % on sales alone.
- One rail → that house (food Tom, beer/liquor Kenzy). Two houses or prime → **ping Myke**.
- Verbal yes does not close.
- Gmail disconnected is an access block. Use the Z already on disk. Do not make "Connect Gmail" the next human.

Logic: `close-looks-wrong.ts` · `founder-ping.ts` · `docs/ctap-intake/COMMUNITY_LAB.md`.
