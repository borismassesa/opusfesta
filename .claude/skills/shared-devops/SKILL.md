---
name: shared-devops
description: "DevOps, CI/CD, testing, security hardening, monitoring, performance, deployment — production readiness."
---

# Shared DevOps

## Deployment Stack

| Service | Purpose |
|---------|---------|
| Vercel | Next.js app hosting (studio, website, admin, vendor-portal) |
| Supabase | Postgres database, storage, auth, edge functions |
| GitHub Actions | CI/CD pipelines |
| Clerk | Authentication |

## Environments

| Environment | Branch | Supabase Project | Vercel |
|-------------|--------|-------------------|--------|
| Development | feature branches | dev project | Preview deploys |
| Staging | `staging` | staging project | Preview URL |
| Production | `main` | prod project | Production URL |

## GitHub Actions CI Pipeline

```yaml
# Key stages in order:
# 1. Lint & typecheck
# 2. Unit tests
# 3. Build all apps
# 4. Security scan (npm audit, license check)
# 5. Deploy (Vercel auto-deploy on push)
```

### Monorepo Build

- Each app builds independently: `turbo run build --filter=studio`
- Shared packages are built first as dependencies
- Cache turbo build artifacts between CI runs

## Supabase Migrations in CI

```bash
# Apply migrations to staging/prod via CLI
supabase db push --db-url $SUPABASE_DB_URL

# Always test migrations on staging before production
# Never run destructive migrations (DROP TABLE, DROP COLUMN) without backup
```

## Security Hardening

- **CSP headers** configured in `next.config.js`
- **Rate limiting** on API routes (especially auth and payment endpoints)
- **Input sanitization** — never trust client input, validate server-side
- **Secrets** — environment variables only, never committed to repo
- **Dependencies** — `npm audit` in CI, keep dependencies updated
- **OWASP Top 10** awareness: XSS prevention (React handles), CSRF (SameSite cookies), injection (parameterized queries via Supabase)

## Monitoring & Alerting

- Vercel Analytics for Core Web Vitals
- Supabase Dashboard for database performance
- Error tracking: capture and log API errors with context
- Uptime monitoring on critical paths (`/`, `/portal`, `/api/health`)

## Zero-Downtime Deployment

- Vercel handles rolling deployments automatically
- Database migrations must be backward-compatible (add columns nullable, never rename in-place)
- Feature flags for gradual rollout of new features

## Testing Strategy

| Type | Tool | Scope |
|------|------|-------|
| Unit | Vitest | Utility functions, hooks |
| Integration | Vitest + MSW | API routes, data flows |
| E2E | Playwright | Critical user journeys (booking, payment) |
| Visual | Playwright screenshots | Brutalist design regression |
