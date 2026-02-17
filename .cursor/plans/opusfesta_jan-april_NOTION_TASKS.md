# OpusFesta Jan–April 2026 — Task List for Notion

**Team:** 2 SWEs, 1 Project Manager  
**Use:** Add these to Notion; track Status (Not started / In progress / Completed / Overdue) and assign Owner.  
**Structure:** Strategies → Goals → Tasks.

---

## 1. Strategies

High-level approach for the Jan–April roadmap.

| # | Strategy | Description |
|---|----------|-------------|
| S1 | **2-week sprint cadence** | Work in eight 2-week periods (coders 1–8) from January through April. Plan and review at sprint boundaries. |
| S2 | **No direct push to main** | All work on feature branches; merge to `main` via PR after review. Branch naming: `feature/<theme>` or `feature/<component>`. |
| S3 | **Priority order: P0 → P1 → P2** | Deliver P0 (must-have) components first, then P1 (should-have), then P2 (nice-to-have) within each period. |
| S4 | **Vendor → Customer → Platform → Quality** | Build vendor-facing flows first, then customer discovery and payment, then platform (admin, support), then quality (SEO, analytics, tests, docs). |
| S5 | **Pre-push checks** | Run `npm run check:prepush` at repo root before every push. Use conventional commits (`feat`, `fix`, `docs`, etc.). |
| S6 | **Single source of truth** | Roadmap and component checklist live in `.cursor/plans/opusfesta-jan-april-roadmap.md`; Notion holds task status and assignments. |

---

## 2. Goals

Outcomes by period. Use these as Notion “Goals” or “Epic” headers; tasks sit under them.

| Period | Dates | Goal |
|--------|--------|------|
| **G1** | Jan 1–14 | Vendor onboarding and storefront foundation: new vendors can create profile from Storefront; checklist and UX in place. |
| **G2** | Jan 15–28 | Inquiry → quote in vendor-portal: vendors manage inquiries (accept/decline/respond), send quotes, and manage availability. |
| **G3** | Feb 1–14 | Customer discovery and inquiry UX: search, filters, collections, saved vendors; customer sees inquiry status and can start payment. |
| **G4** | Feb 15–28 | Payment and escrow hardening: full pay flow (Stripe + mobile money), escrow hold/release UI, receipt verification. |
| **G5** | Mar 1–14 | Reviews and admin operations: customers submit reviews; admin moderates reviews and (optional) vendor approval; basic analytics. |
| **G6** | Mar 15–28 | Customer support and notifications: support tickets (list, create, lookup); in-app and email notifications for key milestones. |
| **G7** | Apr 1–14 | Quality: SEO (meta/OG), analytics events, error handling, runbooks for payments and escrow. |
| **G8** | Apr 15–30 | Tests and docs: E2E/integration tests for inquiry→pay and escrow; unit tests for critical APIs; updated docs. |

---

## 3. Tasks

Actionable items for Notion. Suggested columns: **Task**, **Goal (Period)**, **Owner**, **Priority**, **Status**, **Notes**.

- **Owner:** SWE1, SWE2, or PM.  
- **Priority:** P0 = must-have, P1 = should-have, P2 = nice-to-have.  
- **Status:** Not started | In progress | Completed | Overdue (PM to maintain).

---

### G1 — Jan 1–14: Vendor onboarding & storefront foundation

| Task | Owner | Priority | Status | Notes |
|------|--------|----------|--------|--------|
| Implement vendor onboarding when no profile exists (create from Storefront tab) | SWE1 or SWE2 | P0 | Not started | Unblocks storefront; see storefront_user_journey Phase 1. |
| Storefront completion checklist: click-to-jump and progress % | SWE1 or SWE2 | P1 | Not started | storefront_user_journey Phase 2. |
| Storefront UX: loading, error recovery, no-vendor state | SWE1 or SWE2 | P1 | Not started | Phase 1 UX fixes. |
| Ensure RLS and Supabase vendor tables support onboarding flow | SWE1 or SWE2 | P0 | Not started | packages/auth, Supabase. |
| PM: Sprint planning and kickoff for Coder 1; define “done” for onboarding | PM | — | Not started | Goal G1. |

