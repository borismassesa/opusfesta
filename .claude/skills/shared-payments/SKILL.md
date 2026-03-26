---
name: shared-payments
description: "Payment processing — mobile money (M-Pesa, Airtel, Tigo), Stripe, deposits, invoicing, vendor payouts, financial compliance."
---

# Shared Payments

## Currency

- All amounts in **TZS** (Tanzanian Shilling)
- Stored as **integers** (no floating point) — e.g., 500000 = TZS 500,000
- Display with thousand separators: `new Intl.NumberFormat('en-TZ').format(amount)`
- International payments via Stripe use USD conversion

## Mobile Money Integration

| Provider | Coverage | API |
|----------|----------|-----|
| M-Pesa (Vodacom) | ~40% market share | Vodacom M-Pesa API |
| Airtel Money | ~25% market share | Airtel Money API |
| Tigo Pesa | ~20% market share | Tigo Pesa API |

### Mobile Money Flow

```
1. Client selects mobile money provider
2. Client enters phone number
3. System sends payment request to provider API
4. Provider sends USSD push to client's phone
5. Client confirms with PIN on their phone
6. Provider sends webhook callback with status
7. System updates booking payment status
```

### Webhook Handling

- Verify webhook signatures from each provider
- Idempotent processing (handle duplicate callbacks)
- Store raw webhook payload for audit trail
- Update booking status on successful payment

## Stripe (International Payments)

- Payment Intents API for card payments
- Webhook endpoint at `/api/webhooks/stripe`
- Support for USD/EUR for international clients

## Deposit & Balance Tracking

| Field | Type | Description |
|-------|------|-------------|
| `total_amount` | integer | Full booking price in TZS |
| `deposit_amount` | integer | Required deposit (typically 30-50%) |
| `deposit_paid_at` | timestamptz | When deposit was confirmed |
| `balance_amount` | integer | Remaining after deposit |
| `balance_due_date` | date | When balance is due |
| `payment_method` | enum | `mpesa`, `airtel`, `tigo`, `stripe`, `bank_transfer` |

## Business Rules

- Deposit required before booking confirmation (status: `deposit_pending` -> `confirmed`)
- Cancellation after `contract_sent`: deposit is non-refundable
- Cancellation before `contract_sent`: full refund
- Vendor payouts processed after service completion + 48h hold

## Vendor Payouts

- Platform takes commission percentage per transaction
- Payouts via mobile money (vendor's registered number)
- Payout schedule: weekly batch or on-demand for premium vendors
- All payout records stored for financial compliance

## Financial Compliance (Tanzania)

- Transaction records retained for 7 years
- TRA (Tanzania Revenue Authority) reporting requirements
- Electronic receipts for all payments
- Audit trail: every payment state change logged with timestamp
