# Mobile Money Integration Guide

## Current Situation

**Stripe does NOT natively support Mobile Money** (M-PESA, Airtel Money, Tigo Pesa, Halo Pesa) in Tanzania.

## Options for Mobile Money Integration

### Option 1: Hybrid Approach (Recommended)
Use **Stripe for card payments** and **Africa's Talking** (or similar) for mobile money.

**Pros:**
- Stripe handles international card payments
- Africa's Talking handles local mobile money
- Both integrate into the same payment system
- Best user experience for both customer types

**Cons:**
- Need to manage two payment providers
- Different APIs and webhooks

### Option 2: Paystack (Stripe-owned)
Paystack was acquired by Stripe and supports mobile money, but it's **focused on Nigeria/West Africa**, not Tanzania.

**Status:** Not suitable for Tanzania market

### Option 3: Direct Mobile Money Integration
Integrate directly with each mobile money provider's API.

**Pros:**
- Direct control
- No middleman fees

**Cons:**
- Complex - need separate integrations for each provider
- Requires agreements with each telco
- More maintenance

## Recommended Solution: Africa's Talking

### Why Africa's Talking?
- ✅ Supports M-PESA, Airtel Money, Tigo Pesa in Tanzania
- ✅ Single API for multiple providers
- ✅ Good documentation
- ✅ Reliable service
- ✅ Webhook support

### Integration Architecture

```
Customer Payment Flow:
├── Card Payment → Stripe → Platform Account
└── Mobile Money → Africa's Talking → Platform Account
                    ↓
            Split: 10% Platform, 90% Vendor
```

### Implementation Plan

1. **Payment Method Selection**
   - Customer chooses: Card or Mobile Money
   - If Mobile Money: Show provider selection (M-PESA, Airtel, etc.)

2. **Payment Processing**
   - Card: Use existing Stripe integration
   - Mobile Money: Use Africa's Talking API

3. **Payment Split**
   - Both payment methods use the same split logic
   - 10% platform fee, 90% vendor
   - Same revenue tracking tables

4. **Vendor Payouts**
   - Stripe Connect for card payments
   - Bank transfer or mobile money for mobile money payments

## Code Structure

### Current State
- ✅ Stripe card payments implemented
- ✅ Payment split system ready
- ⚠️ Mobile money placeholder in UI

### Next Steps

1. **Install Africa's Talking SDK**
   ```bash
   npm install africastalking
   ```

2. **Create Mobile Money Service**
   - Similar structure to `stripe.ts`
   - Handle M-PESA, Airtel Money, Tigo Pesa

3. **Update Payment Intent API**
   - Route to correct service based on payment method
   - Stripe for cards, Africa's Talking for mobile money

4. **Webhook Handler**
   - Handle Africa's Talking webhooks
   - Update payment status same as Stripe

5. **Update Payment Form**
   - Implement actual mobile money payment flow
   - Show payment instructions (USSD prompts)

## Africa's Talking Integration Example

```typescript
// lib/payments/africas-talking.ts
import { AfricasTalking } from 'africastalking';

const at = new AfricasTalking({
  apiKey: process.env.AFRICAS_TALKING_API_KEY,
  username: process.env.AFRICAS_TALKING_USERNAME,
});

// Mobile money payment
async function initiateMobileMoneyPayment(
  phoneNumber: string,
  amount: number,
  provider: 'MPESA' | 'AIRTEL_MONEY' | 'TIGO_PESA',
  metadata: Record<string, string>
) {
  const payments = at.payments;
  
  const result = await payments.mobileCheckout({
    productName: 'TheFesta Payment',
    phoneNumber: phoneNumber,
    currencyCode: 'TZS',
    amount: amount,
    metadata: metadata,
  });
  
  return result;
}
```

## Payment Flow Comparison

### Stripe (Card)
1. Customer enters card details
2. Stripe processes payment
3. Webhook confirms success
4. Split payment (10%/90%)
5. Transfer to vendor (if Stripe Connect)

### Africa's Talking (Mobile Money)
1. Customer selects provider & enters phone
2. Africa's Talking sends USSD prompt
3. Customer approves on phone
4. Webhook confirms success
5. Split payment (10%/90%)
6. Transfer to vendor (bank or mobile money)

## Revenue Tracking

Both payment methods use the same tables:
- `payments` - All payments (card or mobile money)
- `platform_revenue` - Platform's 10%
- `vendor_revenue` - Vendor's 90%

The `method` field distinguishes:
- `STRIPE_CARD` - Card payment
- `MPESA` - M-PESA mobile money
- `AIRTEL_MONEY` - Airtel Money
- `TIGO_PESA` - Tigo Pesa
- `HALO_PESA` - Halo Pesa

## Vendor Payouts

### Card Payments
- Use Stripe Connect
- Automatic transfer to vendor's Stripe account

### Mobile Money Payments
- Bank transfer to vendor's account
- Or mobile money transfer (if vendor prefers)
- Manual or scheduled payouts

## Cost Comparison

### Stripe
- Card fees: ~2.9% + $0.30 per transaction
- No monthly fees
- International cards supported

### Africa's Talking
- Mobile money fees: ~1-2% per transaction
- May have setup fees
- Local payments only

## Recommendation

**Use both:**
- **Stripe** for international customers and card payments
- **Africa's Talking** for local Tanzanian customers using mobile money

This gives you:
- ✅ Best coverage (local + international)
- ✅ Lower fees for mobile money
- ✅ Better user experience
- ✅ Same payment split system

## Next Steps

1. Sign up for Africa's Talking account
2. Get API credentials
3. Implement mobile money service
4. Update payment form
5. Add webhook handler
6. Test with real transactions
