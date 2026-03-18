# CodeRabbit Configuration

Create this file at `.coderabbitai.yaml` in the repository root:

```yaml
# CodeRabbit Configuration for OpusFesta
# Docs: https://docs.coderabbit.ai/guides/configuration

language: en

reviews:
  # Enable automatic reviews on all PRs
  auto_review:
    enabled: true
    # Review when PRs are opened and updated
    drafts: false
    # Ignore these paths (generated/config files)
    ignore:
      - "**/*.lock"
      - "**/package-lock.json"
      - "**/.next/**"
      - "**/node_modules/**"
      - "supabase/migrations/**"
      - "**/*.generated.*"

  # Review profile - assertive catches more issues
  profile: assertive

  # Request changes on blocking issues (enforces quality gate)
  request_changes_workflow: true

  # High-level summary at the top of the review
  high_level_summary: true
  high_level_summary_placeholder: "@coderabbitai summary"

  # Show the review status as a comment
  review_status: true

  # Path-based review instructions
  path_instructions:
    - path: "apps/website/**"
      instructions: "This is the main customer-facing Next.js 15 app. Pay attention to SEO, performance, accessibility, and SSR/SSG patterns."
    - path: "apps/admin/**"
      instructions: "Admin dashboard. Focus on authorization checks, data validation, and secure API routes."
    - path: "apps/vendor-portal/**"
      instructions: "Vendor-facing app. Ensure proper auth, data isolation between vendors, and input validation."
    - path: "packages/db/**"
      instructions: "Shared database package with Prisma. Check for migration safety, proper relations, and index usage."
    - path: "packages/auth/**"
      instructions: "Shared auth package using Clerk + Supabase. Security is critical — check for auth bypasses."
    - path: "packages/lib/**"
      instructions: "Shared utilities and types. Ensure backwards compatibility and proper Zod schema validation."
    - path: "**/*.ts"
      instructions: "TypeScript strict mode is enabled. No `any` types. Use proper error handling."
    - path: "**/api/**"
      instructions: "API routes must validate inputs with Zod, handle errors consistently, and check auth."

chat:
  # Enable interactive chat with CodeRabbit on PRs
  auto_reply: true

# Tools CodeRabbit should use
tools:
  eslint:
    enabled: true
  biome:
    enabled: false
  # GitHub checks integration
  github-checks:
    enabled: true
    timeout_ms: 120000
```

## Setup Steps

1. **Install CodeRabbit GitHub App:**
   - Go to [coderabbit.ai](https://coderabbit.ai) and sign in with GitHub
   - Install the app on the `borismassesa/opusfesta` repository
   - Grant access to PRs and code

2. **Add the config file:**
   ```bash
   # From repo root
   cp <skill-generated-config> .coderabbitai.yaml
   git add .coderabbitai.yaml
   git commit -m "chore: add CodeRabbit configuration"
   git push
   ```

3. **Remove other review bots:**
   - Go to GitHub → Settings → Integrations → Applications
   - Remove/disable Cursor bot or any other AI review apps
   - Check `.github/workflows/` for any review bot workflows and delete them

4. **Verify:** Open a test PR and confirm CodeRabbit posts a review within a few minutes.

## How CodeRabbit Integrates with the Pipeline

- CodeRabbit reviews every PR automatically
- With `request_changes_workflow: true`, it will "Request Changes" on PRs with blocking issues
- This integrates with branch protection: if CodeRabbit requests changes, the PR cannot be merged
- Authors can resolve issues and request re-review, or dismiss the review if it's a false positive
- The review appears as a detailed comment with inline code suggestions
