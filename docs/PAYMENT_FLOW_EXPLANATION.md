# Payment Flow Explanation

## Important: Payments Don't Happen During Inquiry Submission

When you submit an inquiry (click "Send Inquiry"), **NO payment is created**. The inquiry is just a request to the vendor.

## Complete Payment Flow

### Step 1: Submit Inquiry ✅ (What you just did)
- Customer fills out inquiry form
- Inquiry is created with status: `pending`
- **NO payment is created at this stage**
- **NO Stripe payment intent is created**

### Step 2: Vendor Accepts Inquiry
- Vendor reviews the inquiry
- Vendor clicks "Accept" on the inquiry page
- Inquiry status changes to: `accepted`
- **Still NO payment yet**

### Step 3: Vendor Creates Invoice
- Vendor creates an invoice for the accepted inquiry
- Invoice is created with status: `DRAFT` or `PUBLISHED`
- **Still NO payment yet - just an invoice**

### Step 4: Customer Pays Invoice
- Customer sees the invoice on `/inquiries/[id]` page
- Customer clicks "Pay" button
- **NOW** a Stripe payment intent is created
- **NOW** the payment appears in Stripe dashboard
- Customer enters card details and pays
- Payment is processed through Stripe

## Why You Don't See Payments in Stripe

If you just submitted an inquiry, you won't see any payments in Stripe because:
1. No invoice has been created yet
2. No payment intent has been created yet
3. The customer hasn't attempted to pay yet

## How to Test the Full Payment Flow

### Option 1: Complete the Full Flow
1. Submit an inquiry (you did this ✅)
2. As the vendor, accept the inquiry:
   - Go to `/inquiries/[inquiry-id]`
   - Click "Accept Inquiry"
3. Create an invoice (vendor action):
   - Use POST `/api/invoices` API
   - Or use vendor dashboard (if implemented)
4. As the customer, pay the invoice:
   - Go to `/inquiries/[inquiry-id]`
   - Click "Pay" on the invoice
   - Enter test card: `4242 4242 4242 4242`
   - **NOW** you'll see the payment in Stripe

### Option 2: Test Payment Directly (Skip to Step 4)
If you already have an accepted inquiry with an invoice:
1. Navigate to `/inquiries/[inquiry-id]`
2. Find the invoice in the list
3. Click "Pay" button
4. Enter test card details
5. Complete payment
6. **Check Stripe dashboard** - you should see the payment

## Checking Your Stripe Configuration

Make sure you have these in `apps/website/.env.local`:

```env
# Stripe Keys (from your Stripe dashboard)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## Where to Find Stripe Keys

1. Go to your Stripe Dashboard: https://dashboard.stripe.com
2. Click "Developers" → "API keys"
3. Copy:
   - **Secret key** (starts with `sk_test_` for test mode)
   - **Publishable key** (starts with `pk_test_` for test mode)
4. For webhooks: "Developers" → "Webhooks" → Create endpoint → Copy webhook secret

## Test Card Numbers

Use these in Stripe test mode:
- **Success:** `4242 4242 4242 4242` (Visa)
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

## Summary

- ✅ Inquiry submission = No payment
- ✅ Vendor acceptance = No payment
- ✅ Invoice creation = No payment
- ✅ Customer clicks "Pay" = Payment intent created
- ✅ Customer completes payment = Payment appears in Stripe

If you want to test payments, you need to complete the full flow or have an existing invoice to pay.
