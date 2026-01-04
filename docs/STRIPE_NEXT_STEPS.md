# Stripe Setup - Next Steps After Webhook Secret

You've completed the initial Stripe setup! Here's what to do next.

## ✅ Completed Steps

- [x] Stripe CLI installed
- [x] Logged into Stripe
- [x] Webhook forwarding set up
- [x] Webhook secret obtained

## 📝 Step 1: Add Webhook Secret to Environment

You have the webhook secret (starts with `whsec_...`). Add it to your `.env.local`:

### Option A: Using the Script

```bash
./scripts/add-stripe-webhook-secret.sh whsec_YOUR_SECRET_HERE
```

### Option B: Manual Edit

1. Open `apps/website/.env.local`:
   ```bash
   cd apps/website
   code .env.local  # or use your preferred editor
   ```

2. Add or update this line:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```

3. Your `.env.local` should now have:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 🔍 Step 2: Verify Your Setup

Run the verification script:

```bash
./scripts/verify-stripe-setup.sh
```

This will check:
- ✅ Environment file exists
- ✅ STRIPE_SECRET_KEY is set
- ✅ STRIPE_WEBHOOK_SECRET is set
- ✅ Stripe package is installed
- ⚠️ Database migration status (manual check needed)

## 🗄️ Step 3: Apply Database Migration

Make sure the payment tables exist:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create a new query
3. Copy and paste the contents of:
   ```
   supabase/migrations/012_payments_invoices.sql
   ```
4. Click **"Run"** to execute

5. Verify tables were created:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('invoices', 'payments', 'payouts', 'payment_methods');
   ```

You should see all 4 tables.

## 🧪 Step 4: Test the Integration

### 4.1 Start Your Development Server

```bash
cd apps/website
npm run dev
```

### 4.2 Keep Webhook Listener Running

In a separate terminal, keep this running:
```bash
stripe listen --forward-to localhost:3000/api/payments/webhook/stripe
```

### 4.3 Test Payment Intent Creation

You'll need:
1. A test invoice in the database
2. Your authentication token

**Create a test invoice first:**
```sql
-- Get an inquiry ID
SELECT id, vendor_id, user_id, status 
FROM inquiries 
WHERE status = 'accepted' 
LIMIT 1;

-- Create a test invoice (replace IDs with actual values)
INSERT INTO invoices (
  inquiry_id,
  vendor_id,
  user_id,
  invoice_number,
  type,
  status,
  subtotal,
  total_amount,
  currency,
  issue_date,
  due_date
)
VALUES (
  'inquiry-id-here',
  'vendor-id-here',
  'user-id-here',
  (SELECT generate_invoice_number()),
  'FULL_PAYMENT',
  'PENDING',
  100.00,
  100.00,
  'USD',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days'
)
RETURNING id, invoice_number;
```

**Then test the API:**
```bash
export USER_TOKEN="your-jwt-token"
export INVOICE_ID="invoice-id-from-above"

curl -X POST http://localhost:3000/api/payments/intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "invoiceId": "'"$INVOICE_ID"'",
    "method": "stripe",
    "customerEmail": "test@example.com"
  }'
```

## 📊 Step 5: Monitor Webhook Events

With `stripe listen` running, you'll see events in real-time:

```
2025-01-01 10:00:00   --> payment_intent.created [evt_xxx]
2025-01-01 10:00:01   <-- [200] POST http://localhost:3000/api/payments/webhook/stripe
```

## 🎯 Step 6: Test with Stripe Test Cards

When you integrate the frontend, use these test cards:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

Use any:
- Future expiry (e.g., 12/34)
- Any 3-digit CVC
- Any postal code

## 🔄 Step 7: Restart Your Dev Server

After adding the webhook secret, restart your dev server to load the new environment variable:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd apps/website
npm run dev
```

## ✅ Verification Checklist

- [ ] Webhook secret added to `.env.local`
- [ ] Database migration applied
- [ ] Stripe package installed (`npm install stripe`)
- [ ] Dev server restarted (to load new env vars)
- [ ] Webhook listener running (`stripe listen`)
- [ ] Test invoice created in database
- [ ] Payment intent API tested

## 🚀 Next Steps

Once everything is verified:

1. **Create Invoice Generation System** (P1-6.2)
   - API to generate invoices from inquiries
   - Invoice templates
   - PDF generation (optional)

2. **Payment Tracking** (P1-6.3)
   - Payment status updates
   - Payment history
   - Refund handling

3. **Integrate with Booking Flow** (P1-6.4)
   - Add payment step to booking process
   - Payment UI components
   - Success/failure handling

## 🆘 Troubleshooting

### Issue: Webhook not receiving events

**Check:**
- Is `stripe listen` still running?
- Is the webhook secret correct in `.env.local`?
- Did you restart the dev server after adding the secret?

### Issue: "Stripe is not configured"

**Check:**
- Is `STRIPE_SECRET_KEY` in `.env.local`?
- Did you restart the dev server?
- Check server logs for detailed errors

### Issue: Database errors

**Check:**
- Was migration applied successfully?
- Do the tables exist? (run verification query)
- Check RLS policies if access denied

## 📚 Resources

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe Testing:** https://stripe.com/docs/testing
- **Webhook Events:** https://stripe.com/docs/api/events/types

---

**You're all set!** Your Stripe integration is ready to use. 🎉
