---
name: cicd-pipeline
description: "CI/CD pipeline management for OpusFesta — creating branches from Jira tickets, committing, pushing, creating PRs with templates, CodeRabbit AI review, senior engineer approval, squash merging to main, GitHub Actions CI, branch protection, and branch cleanup. Use this skill whenever the user mentions branches, PRs, pull requests, merges, CI/CD, pipelines, deployments, Jira tickets, code review setup, branch protection, CodeRabbit, or any git workflow operations. Also trigger when the user wants to start working on a new ticket, ship a feature, or get code merged."
---

# CI/CD Pipeline Agent — OpusFesta

You manage the **full CI/CD lifecycle** for the OpusFesta monorepo. From creating a branch off a Jira ticket to merging into `main` and deploying — you own the entire flow.

## Repository Context

- **Repo:** `borismassesa/opusfesta` (GitHub)
- **Monorepo:** Turborepo with apps (`website`, `admin`, `vendor-portal`, `customersupport`, `studio`) and packages (`auth`, `db`, `lib`, `ui`)
- **Main branch:** `main` (protected)
- **Jira project key:** `OF-TD`
- **Senior engineer (approver):** `borismassesa`
- **AI reviewer:** CodeRabbit (sole review bot — no Cursor bot or others)
- **Merge strategy:** Squash merge only
- **Hosting:** Vercel (auto-deploys on merge to `main`)

---

## The Full Lifecycle

```
1. Create Branch  →  2. Code & Commit  →  3. Push  →  4. Create PR
       ↓                                                    ↓
5. CI Checks (GitHub Actions)  →  6. CodeRabbit Review  →  7. Senior Approval
       ↓
8. Squash Merge to main  →  9. Auto-deploy (Vercel)  →  10. Branch Cleanup
```

---

## 1. Branch Creation

When the user wants to start work on a Jira ticket, create a branch using this convention:

### Branch Naming Format
```
<type>/OF-TD-<JIRA-NUMBER>-<short-description>
```

### Branch Types
| Type       | When to use                              |
|------------|------------------------------------------|
| `feature/` | New functionality                        |
| `fix/`     | Bug fixes                                |
| `hotfix/`  | Urgent production fixes                  |
| `chore/`   | Maintenance, dependencies, config        |
| `refactor/`| Code restructuring, no behavior change   |
| `docs/`    | Documentation only                       |

### Steps
1. Ask the user for: **Jira ticket number**, **branch type**, and a **short description** (2-4 words, kebab-case)
2. Fetch latest `main`: `git fetch origin main`
3. Create and checkout: `git checkout -b <type>/OF-TD-<NUMBER>-<description> origin/main`
4. Push the branch: `git push -u origin <branch-name>`

### Examples
```
feature/OF-TD-142-vendor-onboarding
fix/OF-TD-215-login-redirect-loop
hotfix/OF-TD-300-payment-webhook-crash
chore/OF-TD-88-update-dependencies
refactor/OF-TD-190-auth-middleware
docs/OF-TD-55-api-documentation
```

---

## 2. Commit Messages

Reference the Jira ticket in every commit so it links automatically:

### Format
```
OF-TD-<NUMBER>: <concise description of what changed>
```

### Guidelines
- Start with the ticket reference
- Use imperative mood ("add", "fix", "update" — not "added", "fixed")
- Keep the first line under 72 characters
- Add a blank line + body for complex changes

### Examples
```
OF-TD-142: add vendor onboarding form with Zod validation
OF-TD-215: fix redirect loop on login page when session expired
OF-TD-300: handle null webhook payload from Stripe
```

### Multi-line Example
```
OF-TD-142: add vendor onboarding multi-step form

- Step 1: Business details with Zod validation
- Step 2: Service categories with multi-select
- Step 3: Portfolio upload with drag-and-drop
- Integrated with Supabase storage for images
```

---

## 3. Push

Always push with tracking:
```bash
git push -u origin <branch-name>
```

If the branch already tracks remote, a simple `git push` suffices.

---

## 4. PR Creation

Create PRs using `gh pr create` with the OpusFesta PR template.

### PR Title Format
```
OF-TD-<NUMBER>: <Short summary>
```

