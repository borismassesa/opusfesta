# Payment Gateway Integration - Setup Complete ✅

## Overview

Payment gateway integration has been set up with support for:
- **Stripe** - For international card payments
- **Africa's Talking** - For local mobile money (MPESA, Airtel Money, Tigo Pesa, Halo Pesa)

## Database Schema

Created migration: `supabase/migrations/012_payments_invoices.sql`

### Tables Created:
1. **invoices** - Invoice management
   - Links to inquiries and vendors
   - Tracks amounts, status, due dates
   - Auto-generates invoice numbers

2. **payments** - Payment records
   - Links to invoices and inquiries
   - Supports multiple payment methods
   - Tracks provider transaction IDs
   - Handles refunds

3. **payouts** - Vendor payouts
   - Tracks vendor earnings
   - Supports multiple payout methods

4. **payment_methods** - Saved payment methods
   - User saved cards/accounts
   - Default payment method selection

### Key Features:
- Automatic invoice number generation (`INV-YY-XXXXXX`)
- Auto-update invoice paid amount when payments succeed
- Mark overdue invoices automatically
- Row Level Security (RLS) policies for data access

## API Routes Created

### 1. Create Payment Intent
**POST** `/api/payments/intent`

Creates a payment intent for an invoice. Supports:
- Stripe (card payments)
- Mobile money (via Africa's Talking - to be implemented)

**Request:**
```json
{
  "invoiceId": "uuid",
  "method": "stripe" | "mpesa" | "airtel_money" | "tigo_pesa" | "halo_pesa",
  "customerEmail": "optional",
  "customerName": "optional"
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "uuid",
  "clientSecret": "stripe_client_secret",
  "paymentIntentId": "pi_xxx",
  "amount": 100.00,
  "currency": "USD"
}
```

### 2. Payment Status
**GET** `/api/payments/[id]/status`

Get payment status and updates from provider if needed.

**Response:**
```json
{
  "payment": {
    "id": "uuid",
    "invoiceId": "uuid",
    "amount": 100.00,
    "currency": "USD",
    "method": "STRIPE_CARD",
    "status": "SUCCEEDED",
    "processedAt": "2025-01-01T...",
    "failureReason": null,
    "refundAmount": 0,
    "refundedAt": null,
    "createdAt": "2025-01-01T..."
  }
}
```

### 3. Stripe Webhook
**POST** `/api/payments/webhook/stripe`

Handles Stripe webhook events:
- `payment_intent.succeeded` - Updates payment to SUCCEEDED
- `payment_intent.payment_failed` - Updates payment to FAILED
- `payment_intent.canceled` - Updates payment to CANCELLED
- `charge.refunded` - Updates refund information

## Stripe Integration

### Setup Required:

1. **Install Stripe package:**
   ```bash
   cd apps/website
   npm install stripe
   ```

2. **Environment Variables:**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Webhook Configuration:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/payments/webhook/stripe`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
     - `charge.refunded`
   - Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Usage:

```typescript
import { stripePaymentService } from '@/lib/payments/stripe';

// Create payment intent
const result = await stripePaymentService.createPaymentIntent({
  amount: 10000, // in cents
  currency: 'usd',
  invoiceId: 'invoice-uuid',
  inquiryId: 'inquiry-uuid',
  customerEmail: 'customer@example.com',
});
```

## Next Steps

1. **Run Migration:**
   ```sql
   -- Apply migration in Supabase SQL Editor
   -- File: supabase/migrations/012_payments_invoices.sql
   ```

2. **Install Dependencies:**
   ```bash
   cd apps/website
   npm install stripe
   ```

3. **Configure Environment:**
   - Add Stripe keys to `.env.local`
   - Set up webhook endpoint in Stripe Dashboard

4. **Test Integration:**
   - Create a test invoice
   - Create payment intent
   - Process test payment
   - Verify webhook handling

## Integration with Booking Flow

The payment system is ready to integrate with:
- Inquiry/booking acceptance
- Invoice generation (P1-6.2 - next task)
- Payment processing
- Payment tracking (P1-6.3 - next task)

## Files Created

- `supabase/migrations/012_payments_invoices.sql` - Database schema
- `apps/website/src/lib/payments/stripe.ts` - Stripe service
- `apps/website/src/app/api/payments/intent/route.ts` - Payment intent API
- `apps/website/src/app/api/payments/[id]/status/route.ts` - Payment status API
- `apps/website/src/app/api/payments/webhook/stripe/route.ts` - Stripe webhook handler

## Notes

- Stripe integration uses conditional imports (works even if package not installed)
- Mobile money integration (Africa's Talking) is prepared but needs implementation
- All payment methods are tracked in the database
- RLS policies ensure users can only access their own payments
- Automatic invoice status updates when payments succeed
