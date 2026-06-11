---
name: git-commit
description: "Create a git commit following OpusFesta conventions. Use when the user says 'commit', 'commit changes', 'save my changes', or 'commit all'."
---

# Git Commit Convention

## Atomic Commit Rules

- Each commit represents ONE logical change (one fix, one feature, one refactor)
- If changes span multiple concerns, split into separate commits
- A commit should never break the build — every commit is deployable

## Message Format

```
type(scope): lowercase description
```

Scope is optional but recommended when the change is isolated to one app.

## Types

| Type | Use | Example |
|------|-----|---------|
| `feat` | New feature or capability | `feat(mobile): add vendor profile gallery` |
| `fix` | Bug fix | `fix(vendors): correct TZS formatting on payout screen` |
| `polish` | UI/UX improvements, styling | `polish(admin): tighten category management layout` |
| `move` | File moves, restructuring | `move: relocate booking components to shared package` |
| `chore` | Dependencies, config, tooling | `chore: upgrade expo sdk to 52` |
| `refactor` | Code restructuring, no behavior change | `refactor(mobile): extract booking status logic to hook` |
| `docs` | Documentation updates | `docs: add API route docs for vendor onboarding` |
| `test` | Adding or updating tests | `test: add playwright tests for booking flow` |
| `perf` | Performance improvements | `perf(mobile): lazy-load vendor gallery images` |

## Scopes

| Scope | App/package |
|---|---|
| `mobile` | apps/mobile |
| `admin` | apps/opus_admin |
| `vendors` | apps/vendors_portal |
| `studio` | apps/studio |
| `pass` | apps/opus_pass |
| `website` | apps/opus_website |
| `shared` | packages/* |
| `supabase` | supabase/* |

## Rules

- Imperative mood ("add feature" not "added feature")
- Under 72 characters total
- All lowercase description
- No period at end
- Stage specific files by name — never `git add -A` or `git add .`

## Commit Command (HEREDOC format)

```bash
git commit -m "$(cat <<'EOF'
feat(mobile): add vendor profile gallery

EOF
)"
```

## Pre-commit Hook Handling

1. If a hook fails, read the error output carefully
2. Fix the issue (lint, format, type error)
3. Re-stage the fixed files with `git add <file>`
4. Create a NEW commit — never `--amend`

## Safety Rules

- Never amend commits unless explicitly asked
- Never skip hooks (`--no-verify` is forbidden)
- Never force push
- When in doubt, `git status` and `git diff --staged` before committing

## Required Version Bump (Before Every Commit)

Bump the version in `apps/mobile/app.json` (`expo.version`) for any mobile change. For other apps, bump their `package.json` version. Use one shared version across all apps touched by the commit.

Do not assume patch by default — inspect `git diff` and choose `major`, `minor`, or `patch`:

- **major** — breaking API/schema changes, auth model changes, removed user-facing features
- **minor** — new user-facing features, new screens, additive integrations
- **patch** — bug fixes, polish, refactors, config/tooling updates, docs

Tie-breaker: when uncertain, choose the higher level. State your decision before bumping:
`Version bump decision: <major|minor|patch> — <reason>`

### Version bump commands (from repo root)

```bash
# Mobile
node -e "const fs=require('fs');const p='apps/mobile/app.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.expo.version='NEW_VERSION';fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');"

# Other apps (replace path as needed)
cd apps/opus_admin && npm version <major|minor|patch> --no-git-tag-version && cd ../..
```

## Required Build Gate (Before Every Commit)

Run a build for each app touched by the change:

| Changed app | Build command |
|---|---|
| `apps/mobile` | `cd apps/mobile && npx expo export --platform web` |
| `apps/opus_admin` | `cd apps/opus_admin && npm run build` |
| `apps/vendors_portal` | `cd apps/vendors_portal && npm run build` |
| `apps/studio` | `cd apps/studio && npm run build` |
| `apps/opus_website` | `cd apps/opus_website && npm run build` |
| `packages/*` | Run builds for all apps that consume the package |

If any build fails: fix it, re-run until it passes, then continue.

## Required .env.example Sync (Before Every Commit)

For each app touched, scan source for env vars and reconcile against the `.env.example`:

```bash
# Mobile — find all EXPO_PUBLIC_* vars used in source
grep -rhoE "EXPO_PUBLIC_[A-Z_]+" apps/mobile --include="*.ts" --include="*.tsx" \
  | grep -v "/dist/" | sort -u

# Web apps — find all NEXT_PUBLIC_* vars
grep -rhoE "NEXT_PUBLIC_[A-Z_]+" apps/opus_admin --include="*.ts" --include="*.tsx" \
  | sort -u
```

Add missing vars, remove unused ones. Never commit real secrets — use placeholders.

## Process

1. `git status` — see what changed
2. `git diff` — review changes
3. Decide bump level, state rationale, bump version(s)
4. Sync `.env.example` for any touched app
5. Run build command(s) for changed app(s)
6. Stage files individually by name
7. `git diff --staged` — verify staged changes
8. Commit using HEREDOC format
9. `git status` — confirm clean