### PR Body Template
Use this template (it extends the project's `.github/pull_request_template.md`):

```markdown
## Jira Ticket
[OF-TD-<NUMBER>](https://opusfesta.atlassian.net/browse/OF-TD-<NUMBER>)

## Summary
<!-- 2-3 bullet points describing what this PR does -->

## Type of Change
- [ ] feature — New functionality
- [ ] fix — Bug fix (non-breaking)
- [ ] hotfix — Urgent production fix
- [ ] chore — Maintenance, deps, config
- [ ] refactor — Code restructuring
- [ ] docs — Documentation only

## Affected Areas
<!-- Which apps/packages are touched? e.g. apps/website, packages/db -->

## How to Test
<!-- Step-by-step instructions for reviewers -->
1.
2.
3.

## Screenshots (if UI changes)
<!-- Paste screenshots or screen recordings here -->

## Checklist
- [ ] Code follows project conventions
- [ ] Self-reviewed the diff
- [ ] Ran `npm run check:prepush` locally
- [ ] No unnecessary console.log or debug code
- [ ] Commit messages reference Jira ticket (OF-TD-<NUMBER>)
```

### Reviewer Selection
Prompt the user to select reviewers. List available team members and let them pick:
```bash
gh pr create --title "OF-TD-<NUM>: <summary>" --body "<template>" --base main --reviewer <selected-reviewers>
```

### PR Labels
Apply labels based on the change type:
- `feature`, `bug-fix`, `hotfix`, `chore`, `refactor`, `docs`

---

## 5. CI Pipeline (GitHub Actions)

The CI workflow lives at `.github/workflows/ci.yml` and runs on every PR to `main`.

### What It Checks
1. **Install** — `npm ci` with dependency caching
2. **Lint** — `turbo run lint` (ESLint across all workspaces)
3. **Type-check** — `turbo run type-check` (TypeScript strict mode)
4. **Build** — `turbo run build` (verifies all apps compile)

### Setting Up the Workflow
If `.github/workflows/ci.yml` doesn't exist, create it. See `references/ci-workflow.md` for the full workflow file.

### Required Status Checks
These checks must pass before merge:
- `ci / lint`
- `ci / type-check`
- `ci / build`

---

## 6. CodeRabbit AI Review

CodeRabbit is the sole AI code reviewer. No other review bots (Cursor, etc.) should be active.

### Setup
If `.coderabbitai.yaml` doesn't exist at the repo root, create it. See `references/coderabbit-config.md` for the configuration.

### Review Flow
- CodeRabbit automatically reviews every PR
- Its review must pass (no blocking issues) before merge is allowed
- The review appears as a PR comment with actionable feedback

### Removing Other Review Bots
Check for and remove/disable:
- `.cursor/` review configurations
- Any other `.github/workflows/` that run AI review bots
- GitHub App installations for competing review bots (user must do this in GitHub Settings → Integrations)

---

## 7. Senior Engineer Approval

### Rules
- **1 approval** required from `borismassesa`
- No self-approval (if the PR author is `borismassesa`, another team member must approve)
- Approval must come AFTER CI passes and CodeRabbit review completes

### Branch Protection Enforcement
This is enforced via GitHub branch protection rules on `main`. See `references/branch-protection.md` for setup instructions.

---

## 8. Squash Merge

All PRs to `main` use **squash merge**. This keeps the main branch history clean — one commit per feature/fix.

### How to Merge
```bash
gh pr merge <PR-NUMBER> --squash --delete-branch
```

### The squash commit message should follow:
```
OF-TD-<NUMBER>: <PR title> (#<PR-NUMBER>)
```

---

## 9. Auto-Deploy

Vercel auto-deploys on merge to `main`:
- Each app (`website`, `admin`, `vendor-portal`, `customersupport`, `studio`) has its own Vercel project
- Preview deployments are created for each PR
- Production deployments happen on merge to `main`

No manual deployment steps needed — Vercel handles it via GitHub integration.

---

## 10. Branch Cleanup

After merge, clean up:

### Automatic
- `--delete-branch` flag on `gh pr merge` handles remote deletion
- GitHub branch protection setting "Auto-delete head branches" handles it server-side

### Manual Cleanup (periodic)
```bash
# Prune remote-tracking branches that no longer exist
git fetch --prune

# Delete local branches whose remote is gone
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs -r git branch -D

# Clean up stale worktrees
git worktree prune
```

---

## Quick Reference Commands

### Start a new ticket
```bash
git fetch origin main
git checkout -b feature/OF-TD-<NUM>-<desc> origin/main
git push -u origin feature/OF-TD-<NUM>-<desc>
```

### Commit and push
```bash
git add <files>
git commit -m "OF-TD-<NUM>: <message>"
git push
```

### Create PR
```bash
gh pr create --title "OF-TD-<NUM>: <summary>" --base main --reviewer borismassesa
```

### Merge (after approval + CI)
```bash
gh pr merge <PR-NUM> --squash --delete-branch
```

### Cleanup
```bash
git fetch --prune
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs -r git branch -D
git worktree prune
```

---

## Setup Checklist

When setting up CI/CD for the first time (or verifying setup), ensure all these are in place:

- [ ] `.github/workflows/ci.yml` exists → see `references/ci-workflow.md`
- [ ] `.coderabbitai.yaml` exists → see `references/coderabbit-config.md`
- [ ] `.github/pull_request_template.md` updated → see PR template in section 4
- [ ] Branch protection on `main` configured → see `references/branch-protection.md`
- [ ] CodeRabbit GitHub App installed on the repo
- [ ] Cursor bot and other review bots removed
- [ ] Vercel GitHub integration connected for auto-deploy
