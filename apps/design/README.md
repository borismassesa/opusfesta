# @opusfesta/design

The OpusFesta design system — foundations, components, patterns, and voice.

## Run locally

```bash
npm install
npm run dev -w @opusfesta/design
# → http://localhost:3008
```

Or via turbo:

```bash
npx turbo dev --filter=@opusfesta/design
```

## Structure

```
apps/design/
├── tokens.json                    ← source of truth for foundations
├── mdx-components.tsx             ← MDX element mapping
├── next.config.ts                 ← MDX + Next 16
└── src/
    ├── app/
    │   ├── page.tsx                → "Design at OpusFesta" hub
    │   ├── foundations/            → TSX, data-driven from tokens.json
    │   │   ├── color/page.tsx
    │   │   ├── typography/page.tsx
    │   │   ├── spacing/page.tsx
    │   │   ├── radius/page.tsx
    │   │   ├── elevation/page.tsx
    │   │   ├── motion/page.tsx
    │   │   └── iconography/page.tsx
    │   ├── components/             → MDX, narrative + live examples
    │   │   ├── button/page.mdx
    │   │   ├── pill/page.mdx
    │   │   ├── card/page.mdx
    │   │   └── input/page.mdx
    │   ├── patterns/page.mdx
    │   ├── voice/page.mdx
    │   └── changelog/page.mdx
    ├── components/                 → Showcase, DosAndDonts, Kicker, etc.
    ├── content/
    │   └── nav.ts                  → sidebar nav config
    └── lib/
        └── tokens.ts               → typed tokens.json export
```

## Who owns it

Boris, the designer, and the whole team.

- **Foundations** (colour, type, etc.) — edit `tokens.json`, the pages re-render.
- **Components &amp; patterns** — edit the MDX file. No React knowledge needed for copy.
- **New components** — add `src/app/components/<name>/page.mdx`, register in `src/content/nav.ts`.

## Contribution flow

1. Branch: `git checkout -b OF-DS-XXXX/description`
2. Edit MDX or tokens.
3. Run `npm run dev -w @opusfesta/design` to preview.
4. Open a PR. Ping the design lead for review.
5. On merge, bump the changelog at `src/app/changelog/page.mdx`.

## Canonical source

Design decisions come from the live marketing site at `apps/opus_website`. When the marketing site ships a new pattern that becomes system-wide, it belongs here.
