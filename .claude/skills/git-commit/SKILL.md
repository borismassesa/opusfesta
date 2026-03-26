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
type: lowercase description
```

## Types

| Type | Use | Example |
|------|-----|---------|
| `feat` | New feature or capability | `feat: add booking deposit payment form` |
| `fix` | Bug fix | `fix: correct TZS formatting on invoice` |
| `polish` | UI/UX improvements, styling | `polish: align portal sidebar with brutalist grid` |
| `move` | File moves, restructuring | `move: relocate vendor components to shared package` |
| `chore` | Dependencies, config, tooling | `chore: upgrade next.js to 15.1` |
| `refactor` | Code restructuring, no behavior change | `refactor: extract booking status logic to hook` |
| `docs` | Documentation updates | `docs: add API route documentation for payments` |
| `test` | Adding or updating tests | `test: add playwright tests for booking flow` |
| `perf` | Performance improvements | `perf: lazy-load vendor gallery images` |

## Rules

- Imperative mood ("add feature" not "added feature")
- Under 72 characters
- All lowercase description
- No period at end
- Stage specific files by name — never `git add -A` or `git add .`

## Commit Command (HEREDOC format)

```bash
git commit -m "$(cat <<'EOF'
feat: add booking deposit payment form

EOF
)"
```


## Pre-commit Hook Handling

1. If a hook fails, read the error output carefully
2. Fix the issue (lint, format, type error)
3. Re-stage the fixed files with `git add <file>`
4. Create a NEW commit — never `--amend` (amend would modify the previous commit since the failed commit never happened)

## Safety Rules

- Never amend commits unless explicitly asked
- Never skip hooks (`--no-verify` is forbidden)
- Never force push
- When in doubt, `git status` and `git diff --staged` before committing

## Process

1. Run `git status` to see what changed
2. Run `git diff` to review changes
3. Stage relevant files individually: `git add apps/studio/...`
4. Verify staged changes: `git diff --staged`
5. Commit using HEREDOC format with Co-Authored-By footer
6. Confirm success with `git status`
