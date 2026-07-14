---
name: git-commit
description: "Create a git commit for changes inside a mobile app (apps/of_mobile or apps/opus_pass_mobile), following the mobile commit conventions (type(scope) subjects, version bump rules, pre-commit gate). Use when the user says 'commit', 'commit changes', 'save my changes', or 'commit all' AND the changed files are under one of those apps. Do not use for commits that touch other apps or packages — those need their own area's convention."
---

# Git Commit Convention (Mobile)

This skill covers the **mobile apps** in this monorepo:

| App | Path | Commit scope |
|-----|------|-------------|
| OpusFesta | `apps/of_mobile` | `of_mobile` (or a feature area) |
| OpusPass | `apps/opus_pass_mobile` | `opus_pass_mobile` (or a feature area) |

Commands below assume you are in the app's directory.

## When to Use

- The user asks to commit, save, or check in changes, and the staged/unstaged diff is entirely
  inside **one** of the mobile apps.

## When NOT to Use

- The diff touches files outside the mobile apps (`packages/*`, `supabase/*`, repo-root config).
  Stop and ask how to split the commit, or defer to that area's own convention, instead of
  applying mobile-only rules (like the `app.json` version bump) to unrelated changes.
- The diff spans **both** mobile apps. They version independently — split it into one commit per
  app rather than bumping both together.

## Atomic Commit Rules

- Each commit represents ONE logical change (one fix, one feature, one refactor)
- If changes span multiple concerns, split into separate commits
- A commit should never break the build — every commit is deployable

## Message Format

```
type(scope): lowercase description
```

Scope is optional. Use a feature area (`onboarding`, `vendors`, `booking`, `website`, `auth`, …)
when the change is isolated to one. When a change is cross-cutting **within** an app, or when the
log would otherwise be ambiguous about which app changed, use the app name as the scope
(`chore(opus_pass_mobile): …`).

## Types

| Type | Use | Example |
|------|-----|---------|
| `feat` | New feature or capability | `feat(vendors): add vendor profile gallery` |
| `fix` | Bug fix | `fix(booking): correct TZS formatting on payout screen` |
| `polish` | UI/UX improvements, styling | `polish(onboarding): tighten step layout` |
| `move` | File moves, restructuring | `move: relocate booking components to src/components/vendors` |
| `chore` | Dependencies, config, tooling | `chore: upgrade expo sdk to 52` |
| `refactor` | Code restructuring, no behavior change | `refactor(booking): extract status logic to hook` |
| `docs` | Documentation updates | `docs: document onboarding flow` |
| `test` | Adding or updating tests | `test: add tests for booking flow` |
| `perf` | Performance improvements | `perf: lazy-load vendor gallery images` |

## Rules

- Imperative mood ("add feature" not "added feature")
- Subject line under 72 characters
- All lowercase description
- No period at end
- Stage specific files by name — never `git add -A` or `git add .`. This applies even when the
  user says "commit all": stage every changed file individually by name, never with a wildcard flag.

## Attribution

**Never add a Claude attribution or `Co-Authored-By` footer to commit messages.** No
`🤖 Generated with Claude Code`, no `Co-Authored-By: Claude`. Commit messages contain only the
conventional-commit content.

## Commit Command (HEREDOC format)

Use a HEREDOC so the message is passed literally (needed for multi-line bodies):

```bash
git commit -m "$(cat <<'EOF'
feat(vendors): add vendor profile gallery

- render up to 12 photos in a swipeable carousel
- fall back to placeholder when a vendor has no media
EOF
)"
```

Body bullets follow the same convention as the subject line: lowercase, no trailing period.

## Pre-commit Gate (fast — before every commit)

From the app directory, run the fast checks. These are seconds, not minutes — they are the actual
gate, not a full production build:

```bash
npm run type-check && npm run lint
```

If a check fails: fix it, re-run until it passes, then continue. A full production build
(`expo export`) is only needed before a release or deploy, not on every commit.

## Version Bump (only when it ships to users)

Bump `expo.version` in that app's `app.json` **only for `feat` and `fix` commits that change
user-facing behavior.** Do **not** bump for `chore`, `refactor`, `docs`, `test`, `move`, or
`polish`-only commits. Each app versions independently — bump only the app you touched.

When a bump is warranted, inspect the diff and choose the level — do not default to patch:

- **major** — breaking changes, auth model changes, removed user-facing features
- **minor** — new user-facing features, new screens, additive integrations
- **patch** — user-facing bug fixes

State your decision before bumping:
`Version bump decision: <none|major|minor|patch> — <reason>`

Read the current `expo.version` from `app.json` first, then compute the next value as standard
semver:

- **major** — `X.Y.Z` → `(X+1).0.0`
- **minor** — `X.Y.Z` → `X.(Y+1).0`
- **patch** — `X.Y.Z` → `X.Y.(Z+1)`

```bash
# From the app directory — replace NEW_VERSION with the computed value
node -e "const fs=require('fs');const p='app.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.expo.version='NEW_VERSION';fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');"
```

**This is the only place `expo.version` is bumped.** `testflight-local` deliberately does not
touch it — it owns the build number and nothing else. So if a user-facing change lands without a
bump here, it ships under the old version number. Don't skip the bump on a `feat`/`fix`.

## Safety Rules

- Never amend commits unless explicitly asked
- Never skip hooks (`--no-verify` is forbidden)
- Never force push
- If the pre-commit gate or any configured git hook fails: read the error, fix it, re-stage with
  `git add <file>`, then create a NEW commit (never `--amend`)
- When in doubt, `git status` and `git diff --staged` before committing

## Process

1. `git status` — see what changed
2. `git diff` — review changes
3. Run the fast pre-commit gate (`npm run type-check && npm run lint`)
4. Decide bump level (state rationale); bump only if it ships to users
5. Stage files individually by name
6. `git diff --staged` — verify staged changes
7. Commit using HEREDOC format (no attribution footer)
8. `git status` — confirm clean
