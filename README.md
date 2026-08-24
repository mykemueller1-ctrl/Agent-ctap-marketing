# Agent-ctap-marketing

CTAP (Community Tap & Pizza) marketing / ops intake work. The `sync/Never-86d/`
tree is a cherry-pick source for the private `Never-86d` monorepo (see
`docs/ctap-intake/README.md`). It holds three integration areas plus their tests
and fixtures:

- **PDQ Z-report parser** and vendor mailbox-routing logic —
  `sync/Never-86d/server/integrations/pdq`, `.../vendors`, `.../ctap`.
- **Evidence (OCR) intake** — Phase 1 interfaces + Phase 2 extract/parse/truth —
  `sync/Never-86d/server/integrations/evidence/`
  (decision note: `docs/ctap-intake/ocr-evidence-intake.md`).
- **Agent memory / baselines** — `docs/agent-memory/`.

## Development

Requires Node.js 22+.

```bash
npm install     # install dev toolchain (vitest, typescript, tsx)
npm test        # run the full vitest suite (evidence + pdq + ctap)
npm run demo    # parse a real PDQ Z-report fixture end to end
```

### Notes on the sync tree

The PDQ detector imports a few boundary modules that live in the `Never-86d`
monorepo and are intentionally not copied here (`../gmail`, `../pdf`,
`../../../drizzle/schema`). `vitest.config.ts` resolves those specifiers to
lightweight test doubles so the synced logic runs standalone, without adding
files to the `sync/` tree (keeping it clean for cherry-picking). The tests never
exercise the doubles' behavior — the pure parser/routing logic is fully tested
against real fixtures. The `evidence/` module is self-contained and needs no
doubles.
