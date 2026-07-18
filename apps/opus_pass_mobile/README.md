# OpusPass Mobile

Expo app for **OpusPass** — the digital invitation, RSVP, guest-list and pledge
product. The web counterpart is `apps/opus_pass`; this app is its mobile client
and shares the same Clerk instance and Supabase project.

Not to be confused with `apps/of_mobile`, which is the OpusFesta marketplace app
(couples + vendors). The two are separate apps, separate bundle IDs, separate
App Store listings — they only share a design system.

## Setup

```bash
cp .env.example .env      # fill in the Clerk + Supabase keys
npm install               # from the monorepo root
npm start                 # from this directory
```

## Stack

Mirrors `of_mobile` deliberately, so knowledge transfers between the two:

- **Expo SDK 54** + **expo-router** (typed routes)
- **NativeWind 4** for styling; `of-*` and `ed-*` token scales
- **Clerk** (`@clerk/clerk-expo`) for auth, with a `expo-secure-store` token cache
- **Supabase** via a Clerk-JWT-injecting client (`src/lib/supabase.ts`)
- **TanStack Query** for server state

## Design system

The Editorial Romance tokens are **copied** from `of_mobile`, not imported:
`global.css`, `tailwind.config.ts`, `src/constants/palette.ts` and `src/theme/`.
`src/theme/palette.sync.test.ts` guards that `global.css` and `palette.ts` agree
*within this app*. If you change a token here, change it in `of_mobile` too —
nothing enforces cross-app agreement yet.

## Before the first build

`app.json` has no `extra.eas.projectId` yet. Run `eas init` from this directory
to create the EAS project and let it write the ID.

## Testing

Pure-logic tests are `*.test.ts` and run under Node's built-in runner:

```bash
npm test
```

There is no jest-expo setup here yet (`of_mobile` has one for component tests);
add it when the first `*.test.tsx` appears.
