# LIPA NAMBA Setup Guide

## What is LIPA NAMBA?

**LIPA NAMBA** (also called "Pay Number" or "Payment Code") is a unique merchant code used for mobile money payments in Tanzania. It's typically an 8-digit number that customers enter when making payments via USSD.

Unlike phone numbers, LIPA NAMBA is:
- A payment code (e.g., "57020159", "12802655")
- Displayed in individual digit boxes
- Used in USSD payment flows
- Provider-specific (each mobile money provider has its own LIPA NAMBA)

## Database Schema

The `platform_mobile_money_accounts` table stores OpusFesta's LIPA NAMBA codes:

```sql
CREATE TABLE platform_mobile_money_accounts (
  id UUID PRIMARY KEY,
  provider VARCHAR(50) NOT NULL, -- MPESA, AIRTEL_MONEY, TIGO_PESA, HALO_PESA
  lipa_namba VARCHAR(20) NOT NULL UNIQUE, -- Payment code (e.g., "57020159")
  account_name VARCHAR(255) NOT NULL DEFAULT 'OpusFesta',
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  ...
);
```

## Setting Up LIPA NAMBA

### 1. Get LIPA NAMBA from Mobile Money Providers

Contact each provider to register for a merchant account and get your LIPA NAMBA:

- **M-PESA**: Contact Vodacom M-PESA Business
- **Airtel Money**: Contact Airtel Money Business Services
- **Tigo Pesa**: Contact Tigo Business Services
- **Halo Pesa**: Contact Halo Pesa Business

### 2. Update Database

```sql
-- Update M-PESA LIPA NAMBA
UPDATE platform_mobile_money_accounts
SET lipa_namba = '57020159', -- Replace with actual code
    account_name = 'OpusFesta'
WHERE provider = 'MPESA';

-- Update Airtel Money LIPA NAMBA
UPDATE platform_mobile_money_accounts
SET lipa_namba = '12802655', -- Replace with actual code
    account_name = 'OpusFesta'
WHERE provider = 'AIRTEL_MONEY';

-- Update Tigo Pesa LIPA NAMBA
UPDATE platform_mobile_money_accounts
SET lipa_namba = '15050478', -- Replace with actual code
    account_name = 'OpusFesta'
WHERE provider = 'TIGO_PESA';

-- Update Halo Pesa LIPA NAMBA
UPDATE platform_mobile_money_accounts
SET lipa_namba = '12345678', -- Replace with actual code
    account_name = 'OpusFesta'
WHERE provider = 'HALO_PESA';
```

### 3. Verify Display

The UI displays LIPA NAMBA in individual digit boxes:

```
LIPA NAMBA
[5] [7] [0] [2] [0] [1] [5] [9]

JINA (Name)
[OpusFesta]
```

## Payment Flow

1. Customer selects mobile money provider
2. System displays OpusFesta's LIPA NAMBA in digit boxes
3. Customer dials USSD code (e.g., *150*60# for M-PESA)
4. Customer enters LIPA NAMBA when prompted
5. Customer enters payment amount
6. Customer completes payment
7. Customer uploads receipt with transaction number

## USSD Codes (Reference)

- **M-PESA**: *150*60# or *150*00#
- **Airtel Money**: *150*60# or *150*00#
- **Tigo Pesa**: *150*01# or *150*00#
- **Halo Pesa**: *150*60# or *150*00#

*Note: USSD codes may vary. Check with each provider for current codes.*

## UI Display

The payment instructions component displays:

1. **Header**: "LIPA KWA SIMU" (Pay by Phone)
2. **LIPA NAMBA**: Individual digit boxes (8 digits)
3. **JINA (Name)**: Account name in a box
4. **Provider Info**: Selected mobile money provider
5. **Amount**: Payment amount
6. **Instructions**: Step-by-step payment guide

## API Endpoint

**GET** `/api/platform/mobile-money`

Returns:
```json
{
  "accounts": [
    {
      "provider": "MPESA",
      "lipaNamba": "57020159",
      "accountName": "OpusFesta",
      "isPrimary": true
    }
  ]
}
```

## Important Notes

- LIPA NAMBA is **not** a phone number
- Each provider has its own LIPA NAMBA
- LIPA NAMBA is typically 8 digits
- Display in individual digit boxes for clarity
- Customers enter LIPA NAMBA during USSD payment flow
