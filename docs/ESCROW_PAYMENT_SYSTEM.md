# Escrow Payment System

## Overview

OpusFesta uses an **escrow/hold system** where all payments are held by OpusFesta until work is completed. This ensures vendor accountability and quality service delivery, similar to Uber and Airbnb.

## Payment Flow

### 1. Customer Payment
- Customer pays invoice (card or mobile money)
- Payment is **held in escrow** by OpusFesta
- Status: `HELD`

### 2. Work Completion
- Vendor completes the work/service
- Vendor or customer marks work as completed
- Status: `HELD` (work completed, ready for release)

### 3. Fund Release
- Admin or automatic system releases funds
- 10% platform fee → OpusFesta (collected immediately)
- 90% vendor amount → Released to vendor
- Status: `RELEASED`

## Key Features

### ✅ Vendor Accountability
- Funds held until work is verified
- Encourages quality service delivery
- Protects customers from incomplete work

### ✅ Automatic Split
- 10% platform fee collected immediately
- 90% vendor amount held in escrow
- Split happens on payment, release happens on completion

### ✅ Work Verification
- Vendor can mark work as completed
- Customer can confirm completion
- Admin can verify and release

### ✅ Dispute Handling
- Funds can be held during disputes
- Refund capability if work not completed
- Resolution tracking

## Database Schema

### `escrow_holds` Table
Tracks all funds held by OpusFesta:
- `total_amount` - Full payment amount
- `platform_fee` - 10% platform fee
- `vendor_amount` - 90% vendor amount (held)
- `status` - held, released, refunded, disputed
- `work_completed` - Boolean flag
- `work_completed_at` - Completion timestamp
- `released_at` - Release timestamp

### Updated Tables
- `payments.escrow_status` - held, released, refunded
- `vendor_revenue.escrow_status` - held, released, refunded

## API Endpoints

### Get Escrow Holds
```
GET /api/escrow?vendorId=xxx&status=held&workCompleted=false
```

### Mark Work as Completed
```
POST /api/escrow/[id]/complete-work
Body: {
  verificationNotes?: string;
}
```

### Release Funds
```
POST /api/escrow/[id]/release
Body: {
  releaseMethod?: 'automatic' | 'manual' | 'scheduled';
  releaseReason?: string;
}
```

## Workflow

### Automatic Release (Recommended)
1. Payment succeeds → Funds held
2. Vendor marks work completed
3. Customer confirms (optional)
4. Automatic release after X days (configurable)
5. Funds transferred to vendor

### Manual Release
1. Payment succeeds → Funds held
2. Vendor marks work completed
3. Admin reviews and approves
4. Admin releases funds manually
5. Funds transferred to vendor

### Dispute Flow
1. Customer opens dispute
2. Funds held in escrow
3. Admin reviews dispute
4. Resolution:
   - Release to vendor (work verified)
   - Refund to customer (work not completed)

## Benefits

### For Customers
- ✅ Payment protection
- ✅ Quality assurance
- ✅ Dispute resolution
- ✅ Refund capability

### For Vendors
- ✅ Guaranteed payment (if work completed)
- ✅ Professional platform
- ✅ Builds trust with customers

### For OpusFesta
- ✅ Platform fee collected immediately
- ✅ Vendor accountability
- ✅ Quality control
- ✅ Dispute management

## Configuration

### Automatic Release Settings
- Release after work completion: Immediate or X days
- Customer confirmation required: Yes/No
- Auto-release threshold: Amount limit

### Dispute Settings
- Dispute window: X days after completion
- Auto-resolution: After X days if no response

## Migration

Run migration to add escrow system:
```bash
supabase migration up 015_escrow_payment_hold
```

This creates:
- `escrow_holds` table
- Escrow functions (create, release, refund)
- Updated payment and revenue tracking
- RLS policies

## Next Steps

- [ ] Build work completion UI (vendor dashboard)
- [ ] Build fund release interface (admin)
- [ ] Add automatic release scheduling
- [ ] Add dispute management UI
- [ ] Add notifications for work completion
- [ ] Add customer confirmation flow
