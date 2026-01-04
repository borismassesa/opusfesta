# Mobile Money Manual Verification System

## Overview

This system allows customers to pay via mobile money (M-PESA, Airtel Money, Tigo Pesa, etc.) by:
1. Vendors provide their mobile money payment numbers (LIPA Namba)
2. Customers make direct payments to vendor's mobile money number
3. Customers upload payment receipt as proof
4. Vendors verify receipts manually
5. Payment is processed once verified

## Benefits

- ✅ **No API fees** - Direct mobile money payments
- ✅ **Lower costs** - No third-party payment gateway fees
- ✅ **Simple implementation** - No complex integrations
- ✅ **Common practice** - Familiar to Tanzanian customers
- ✅ **Works with all providers** - M-PESA, Airtel Money, Tigo Pesa, Halo Pesa

## System Flow

### 1. Vendor Setup
Vendors add their mobile money payment numbers in settings:
```json
{
  "mobile_money_accounts": [
    {
      "provider": "MPESA",
      "phone_number": "+255123456789",
      "account_name": "Business Name",
      "is_primary": true
    }
  ]
}
```

### 2. Customer Payment
1. Customer selects "Mobile Money" payment method
2. System shows vendor's mobile money number and payment instructions
3. Customer makes payment directly to vendor's number
4. Customer uploads receipt screenshot
5. Customer enters transaction/receipt number
6. Payment status: **PENDING** (waiting for verification)

### 3. Vendor Verification
1. Vendor receives notification of pending receipt
2. Vendor reviews receipt image and details
3. Vendor verifies payment matches invoice amount
4. Vendor approves or rejects receipt
5. If approved:
   - Payment status: **SUCCEEDED**
   - Payment split triggered (10% platform, 90% vendor)
   - Invoice updated to PAID

## Database Schema

### `vendors.mobile_money_accounts` (JSONB)
Stores vendor's mobile money payment numbers:
```json
[
  {
    "provider": "MPESA",
    "phone_number": "+255123456789",
    "account_name": "Business Name",
    "is_primary": true
  }
]
```

### `payment_receipts` Table
Stores uploaded receipts and verification status:
- `receipt_image_url` - Uploaded receipt image
- `receipt_number` - Transaction ID from mobile money
- `payment_provider` - MPESA, AIRTEL_MONEY, etc.
- `phone_number` - Customer's phone number
- `status` - pending, verified, rejected
- `verified_by` - Vendor/admin who verified
- `verified_at` - Verification timestamp

## API Endpoints

### Submit Receipt
```
POST /api/payments/receipts
Body: {
  paymentId: string;
  invoiceId: string;
  receiptImageUrl: string;
  receiptNumber: string;
  paymentProvider: string;
  phoneNumber: string;
  amount: number;
  currency: string;
  paymentDate?: string;
  notes?: string;
}
```

### Verify Receipt
```
POST /api/payments/receipts/[id]/verify
Body: {
  isApproved: boolean;
  notes?: string;
}
```

### Get Receipts
```
GET /api/payments/receipts?paymentId=xxx&status=pending
```

## Components

### `MobileMoneyPaymentInstructions`
- Shows vendor's mobile money number
- Payment instructions
- Receipt upload form
- Transaction number input

### `InvoiceList`
- Integrated payment method selection
- Shows card or mobile money options
- Fetches vendor mobile money accounts

## Storage

Receipt images are stored in Supabase Storage:
- Bucket: `payment-receipts`
- Path: `{user_id}/{invoice_id}/{timestamp}.{ext}`
- Public URLs for vendor viewing

## Verification Workflow

### Automatic (via Database Function)
When receipt is verified:
1. `verify_payment_receipt()` function called
2. Updates receipt status
3. Updates payment to SUCCEEDED
4. Triggers payment split (10%/90%)
5. Creates revenue records

### Manual Verification
Vendors can verify receipts via:
- Vendor dashboard
- API endpoint
- Admin panel

## Security

- ✅ RLS policies enforce access control
- ✅ Users can only submit receipts for their payments
- ✅ Vendors can only verify receipts for their invoices
- ✅ Admins can view all receipts
- ✅ Receipt images stored securely in Supabase Storage

## Next Steps

1. **Vendor Settings UI** - Add mobile money account management
2. **Vendor Dashboard** - Receipt verification interface
3. **Notifications** - Alert vendors of pending receipts
4. **Receipt Validation** - Optional: OCR to extract transaction details
5. **Auto-verification** - Optional: Verify receipts automatically (future)

## Migration

Run migration to add mobile money support:
```bash
supabase migration up 014_mobile_money_payment_numbers
```

This creates:
- `mobile_money_accounts` field on vendors
- `payment_receipts` table
- Verification function
- RLS policies