---

### G2 — Jan 15–28: Inquiry → quote in vendor-portal

| Task | Owner | Priority | Status | Notes |
|------|--------|----------|--------|--------|
| Vendor-portal: full inquiry list (all statuses) | SWE1 or SWE2 | P0 | Not started | Use api/inquiries; COMPLETE_BOOKING_PAYMENT_FLOW. |
| Vendor-portal: accept / decline / respond to inquiries | SWE1 or SWE2 | P0 | Not started | Harden inquiry status API usage. |
| Quote flow: create invoice from accepted inquiry | SWE1 or SWE2 | P0 | Not started | api/invoices, api/invoices/[id]/publish. |
| Quote flow: publish invoice to customer | SWE1 or SWE2 | P0 | Not started | Same APIs. |
| Availability: view and edit in vendor-portal | SWE1 or SWE2 | P1 | Not started | api/vendors/[id]/availability; calendar/availability. |
| PM: Review G1 deliverables; plan G2 and unblock dependencies | PM | — | Not started | Goal G2. |

---

### G3 — Feb 1–14: Customer discovery & inquiry UX

| Task | Owner | Priority | Status | Notes |
|------|--------|----------|--------|--------|
| Discovery: search filters (category, location, price, verified, sort) | SWE1 or SWE2 | P0 | Not started | api/vendors/search, search_vendors RPC. |
| Discovery: collections UX (deals, new, trending, budget) | SWE1 or SWE2 | P1 | Not started | api/vendors/collections, VendorCollectionView. |
| Saved vendors: list and add/remove; ensure logged-in flow | SWE1 or SWE2 | P1 | Not started | api/users/saved-vendors, saved page. |
| Customer inquiry page: status, vendor response, invoice visibility | SWE1 or SWE2 | P0 | Not started | Full flow visibility. |
| Customer: “Pay” flow entry from inquiry/invoice | SWE1 or SWE2 | P0 | Not started | InvoiceList + Pay; COMPLETE_BOOKING_PAYMENT_FLOW. |
| PM: Sprint review G2; plan G3; confirm search/collections scope | PM | — | Not started | Goal G3. |

---

### G4 — Feb 15–28: Payment & escrow hardening

| Task | Owner | Priority | Status | Notes |
|------|--------|----------|--------|--------|
| End-to-end: accept → invoice → pay (Stripe card) | SWE1 or SWE2 | P0 | Not started | api/payments/intent, webhook/stripe, PAYMENT_METHODS_ESCROW. |
| End-to-end: accept → invoice → pay (mobile money) | SWE1 or SWE2 | P0 | Not started | api/payments/receipts; MOBILE_MONEY_PAYMENT_FLOW. |
| Escrow: hold/release UI (vendor: complete-work; admin: release) | SWE1 or SWE2 | P0 | Not started | api/escrow/[id]/complete-work; ESCROW_PAYMENT_SYSTEM. |
| Vendor-portal: mobile money receipt verification UI | SWE1 or SWE2 | P0 | Not started | api/payments/receipts/[id]/verify. |
| Stripe webhook and mobile-money verification paths tested | SWE1 or SWE2 | P0 | Not started | services/payments, Supabase escrow_holds/triggers. |
| PM: Coordinate payment/escrow testing; clarify release rules with stakeholders | PM | — | Not started | Goal G4. |

---

### G5 — Mar 1–14: Reviews & admin operations

| Task | Owner | Priority | Status | Notes |
|------|--------|----------|--------|--------|
| Customer: submit review post-booking | SWE1 or SWE2 | P1 | Not started | api/reviews; can_user_review_vendor; TEST_REVIEW_MODERATION. |
| Customer: display reviews on vendor page | SWE1 or SWE2 | P1 | Not started | Same. |
| Admin: review moderation (approve/reject/flag) wired to website API | SWE1 or SWE2 | P0 | Not started | admin/reviews, api/admin/reviews. |
| Admin: vendor approval workflow (approve/revoke listing) — if desired | SWE1 or SWE2 | P1 | Not started | “Approved” vendor flag, RLS/public listing filter. |
| Admin: basic analytics (inquiries, revenue, vendor counts) | SWE1 or SWE2 | P1 | Not started | api/reports/vendors; admin analytics. |
| PM: Define review moderation SLA; confirm vendor approval scope | PM | — | Not started | Goal G5. |

