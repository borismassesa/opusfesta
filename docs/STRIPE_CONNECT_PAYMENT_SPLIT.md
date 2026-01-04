# Stripe Connect Payment Split System

## Overview

The payment system implements a **10% platform fee** model where:
- **TheFesta receives 10%** of each payment as platform revenue
- **Vendors receive 90%** of each payment
- Payments are automatically split and tracked
- Vendors can connect their Stripe accounts to receive direct transfers

## Architecture

### Payment Flow

1. **Customer Payment**: Customer pays invoice via Stripe
2. **Payment Success**: Webhook receives `payment_intent.succeeded`
3. **Automatic Split**: Database trigger calculates split:
   - Platform fee: 10% of payment
   - Vendor amount: 90% of payment
4. **Revenue Records**: Creates records in:
   - `platform_revenue` table (TheFesta's 10%)
   - `vendor_revenue` table (Vendor's 90%)
5. **Transfer to Vendor**: If vendor has Stripe Connect:
   - Transfers 90% to vendor's connected account
   - Updates transfer status

### Database Tables

#### `platform_revenue`
Tracks TheFesta's platform fees (10% of each payment).

#### `vendor_revenue`
Tracks vendor earnings (90% of each payment) and transfer status.

#### `payments` (updated)
Added fields:
- `platform_fee_amount`: 10% fee amount
- `vendor_amount`: 90% vendor amount
- `platform_fee_percentage`: Default 10%
- `transfer_id`: Stripe transfer ID
- `transfer_status`: pending, paid, failed
- `transferred_at`: Transfer timestamp

#### `vendors` (updated)
Added Stripe Connect fields:
- `stripe_account_id`: Vendor's Stripe Connect account ID
- `stripe_account_status`: pending, active, restricted
- `stripe_onboarding_completed`: Boolean
- `stripe_payouts_enabled`: Boolean

## Stripe Connect Setup

### 1. Vendor Onboarding

Vendors connect their Stripe accounts via Stripe Connect Express:

```typescript
POST /api/vendors/[id]/stripe-connect
{
  "returnUrl": "https://thefesta.com/vendor/settings",
  "refreshUrl": "https://thefesta.com/vendor/settings"
}
```

This creates a Stripe Connect Express account and returns an onboarding URL.

### 2. Account Status

Check vendor's Stripe Connect status:

```typescript
GET /api/vendors/[id]/stripe-connect
```

Returns:
- Account ID
- Onboarding status
- Payouts enabled status

### 3. Payment Transfer

When a payment succeeds:
1. Payment is split (10% platform, 90% vendor)
2. If vendor has connected account, transfer is created
3. Vendor receives 90% directly to their Stripe account
4. TheFesta keeps 10% in platform account

## Revenue Tracking

### Vendor Revenue API

```typescript
GET /api/vendors/[id]/revenue?startDate=2026-01-01&endDate=2026-12-31
```

Returns:
- **Summary**: Total revenue, platform fees, paid out, pending
- **History**: Detailed payment history with transfers

### Platform Revenue

Platform revenue is tracked in `platform_revenue` table. Admins can query:

```sql
SELECT * FROM get_platform_revenue_summary('2026-01-01', '2026-12-31');
```

## Payment Split Calculation

The split is calculated automatically via database function:

```sql
SELECT * FROM calculate_payment_split(1000.00, 10.00);
-- Returns: platform_fee: 100.00, vendor_amount: 900.00
```

## Database Triggers

### `create_payment_split_trigger`

Automatically fires when payment status changes to `SUCCEEDED`:
1. Calculates 10% platform fee and 90% vendor amount
2. Updates payment record with split amounts
3. Creates `platform_revenue` record
4. Creates `vendor_revenue` record

## Transfer Flow

### With Stripe Connect

1. Payment succeeds → Webhook fires
2. Trigger creates revenue records
3. Webhook handler checks vendor's Stripe account
4. If connected, creates transfer to vendor
5. Updates `vendor_revenue` with transfer ID and status

### Without Stripe Connect

1. Payment succeeds → Webhook fires
2. Trigger creates revenue records
3. Transfer status remains `pending`
4. Vendor connects Stripe account later
5. Manual transfer can be initiated

## Environment Variables

Required Stripe environment variables:

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Testing

### Test Payment Split

1. Create an invoice for $100
2. Process payment
3. Verify:
   - Platform revenue: $10
   - Vendor revenue: $90
   - Payment record has split amounts

### Test Stripe Connect

1. Vendor creates Stripe Connect account
2. Complete onboarding
3. Process payment
4. Verify transfer to vendor account

## Migration

Run the migration to add payment split tables and fields:

```bash
supabase migration up 013_stripe_connect_payment_split
```

## API Endpoints

### Vendor Revenue
- `GET /api/vendors/[id]/revenue` - Get revenue summary and history

### Stripe Connect
- `GET /api/vendors/[id]/stripe-connect` - Get account status
- `POST /api/vendors/[id]/stripe-connect` - Create/update account

## Next Steps

- [ ] Create vendor dashboard for revenue viewing
- [ ] Add manual transfer initiation for vendors without Stripe Connect
- [ ] Add payout scheduling (weekly/monthly)
- [ ] Add revenue reports and analytics
- [ ] Add platform revenue dashboard for admins
