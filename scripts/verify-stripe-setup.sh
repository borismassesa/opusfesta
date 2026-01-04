#!/bin/bash

# Verify Stripe Setup
# This script checks if Stripe is properly configured

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Verifying Stripe Setup${NC}"
echo "=============================="
echo ""

cd apps/website

# Check 1: Environment file exists
echo -e "${BLUE}1. Checking environment file...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "   Create it with: touch .env.local"
    echo ""
fi

# Check 2: Stripe secret key
echo -e "${BLUE}2. Checking STRIPE_SECRET_KEY...${NC}"
if grep -q "STRIPE_SECRET_KEY=sk_" .env.local 2>/dev/null; then
    echo -e "${GREEN}✅ STRIPE_SECRET_KEY is set${NC}"
    KEY_TYPE=$(grep "STRIPE_SECRET_KEY" .env.local | grep -o "sk_test\|sk_live" || echo "unknown")
    echo "   Key type: $KEY_TYPE"
else
    echo -e "${RED}❌ STRIPE_SECRET_KEY not found or invalid${NC}"
    echo "   Add it to .env.local: STRIPE_SECRET_KEY=sk_test_..."
fi
echo ""

# Check 3: Webhook secret
echo -e "${BLUE}3. Checking STRIPE_WEBHOOK_SECRET...${NC}"
if grep -q "STRIPE_WEBHOOK_SECRET=whsec_" .env.local 2>/dev/null; then
    echo -e "${GREEN}✅ STRIPE_WEBHOOK_SECRET is set${NC}"
else
    echo -e "${YELLOW}⚠️  STRIPE_WEBHOOK_SECRET not set${NC}"
    echo "   For local dev: Run 'stripe listen' and copy the secret"
    echo "   Add it to .env.local: STRIPE_WEBHOOK_SECRET=whsec_..."
fi
echo ""

# Check 4: Stripe package installed
echo -e "${BLUE}4. Checking Stripe package...${NC}"
if npm list stripe >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Stripe package is installed${NC}"
    VERSION=$(npm list stripe 2>/dev/null | grep stripe | head -1 | awk '{print $2}' | tr -d '@')
    echo "   Version: $VERSION"
else
    echo -e "${RED}❌ Stripe package not installed${NC}"
    echo "   Install with: npm install stripe"
fi
echo ""

# Check 5: Database migration
echo -e "${BLUE}5. Checking database migration...${NC}"
echo -e "${YELLOW}⚠️  Manual check required${NC}"
echo "   Run this SQL in Supabase to verify:"
echo "   SELECT table_name FROM information_schema.tables"
echo "   WHERE table_schema = 'public'"
echo "   AND table_name IN ('invoices', 'payments', 'payouts', 'payment_methods');"
echo ""

# Summary
echo -e "${BLUE}📋 Summary${NC}"
echo "=========="
echo ""
echo "Next steps:"
echo "1. ✅ Ensure .env.local has STRIPE_SECRET_KEY"
echo "2. ✅ Install Stripe: npm install stripe"
echo "3. ✅ Set up webhook: stripe listen (for local) or configure in Stripe Dashboard (for production)"
echo "4. ✅ Apply database migration: supabase/migrations/012_payments_invoices.sql"
echo ""
echo "For detailed instructions, see: docs/STRIPE_SETUP_GUIDE.md"
