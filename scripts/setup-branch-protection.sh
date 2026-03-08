#!/bin/bash
# Setup branch protection rules for the main branch
# Run this once after setting up the CI workflow
# Requires: gh CLI authenticated with admin access

set -e

REPO="borismassesa/opusfesta"
BRANCH="main"

echo "Setting up branch protection for $REPO/$BRANCH..."

# Configure branch protection
gh api "repos/$REPO/branches/$BRANCH/protection" \
  --method PUT \
  --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Lint", "Type Check", "Build"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF

echo "Branch protection configured."

# Configure repo settings for squash merge only
echo "Configuring merge settings (squash only)..."
gh api "repos/$REPO" \
  --method PATCH \
  --field allow_merge_commit=false \
  --field allow_squash_merge=true \
  --field allow_rebase_merge=false \
  --field delete_branch_on_merge=true \
  --field squash_merge_commit_title="PR_TITLE" \
  --field squash_merge_commit_message="PR_BODY"

echo "Repo settings configured."
echo ""
echo "Summary:"
echo "  - Branch protection on 'main': enabled"
echo "  - Required status checks: Lint, Type Check, Build"
echo "  - Required approvals: 1"
echo "  - Stale review dismissal: enabled"
echo "  - Force pushes: blocked"
echo "  - Merge strategy: squash only"
echo "  - Auto-delete branches: enabled"
echo ""
echo "Next steps:"
echo "  1. Install CodeRabbit at https://coderabbit.ai (if not already installed)"
echo "  2. Add GitHub secrets for CI build (see references/ci-workflow.md)"
echo "  3. Remove Cursor bot and other review bots from GitHub Settings > Integrations"
