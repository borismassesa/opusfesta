# Stripe Integration - Step-by-Step Setup Guide

This guide will walk you through connecting your OpusFesta application with Stripe for payment processing.

## Prerequisites

- A Stripe account (create one at https://stripe.com if you don't have one)
- Access to your Supabase project
- Access to your website app environment variables

---

## Step 1: Create or Access Your Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click **"Sign in"** (if you have an account) or **"Start now"** (to create one)
3. Complete the signup process if creating a new account
4. Verify your email address

**Note:** Start with **Test mode** for development. You can switch to **Live mode** later.

---

## Step 2: Get Your API Keys

### 2.1 Navigate to API Keys

1. Once logged in, click on **"Developers"** in the left sidebar
2. Click **"API keys"** (or go directly to: https://dashboard.stripe.com/test/apikeys)

### 2.2 Copy Your Secret Key

1. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...` or `pk_live_...`)
   - **Secret key** (starts with `sk_test_...` or `sk_live_...`)

2. Click **"Reveal test key"** or **"Reveal live key"** next to the Secret key
3. **Copy the Secret key** - you'll need this for your environment variables

   ⚠️ **Important:** Keep this key secret! Never commit it to version control.

### 2.3 Copy Your Publishable Key (Optional - for frontend)

If you plan to use Stripe Elements in the frontend, you'll also need the Publishable key.

---

## Step 3: Configure Environment Variables

### 3.1 Locate Your Environment File

Navigate to your website app directory:
```bash
cd apps/website
```

### 3.2 Create or Edit `.env.local`

Create the file if it doesn't exist:
```bash
touch .env.local
```

Or edit the existing file:
```bash
code .env.local  # or use your preferred editor
```

### 3.3 Add Stripe Keys

Add these lines to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Webhook secret (we'll get this in the next step)
STRIPE_WEBHOOK_SECRET=
```

**Replace:**
- `sk_test_YOUR_SECRET_KEY_HERE` with your actual Secret key from Step 2.2
- `pk_test_YOUR_PUBLISHABLE_KEY_HERE` with your Publishable key (if using frontend)

**Example:**
```env
STRIPE_SECRET_KEY=sk_test_51AbC123XyZ789...
STRIPE_PUBLISHABLE_KEY=pk_test_51AbC123XyZ789...
STRIPE_WEBHOOK_SECRET=
```

### 3.4 Verify Your Environment File

Make sure `.env.local` is in your `.gitignore`:
```bash
# Check if .env.local is ignored
cat .gitignore | grep .env.local
```

If not, add it:
```bash
echo ".env.local" >> .gitignore
```

---

## Step 4: Set Up Stripe Webhooks

Webhooks allow Stripe to notify your application when payment events occur.

### 4.1 Start Your Development Server

You'll need your app running to receive webhooks. Start it:

```bash
cd apps/website
npm run dev
```

Your app should be running on `http://localhost:3000` (or another port).

### 4.2 Use Stripe CLI (Recommended for Development)

The easiest way to test webhooks locally is using Stripe CLI:

#### Install Stripe CLI:

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download from: https://github.com/stripe/stripe-cli/releases
# Or use package manager
```

**Windows:**
Download from: https://github.com/stripe/stripe-cli/releases

#### Login to Stripe CLI:

```bash
stripe login
```

This will open your browser to authorize the CLI.

#### Forward Webhooks to Your Local Server:

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

**Copy the webhook signing secret** (starts with `whsec_...`)

#### Update Your Environment File:

Add the webhook secret to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 4.3 Set Up Webhooks in Stripe Dashboard (For Production)

When you're ready for production:

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your production URL:
   ```
   https://your-domain.com/api/payments/webhook/stripe
   ```
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Click **"Add endpoint"**
6. Click on the endpoint to view details
7. Click **"Reveal"** next to **"Signing secret"**
8. Copy the secret (starts with `whsec_...`)
9. Add it to your production environment variables

---

## Step 5: Install Stripe Package

Make sure the Stripe package is installed:

```bash
cd apps/website
npm install stripe
```

Verify it's in `package.json`:
```bash
grep stripe package.json
```

You should see:
```json
"stripe": "^17.4.0"
```

---

## Step 6: Apply Database Migration

Make sure the payment tables exist in your database:

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of:
   ```
   supabase/migrations/012_payments_invoices.sql
   ```
5. Click **"Run"** to execute the migration

Verify the tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('invoices', 'payments', 'payouts', 'payment_methods');
```

You should see all 4 tables listed.

---

## Step 7: Test the Integration

### 7.1 Test Payment Intent Creation

You can test using curl or a tool like Postman:

```bash
# First, get your auth token (from your app login)
export USER_TOKEN="your-jwt-token-here"
export INVOICE_ID="test-invoice-id"  # You'll need to create a test invoice first

# Create payment intent
curl -X POST http://localhost:3000/api/payments/intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "invoiceId": "'"$INVOICE_ID"'",
    "method": "stripe",
    "customerEmail": "test@example.com"
  }'
```

### 7.2 Test with Stripe Test Cards

Stripe provides test card numbers for testing:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

Use any:
- Future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any postal code

### 7.3 Monitor Webhook Events

With Stripe CLI running (`stripe listen`), you'll see webhook events in real-time:

```
2025-01-01 10:00:00   --> payment_intent.succeeded [evt_xxx]
2025-01-01 10:00:01   <-- [200] POST http://localhost:3000/api/payments/webhook/stripe [evt_xxx]
```

---

## Step 8: Verify Everything Works

### 8.1 Check Environment Variables

```bash
cd apps/website
# Verify variables are loaded (don't print actual values)
node -e "console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set ✓' : 'Missing ✗')"
```

### 8.2 Test Database Connection

Run a query to verify tables exist:
```sql
SELECT COUNT(*) FROM invoices;
SELECT COUNT(*) FROM payments;
```

### 8.3 Check Logs

When testing payments, check your server logs for:
- Payment intent creation
- Webhook processing
- Database updates

---

## Step 9: Switch to Live Mode (When Ready)

When you're ready for production:

1. **Switch to Live mode** in Stripe Dashboard (toggle in top right)
2. **Get Live API keys:**
   - Go to Developers → API keys
   - Copy the **Live** secret key (starts with `sk_live_...`)
3. **Update environment variables** with live keys
4. **Set up production webhook** (Step 4.3)
5. **Test with real card** (use your own card with small amount first)

---

## Troubleshooting

### Issue: "Stripe is not configured"

**Solution:** Check that `STRIPE_SECRET_KEY` is set in your `.env.local` file and restart your dev server.

### Issue: Webhook signature verification fails

**Solution:** 
- Make sure `STRIPE_WEBHOOK_SECRET` is set correctly
- For local development, use the secret from `stripe listen`
- For production, use the secret from Stripe Dashboard

### Issue: Payment intent creation fails

**Solution:**
- Verify your Stripe secret key is correct
- Check that the Stripe package is installed: `npm list stripe`
- Check server logs for detailed error messages

### Issue: Database errors

**Solution:**
- Verify migration was applied: Check if tables exist
- Check RLS policies: Make sure user has access
- Verify Supabase connection: Check environment variables

---

## Security Checklist

- ✅ `.env.local` is in `.gitignore`
- ✅ Never commit API keys to version control
- ✅ Use test keys for development
- ✅ Use environment variables, not hardcoded keys
- ✅ Rotate keys if accidentally exposed
- ✅ Use HTTPS in production
- ✅ Verify webhook signatures

---

## Next Steps

Once Stripe is connected:

1. **Create invoice generation system** (P1-6.2)
2. **Test payment flow** end-to-end
3. **Set up payment tracking** (P1-6.3)
4. **Integrate with booking process** (P1-6.4)

---

## Support Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe API Reference:** https://stripe.com/docs/api
- **Stripe Testing:** https://stripe.com/docs/testing
- **Stripe Support:** https://support.stripe.com

---

## Quick Reference

**Environment Variables Needed:**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Optional
STRIPE_WEBHOOK_SECRET=whsec_...
```

**API Endpoints:**
- `POST /api/payments/intent` - Create payment intent
- `GET /api/payments/[id]/status` - Get payment status
- `POST /api/payments/webhook/stripe` - Webhook handler

**Stripe CLI Commands:**
```bash
stripe login                    # Login to Stripe
stripe listen                   # Forward webhooks locally
stripe trigger payment_intent.succeeded  # Trigger test event
```
