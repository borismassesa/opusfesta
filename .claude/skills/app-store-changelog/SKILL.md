---
name: app-store-changelog
description: Use when the user says "what's new", "draft release notes", "App Store changelog", "what to test", "TestFlight checklist", "write test notes for this build", or "QA checklist". Produces three outputs depending on context: App Store "What's New" notes, TestFlight "What to Test" notes, and an Admin Team release brief tailored to relevant stakeholders (designers, finance, ops, etc.).
version: 0.2.0
---

# OpusFesta Release Notes & QA Checklist

Handles all release communication for **OpusFesta** — Tanzania's go-to wedding & events marketplace.

Produces up to three outputs depending on what the user asks:

| Trigger | Output |
|---|---|
| "what's new", "App Store changelog", "release notes" | **App Store copy** (What's New + Promotional Text) |
| "what to test", "TestFlight checklist", "QA" | **TestFlight checklist** |
| Either of the above | **Admin Team brief** (always included, scoped to relevant roles) |

---

## Inputs

Accept optional arguments `from-version to-version` (e.g. `/app-store-changelog 1.2.0 1.3.0`).

- Both supplied → use as git range.
- One supplied → treat as `to-version`, auto-detect `from-version`.
- Neither → auto-detect both from git log and `apps/of_mobile/app.json`.

---

## Step 1 — Resolve the version range

```bash
# Current version
cat apps/of_mobile/app.json | grep '"version"'

# Find the previous version-bump commit
git log --oneline --grep="bump\|version" -i | head -10

# All commits in range
git log --oneline <from-commit>..<to-commit>
```

---

## Step 2 — Classify commits

| Prefix | Classification |
|---|---|
| `feat:` | User-facing feature — include in all outputs |
| `fix:` | Bug fix — include if user-visible |
| `polish:` / `move:` / `ui:` | Include if layout or interaction changed |
| `refactor:` | Include only if it changed visible behaviour |
| `chore:` / `docs:` | Exclude |
| `Merge pull request` | Skip — underlying commits carry the signal |

For each included commit, identify:
- **Surface** — which app and screen (mobile consumer, vendors portal, admin, studio portal, OpusPass)
- **Audience** — who it affects: guests, vendors, admin team, finance, designers

Group commits into themes: **New Features**, **Design & UI**, **Vendor & Studio Tools**, **Payments & Finance**, **Performance & Fixes**.

---

## Output A — App Store "What's New" (mobile consumer app only)

Only include changes visible to end users in the consumer mobile app (`apps/of_mobile`).

- Plain prose, no markdown, no bullet symbols — App Store renders plain text literally.
- Lead with the most impactful change.
- One short paragraph per theme (2–4 sentences max).
- Close with "Bug fixes and stability improvements." if there are fix-only commits.
- Target 300–600 characters. Hard limit: **4000 characters**.
- Refer to the app as **OpusFesta**, never "opusfesta-mobile" or the bundle ID.
- Do not mention vendors portal, admin panel, or internal tooling.

Then draft the **Promotional Text** field (appears above the description, updatable without resubmission):
- Hard limit: **170 characters**, plain text, no line breaks.
- One punchy sentence leading with the most exciting consumer-facing change.

---

## Output B — TestFlight "What to Test"

For each included commit, produce:

1. **Happy path** — primary use case working end-to-end
2. **Edge cases** — at least one (empty state, offline, permissions denied, long input)
3. **Regression watchpoints** — adjacent flows that share code

**Format rules** — plain text only, no markdown, no bullets, no dashes, no checkboxes:
- One-line build summary at the top (version range, date, number of changed areas)
- Blank line, then each feature section
- Section title in ALL CAPS on its own line
- Each check as a plain sentence on its own line, no indentation prefix
- Blank line between sections
- Platform/device coverage at the bottom under `DEVICES TO COVER`
- Open items at the very bottom under `CONFIRM BEFORE SENDING`

**Platform matrix** — list relevant devices based on what changed:
- iOS only → changes touch `*.ios.tsx`, widgets, SF Symbols, or `expo-av`
- Android only → changes touch `*.android.tsx` or Material Icons
- Both → shared components
- Web → changes touch `apps/opus_website` or web-specific files

Hard limit: **4000 characters**. If many features, group related ones rather than listing every check.

Write checks as tester instructions, not developer descriptions. Name screens as a tester would find them: "the Explore tab", "the booking confirmation screen", "the vendor profile page".

Never mention internal library names (Supabase, Clerk, Stripe, AsyncStorage, expo-av).

---

## Output C — Admin Team Release Brief

Always produce this alongside whichever output(s) the user requested. Only include sections for roles actually touched by the changes.

**Role routing:**

| Change type | Tell |
|---|---|
| New screens / UI / design tokens | Designers |
| Payments, payouts, invoices, commissions | Finance |
| Vendor onboarding / tools / categories | Vendor Ops |
| Booking flow / studio availability | Studio & Ops |
| Admin panel / user management | Admin Team |
| Push notifications / emails / SMS | Marketing |

**Format — conversational, one message per role, under 500 characters:**

Write each section as if you're sending a quick team message. Friendly, plain language, no jargon. Two parts: what changed (1–2 sentences) and what they need to do or look out for (1 sentence).

Example:
> **Finance** — We've updated how vendor payouts are calculated when a booking is partially cancelled. Commissions now reflect the adjusted amount automatically. Worth double-checking any payouts processed this week look right.

No headers, no bullet points, no tables in the output — just the role name bolded, then the message.

---

## Key conventions

- App names: **OpusFesta** (consumer mobile), **Vendors Portal**, **Admin**, **Studio Portal**, **OpusPass**
- Never mention internal library names (Supabase, Clerk, Stripe, Expo, AsyncStorage, React Native).
- Do not invent features — only surface what is confirmed in the commit range.
- Flag anything uncertain with `[CONFIRM BEFORE SENDING]`.
- The app serves the Tanzanian market — monetary references use **TZS** unless a commit explicitly introduces another currency.

---

## Additional Resources

- `apps/of_mobile/app.json` — current mobile version
- `supabase/` — schema changes (useful context for finance/admin briefs)
- `apps/opus_admin/` — admin panel changes
- `apps/vendors_portal/` — vendor-facing changes
- `apps/studio/` — studio portal changes
