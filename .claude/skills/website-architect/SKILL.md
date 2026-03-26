---
name: website-architect
description: "Core marketplace platform — website app, vendor discovery, booking flows, event planning, user journeys."
---

# Website Architecture

## Tech Stack

- **Framework:** Next.js App Router with React Server Components
- **Styling:** Tailwind CSS with brutalist design system
- **Database:** Supabase (Postgres, storage, auth)
- **Auth:** Clerk for user authentication
- **Hosting:** Vercel

## Monorepo Structure

```
opusfesta/
├── apps/
│   ├── studio/          # Studio CMS + client portal (MPS)
│   ├── website/         # Public marketplace (WEB)
│   ├── admin/           # Admin dashboard (ADM) — or within studio
│   ├── vendor-portal/   # Vendor-facing portal (VND)
│   ├── mobile/          # Mobile app (future)
│   └── customersupport/ # Support tools
├── packages/
│   ├── ui/              # Shared UI components
│   ├── config/          # Shared configs (tailwind, tsconfig)
│   └── utils/           # Shared utilities
├── supabase/
│   └── migrations/      # Database migrations
└── turbo.json           # Turborepo config
```

## Key Areas

- **Vendor Discovery** — search, filter, browse vendors by category, location, budget range (TZS)
- **Booking Flows** — public-facing inquiry forms, booking intake
- **Event Planning** — tools, guides, checklists for Tanzania weddings
- **User Journeys** — landing pages, onboarding, conversion funnels

## Architecture Decision Records (ADR)

When making significant architectural decisions, document them:

```markdown
# ADR-{NUMBER}: {Title}

## Status
Accepted | Proposed | Deprecated

## Context
What problem are we solving? What constraints exist?

## Decision
What did we decide and why?

## Alternatives Considered
- Option A: [description] — rejected because [reason]
- Option B: [description] — rejected because [reason]

## Consequences
- Positive: [benefits]
- Negative: [trade-offs]
```

Store ADRs in `docs/adr/` when created.

## Trade-off Analysis

When choosing between approaches, evaluate:

| Factor | Weight | Option A | Option B |
|--------|--------|----------|----------|
| Performance | High | ? | ? |
| Complexity | Medium | ? | ? |
| Maintainability | High | ? | ? |
| Time to implement | Medium | ? | ? |
| Tanzania market fit | High | ? | ? |

## Tanzania Market Considerations

- **Currency:** TZS throughout, formatted with thousand separators
- **Mobile-first:** majority of users on mobile devices
- **WhatsApp:** integration for notifications and vendor communication
- **Network:** optimize for slower connections (3G common)
- **SEO:** optimize public pages for local search (Dar es Salaam, Tanzania)

## Pattern Selection

| Need | Pattern |
|------|---------|
| Data fetching | Server Components with Supabase |
| Forms | Client Components with server actions |
| Auth-gated pages | Clerk middleware + server auth check |
| CMS content | Supabase `studio_page_sections` table |
| File uploads | Supabase Storage with signed URLs |
| Real-time | Supabase Realtime subscriptions |
| Search | Supabase full-text search or `.ilike()` |
