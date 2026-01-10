# Visa Card Payment Testing Guide

## Overview
OpusFesta uses Stripe for processing card payments, including Visa cards. This guide explains how to test Visa card payments in the system.

## Stripe Configuration

### Required Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Verify Configuration
1. Check that `STRIPE_SECRET_KEY` is set in your environment
2. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set for the frontend
3. Ensure webhook secret is configured for production

## Testing Visa Card Payments

### Test Card Numbers
Stripe provides test card numbers that simulate different scenarios:

**Successful Visa Payment:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Other Test Scenarios:**
- **Declined Card:** `4000 0000 0000 0002`
- **Insufficient Funds:** `4000 0000 0000 9995`
- **3D Secure Required:** `4000 0027 6000 3184`

### Testing Flow

1. **Create an Inquiry**
   - Navigate to a vendor page
   - Click "Request to Book"
   - Fill out the inquiry form
   - Submit the inquiry

2. **Wait for Vendor Acceptance**
   - Vendor must accept the inquiry
   - An invoice will be created automatically

3. **Make Payment**
   - Navigate to `/inquiries/[id]` page
   - Click "Pay" on the invoice
   - Select "Card" as payment method
   - Enter test Visa card details:
     - Card: `4242 4242 4242 4242`
     - Expiry: `12/34`
     - CVC: `123`
     - ZIP: `12345`
   - Click "Pay Now"

4. **Verify Payment**
   - Payment should process successfully
   - Invoice status should update to "PAID"
   - Payment record should be created in database
   - Escrow hold should be created (10% platform fee, 90% vendor hold)

### Payment Processing Flow

```
Customer → InvoicePaymentForm → /api/payments/intent → Stripe API
                                                          ↓
Customer ← Payment Confirmation ← Webhook Handler ← Stripe Webhook
```

### Key Files

- **Payment Form:** `apps/website/src/components/payments/InvoicePaymentForm.tsx`
- **Payment Intent API:** `apps/website/src/app/api/payments/intent/route.ts`
- **Stripe Service:** `apps/website/src/lib/payments/stripe.ts`
- **Webhook Handler:** `apps/website/src/app/api/payments/webhook/stripe/route.ts`

### Expected Behavior

1. **Payment Intent Creation**
   - API creates Stripe payment intent
   - Returns `clientSecret` to frontend
   - Payment intent status: `requires_payment_method`

2. **Card Payment Confirmation**
   - Frontend uses Stripe.js to confirm payment
   - Card details are sent securely to Stripe
   - Payment intent status: `succeeded`

3. **Webhook Processing**
   - Stripe sends webhook event: `payment_intent.succeeded`
   - Webhook handler updates payment status
   - Creates escrow hold records
   - Updates invoice status to "PAID"

### Troubleshooting

**Payment Fails:**
- Check Stripe dashboard for error details
- Verify API keys are correct
- Ensure webhook endpoint is configured
- Check browser console for errors

**Webhook Not Received:**
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3001/api/payments/webhook/stripe`
- Verify webhook secret matches
- Check webhook endpoint is accessible

**Payment Succeeds but Invoice Not Updated:**
- Check webhook handler logs
- Verify database connection
- Check RLS policies allow updates

## Production Checklist

- [ ] Stripe account is activated
- [ ] Live API keys are configured
- [ ] Webhook endpoint is set up in Stripe dashboard
- [ ] Webhook secret is stored securely
- [ ] Test payments work in test mode
- [ ] Escrow system is functioning
- [ ] Payment notifications are working

## Additional Resources

- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
