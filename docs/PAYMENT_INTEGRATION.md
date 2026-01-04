# Payment Integration Guide

## Overview

The payment system is now fully integrated into the booking process. Customers can view invoices and make payments directly from their inquiry page.

## Components

### 1. Invoice List Component (`InvoiceList.tsx`)
- Displays all invoices for a specific inquiry
- Shows invoice details, payment history, and payment status
- Allows customers to initiate payments

### 2. Payment Form Component (`InvoicePaymentForm.tsx`)
- Handles Stripe card payments
- Supports mobile money (placeholder for future implementation)
- Real-time payment status updates

## API Routes

### Get Inquiry Invoices
```
GET /api/inquiries/[id]/invoices
```
Returns all invoices for a specific inquiry with payment history.

### Create Payment Intent
```
POST /api/payments/intent
Body: {
  invoiceId: string;
  inquiryId: string;
  amount: number; // in cents
  currency: string;
  method: 'stripe';
  customerEmail?: string;
  customerName?: string;
}
```
Creates a Stripe payment intent and payment record.

### Get Payment Status
```
GET /api/payments/[id]/status
```
Returns current payment status with real-time Stripe sync.

## Integration Steps

### 1. Install Stripe Packages
```bash
cd apps/website
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Set Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Use InvoiceList Component
```tsx
import { InvoiceList } from "@/components/payments/InvoiceList";

<InvoiceList 
  inquiryId={inquiry.id}
  onPaymentSuccess={() => {
    // Refresh data or show success message
  }}
/>
```

## Payment Flow

1. **Inquiry Submitted**: Customer submits inquiry via booking sidebar
2. **Vendor Accepts**: Vendor accepts inquiry and creates invoice
3. **Invoice Displayed**: Customer sees invoice in inquiry page
4. **Payment Initiated**: Customer clicks "Pay" button
5. **Stripe Payment**: Customer enters card details and confirms
6. **Webhook Processing**: Stripe webhook updates payment status
7. **Invoice Updated**: Invoice status automatically updates to PAID

## Status Workflow

### Invoice Status
- `DRAFT` → `PENDING` → `PAID` / `PARTIALLY_PAID` / `OVERDUE` / `CANCELLED`

### Payment Status
- `PENDING` → `PROCESSING` → `SUCCEEDED` / `FAILED` / `CANCELLED`
- `SUCCEEDED` → `REFUNDED` / `PARTIALLY_REFUNDED`

## Database Triggers

The system uses database triggers to automatically:
- Update invoice `paid_amount` when payment succeeds
- Update invoice `status` based on payment amounts
- Sync payment status with Stripe webhooks

## Testing

1. Create an inquiry
2. Vendor accepts and creates invoice
3. View invoice in inquiry page
4. Click "Pay" button
5. Use Stripe test card: `4242 4242 4242 4242`
6. Verify payment status updates

## Next Steps

- [ ] Add mobile money payment integration (MPESA, Airtel Money, etc.)
- [ ] Add payment method saving
- [ ] Add payment receipts/confirmation emails
- [ ] Add refund functionality UI
- [ ] Add payment analytics dashboard
