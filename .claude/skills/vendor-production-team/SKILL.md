---
name: vendor-production-team
description: "Vendor Production Team — agent skills and collaboration."
---

# Vendor Production Team

## Purpose

Coordinates agent skills for vendor-related production tasks and cross-functional collaboration.

## Team Collaboration Patterns

### Multi-skill Workflows

When vendor tasks span multiple concerns, coordinate skills in this order:

1. **vendor-management** — data model and database operations
2. **vendor-ops** — portal UI and vendor-facing features
3. **shared-data-api** — API route implementation
4. **shared-frontend** — UI components with brutalist design
5. **shared-supabase** — migrations and RLS policies

### Common Cross-cutting Tasks

| Task | Skills Involved |
|------|----------------|
| Add new vendor field | vendor-management + shared-supabase (migration) + vendor-ops (UI) |
| New service category | vendor-management (data) + website-architect (discovery page) |
| Vendor payout feature | vendor-ops (portal) + shared-payments (M-Pesa/Airtel) |
| Vendor search improvement | vendor-management (query) + shared-data-api (API) + shared-frontend (UI) |

### Quality Checklist

- [ ] Database migration created and tested
- [ ] RLS policies updated for new tables/columns
- [ ] API routes validate input and handle errors
- [ ] UI follows brutalist design system
- [ ] Mobile responsive (test at 375px width)
- [ ] TZS currency formatting correct
- [ ] Admin moderation UI updated if vendor-facing change
