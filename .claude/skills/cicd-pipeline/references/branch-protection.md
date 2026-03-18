# Branch Protection Setup for `main`

Branch protection ensures no one can push directly to `main` and all code goes through the PR review process.

## Configure via GitHub CLI

Run this command to set up branch protection on `main`:

```bash
gh api repos/borismassesa/opusfesta/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["CI / Lint","CI / Type Check","CI / Build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

## Configure via GitHub UI (Alternative)

1. Go to **GitHub → Repository → Settings → Branches**
2. Click **Add branch protection rule**
3. Branch name pattern: `main`

### Enable these settings:

| Setting | Value |
|---------|-------|
| **Require a pull request before merging** | Yes |
| Required approvals | 1 |
| Dismiss stale PR approvals on new pushes | Yes |
| **Require status checks to pass** | Yes |
| Require branches to be up to date | Yes |
| Status checks: `CI / Lint` | Required |
| Status checks: `CI / Type Check` | Required |
| Status checks: `CI / Build` | Required |
| **Do not allow bypassing the above settings** | Yes |
| **Allow force pushes** | No |
| **Allow deletions** | No |

4. Click **Create** / **Save changes**

## Additional Repository Settings

### Auto-delete head branches
Go to **Settings → General → Pull Requests**:
- Check **Automatically delete head branches**
- Under "Allow merge commits", "Allow squash merging", "Allow rebase merging":
  - Uncheck **Allow merge commits**
  - Check **Allow squash merging** (set default commit message to "PR title")
  - Uncheck **Allow rebase merging**

This enforces squash merge as the only merge strategy.

## What This Protects Against

- Direct pushes to `main` (all changes must go through PRs)
- Merging without CI passing (lint, type-check, build must all succeed)
- Merging without review (at least 1 approval from `borismassesa`)
- Stale approvals (if new commits are pushed after approval, re-review is required)
- Force-pushing to `main` (prevents history rewriting)
- Branch deletion of `main`

## Verifying Protection is Active

```bash
# Check current protection rules
gh api repos/borismassesa/opusfesta/branches/main/protection

# Try pushing directly to main (should fail)
git push origin main  # Should be rejected
```
