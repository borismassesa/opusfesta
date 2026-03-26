---
name: git-branch
description: "Create a new git branch following OpusFesta naming conventions. Use when starting new work, creating a feature branch, or when the user says 'new branch', 'create branch', or 'start working on'."
---

# Git Branch Creation

## Branch Naming Format

```
OF-{MODULE}-{NUMBER}
```

Numbers are zero-padded to 4 digits: `OF-MPS-0001`

## Module Codes

| Code | Domain | App Directory |
|------|--------|---------------|
| `MPS` | Marketplace / Studio CMS | `apps/studio` |
| `ADM` | Admin dashboard | `apps/admin` |
| `WEB` | Website / public pages | `apps/website` |
| `VND` | Vendor portal & management | `apps/vendor-portal` |
| `PAY` | Payments & billing | `packages/payments`, cross-app |
| `INF` | Infrastructure / DevOps | Root config, CI, deployment |
| `TD` | Technical debt / refactoring | Any — cross-cutting |

## Auto-detect Next Number

```bash
# Find highest existing number for module
git branch -a | grep -oP 'OF-MPS-\K\d+' | sort -n | tail -1
# Increment by 1, zero-pad to 4 digits
```

If no branches exist for the module, start at `0001`.

## Create-from-main Workflow

```bash
# 1. Switch to main and pull latest
git checkout main && git pull origin main

# 2. Create the new branch
git checkout -b OF-MPS-0004

# 3. Confirm
git branch --show-current
```

## Rules

- Always branch from up-to-date `main`
- One branch per logical unit of work
- Never reuse branch names — always increment
- Infer module code from the task description (booking work = MPS, admin panel = ADM, etc.)

## Worktree Support (Optional)

For parallel work on multiple branches without stashing:

```bash
# Create a worktree for a new branch
git worktree add ../opusfesta-OF-VND-0002 OF-VND-0002

# List active worktrees
git worktree list

# Clean up when done
git worktree remove ../opusfesta-OF-VND-0002
```

Use worktrees when you need to work on two branches simultaneously (e.g., hotfix while feature is in progress).
