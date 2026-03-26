---
name: studio-booking-flow
description: "Studio booking lifecycle management. Use when working on booking intake, status transitions, quotes, contracts, deposits, confirmations, or the booking pipeline."
---

# Studio Booking Lifecycle

## Status Flow

```
intake_submitted → qualified → quote_sent → contract_sent → deposit_pending → confirmed → in_progress → completed
                                                                                                      ↘ cancelled
```

Any status can also transition to `cancelled` (with policy rules applied).

## Status Transition Rules

```typescript
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  intake_submitted: ['qualified', 'cancelled'],
  qualified: ['quote_sent', 'cancelled'],
  quote_sent: ['contract_sent', 'cancelled'],
  contract_sent: ['deposit_pending', 'cancelled'],
  deposit_pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}
```

## NEXT_ACTION Map

| Status | Admin Action | Client Action |
|--------|-------------|---------------|
| `intake_submitted` | Review & qualify lead | Wait for response |
| `qualified` | Prepare and send quote | Wait for quote |
| `quote_sent` | Wait | Review and accept quote |
| `contract_sent` | Wait | Sign contract |
| `deposit_pending` | Wait | Pay deposit (M-Pesa/Airtel/Tigo/Stripe) |
| `confirmed` | Prepare for event | No action needed |
| `in_progress` | Execute service | No action needed |
| `completed` | Request review | Leave review |
| `cancelled` | — | — |

## Business Rules

### Pricing & Currency

- All amounts in **TZS** (Tanzanian Shilling), stored as integers
- Display: `TZS 1,500,000` with thousand separators
- Deposit: typically 30-50% of total amount

### Deposit Policy

- Deposit must be paid before booking moves to `confirmed`
- Payment methods: M-Pesa, Airtel Money, Tigo Pesa, Stripe (international)
- Deposit payment triggers automatic status transition: `deposit_pending` -> `confirmed`

### Cancellation Policy

- Before `contract_sent`: full refund, no penalty
- After `contract_sent` but before `deposit_pending`: administrative fee applies
- After deposit paid: deposit is non-refundable
- Cancellation reason required and stored

### Reschedule Policy

- Requires minimum 48 hours advance notice
- First reschedule: free
- Subsequent reschedules: fee applies
- Event date change logged in booking history

## Database Tables

| Table | Purpose |
|-------|---------|
| `studio_bookings` | Core booking record (status, dates, pricing, notes) |
| `studio_client_profiles` | Client info linked to Clerk user |
| `studio_messages` | Per-booking message thread (admin <-> client) |

## API Routes

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/portal/bookings` | Client submits new intake |
| `PATCH` | `/api/portal/bookings/[id]` | Client updates booking |
| `GET` | `/api/admin/bookings` | Admin lists all bookings with filters |
| `PATCH` | `/api/admin/bookings/[id]/status` | Admin transitions booking status |
| `GET` | `/api/admin/bookings/[id]` | Admin views booking detail |

### Status Transition Endpoint

```typescript
// PATCH /api/admin/bookings/[id]/status
// Body: { status: 'qualified', note?: 'Client meets requirements' }
// Validates: transition is allowed, user has admin role
// Side effects: creates timeline entry, sends notification
```

## Auth

- Portal routes: Clerk auth, client sees only their own bookings
- Admin routes: Clerk auth + admin role check
- API routes validate auth before any database operation
