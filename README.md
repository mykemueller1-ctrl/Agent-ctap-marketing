# Agent-ctap-marketing

CTAP (Community Tap & Pizza) marketing / ops intake work. The `sync/Never-86d/`
tree is a cherry-pick source for the private `Never-86d` monorepo (see
`docs/ctap-intake/README.md`); it holds the PDQ Z-report parser and vendor
mailbox-routing logic plus their tests and fixtures.

## Development

Requires Node.js 22+.

```bash
npm install     # install dev toolchain (vitest, typescript, tsx)
npm test        # run the vitest suite (sync/**/*.test.ts)
npm run demo    # parse a real PDQ Z-report fixture end to end
```

### Notes on the sync tree

`sync/Never-86d/**` imports a few boundary modules that live in the `Never-86d`
monorepo and are intentionally not copied here (`../gmail`, `../pdf`,
`../../../drizzle/schema`). `vitest.config.ts` resolves those specifiers to
lightweight test doubles so the synced logic runs standalone, without adding
files to the `sync/` tree (keeping it clean for cherry-picking). The tests never
exercise the doubles' behavior — the pure parser/routing logic is fully tested
against real fixtures.
