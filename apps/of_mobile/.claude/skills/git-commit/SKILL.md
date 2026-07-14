---
name: git-commit
description: "Create a git commit for changes inside apps/of_mobile, following the mobile app's commit conventions (type(scope) subjects, version bump rules, pre-commit gate). Use when the user says 'commit', 'commit changes', 'save my changes', or 'commit all' AND the changed files are under apps/of_mobile. Do not use for commits that touch other apps or packages outside apps/of_mobile — those need their own app's convention."
---

# Git Commit Convention (Mobile)

This skill is specific to the **mobile app** (`apps/of_mobile`). All commands assume you are
in the `apps/of_mobile` directory.

## When to Use

- The user asks to commit, save, or check in changes, and the staged/unstaged diff is
  entirely inside `apps/of_mobile`.

## When NOT to Use

- The diff touches files outside `apps/of_mobile` (other apps, `packages/*`, `supabase/*`,
  repo-root config). Stop and ask how to split the commit, or defer to that area's own
  convention, instead of applying mobile-only rules (like the `app.json` version bump)
  to unrelated changes.

## Atomic Commit Rules

- Each commit represents ONE logical change (one fix, one feature, one refactor)
- If changes span multiple concerns, split into separate commits
- A commit should never break the build — every commit is deployable

## Message Format

```
type(scope): lowercase description
```

Scope is optional. Use a feature area (`onboarding`, `vendors`, `booking`, `website`,
`auth`, …) when the change is isolated to one; omit it for cross-cutting changes.

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
- Stage specific files by name — never `git add -A` or `git add .`. This applies even
  when the user says "commit all": stage every changed file individually by name, never
  with a wildcard flag.

## Attribution

**Never add a Claude attribution or `Co-Authored-By` footer to commit messages.** No
`🤖 Generated with Claude Code`, no `Co-Authored-By: Claude`. Commit messages contain
only the conventional-commit content.

## Commit Command (HEREDOC format)

Use a HEREDOC so the message is passed literally (needed for multi-line bodies):

```bash
git commit -m "$(cat <<'EOF'
feat(vendors): add vendor profile gallery

EOF
)"
```

For a multi-line body, add a blank line after the subject, then bullet points:

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

From `apps/of_mobile`, run the fast checks. These are seconds, not minutes — they are the
actual gate, not a full production build:

```bash
npm run type-check && npm run lint
```

If a check fails: fix it, re-run until it passes, then continue. A full production build
(`expo export`) is only needed before a release or deploy, not on every commit.

## Version Bump (only when it ships to users)

Bump `expo.version` in `app.json` **only for `feat` and `fix` commits that
change user-facing behavior.** Do **not** bump for `chore`, `refactor`, `docs`, `test`,
`move`, or `polish`-only commits.

When a bump is warranted, inspect the diff and choose the level — do not default to patch:

- **major** — breaking changes, auth model changes, removed user-facing features
- **minor** — new user-facing features, new screens, additive integrations
- **patch** — user-facing bug fixes

State your decision before bumping:
`Version bump decision: <none|major|minor|patch> — <reason>`

Read the current `expo.version` from `app.json` first, then compute the next
value as standard semver:

- **major** — `X.Y.Z` → `(X+1).0.0`
- **minor** — `X.Y.Z` → `X.(Y+1).0`
- **patch** — `X.Y.Z` → `X.Y.(Z+1)`

```bash
# From apps/of_mobile — bump app.json → expo.version (replace NEW_VERSION with the computed value)
node -e "const fs=require('fs');const p='app.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.expo.version='NEW_VERSION';fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');"
```

## Safety Rules

- Never amend commits unless explicitly asked
- Never skip hooks (`--no-verify` is forbidden)
- Never force push
- If the pre-commit gate (`npm run type-check && npm run lint`) or any configured git
  hook fails: read the error, fix it, re-stage with `git add <file>`, then create a NEW
  commit (never `--amend`)
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