---

### G6 — Mar 15–28: Customer support & notifications

| Task | Owner | Priority | Status | Notes |
|------|--------|----------|--------|--------|
| Customer support app: ticket list and create ticket | SWE1 or SWE2 | P1 | Not started | SUPPORT_SERVICES; customersupport app, services/support. |
| Customer support: lookup by inquiry / user / email | SWE1 or SWE2 | P1 | Not started | Same. |
| In-app notifications (e.g. inquiry accepted, invoice ready, payment received) | SWE1 or SWE2 | P1 | Not started | website, vendor-portal, api (inquiries, notifications). |
| Email notifications for key milestones (inquiry received, accepted, invoice, payment) | SWE1 or SWE2 | P1 | Not started | Resend templates; extend to website and events. |
| PM: Align support ticket fields with support team; confirm notification copy | PM | — | Not started | Goal G6. |

---

### G7 — Apr 1–14: Quality (SEO, analytics, errors)

| Task | Owner | Priority | Status | Notes |
|------|--------|----------|--------|--------|
| SEO: meta titles and descriptions for vendor and collection pages | SWE1 or SWE2 | P1 | Not started | website layout and per-page metadata. |
| SEO: OG tags for vendor/collection/key pages | SWE1 or SWE2 | P1 | Not started | Same. |
| Analytics events: search, inquiry submit, payment start/success | SWE1 or SWE2 | P1 | Not started | Website and vendor-portal; minimal event schema. |
| Centralized error boundaries and API error responses | SWE1 or SWE2 | P1 | Not started | Avoid leaking internals. |
| Runbooks for payments and escrow (docs/) | SWE1 or SWE2 | P2 | Not started | Ops runbooks. |
| PM: Prioritize SEO/analytics scope; review error-message copy | PM | — | Not started | Goal G7. |

---

### G8 — Apr 15–30: Tests & docs

| Task | Owner | Priority | Status | Notes |
|------|--------|----------|--------|--------|
| E2E or integration: inquiry submit → accept → invoice → pay (card) | SWE1 or SWE2 | P0 | Not started | COMPLETE_BOOKING_PAYMENT_FLOW. |
| E2E or integration: receipt verify (mobile money) | SWE1 or SWE2 | P0 | Not started | Same. |
| E2E or integration: escrow complete-work and release | SWE1 or SWE2 | P0 | Not started | ESCROW docs. |
| Unit tests for critical API routes | SWE1 or SWE2 | P0 | Not started | website, vendor-portal, services/payments. |
| Update BOOKING_INQUIRY_FLOW, COMPLETE_BOOKING_PAYMENT_FLOW, storefront plan | SWE1 or SWE2 | P1 | Not started | docs/. |
| Update ESCROW and payment docs | SWE1 or SWE2 | P1 | Not started | docs/. |
| PM: Final roadmap review; handover and retrospective | PM | — | Not started | Goal G8. |

---

## Notion import tips

- **Strategies:** Add as a “Strategies” page or table; link from dashboard.
- **Goals:** Create 8 “Goal” or “Epic” items (G1–G8) with period and dates; link tasks to them.
- **Tasks:** Create a “Tasks” database with columns: Task (title), Goal (relation or select), Owner (person or select: SWE1, SWE2, PM), Priority (select: P0, P1, P2), Status (select: Not started, In progress, Completed, Overdue), Notes (text). Bulk-import from the tables above or paste and split.
- Use **Status** to see what’s overdue, in progress, or completed; filter by **Owner** for capacity; filter by **Goal** for sprint focus.

---

*Generated from OpusFesta Jan–April Roadmap. Source: `.cursor/plans/opusfesta_jan-april_roadmap.md`.*
