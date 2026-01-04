#!/bin/bash

# Add Stripe Webhook Secret to .env.local
# Usage: ./scripts/add-stripe-webhook-secret.sh whsec_xxxxx

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

WEBHOOK_SECRET=$1

if [ -z "$WEBHOOK_SECRET" ]; then
    echo -e "${YELLOW}Usage: ./scripts/add-stripe-webhook-secret.sh whsec_xxxxx${NC}"
    echo ""
    echo "To get your webhook secret:"
    echo "1. Run: stripe listen --forward-to localhost:3000/api/payments/webhook/stripe"
    echo "2. Copy the 'whsec_xxxxx' value from the output"
    echo "3. Run this script with that value"
    exit 1
fi

cd apps/website

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    touch .env.local
fi

# Check if STRIPE_WEBHOOK_SECRET already exists
if grep -q "STRIPE_WEBHOOK_SECRET" .env.local; then
    echo -e "${YELLOW}Updating existing STRIPE_WEBHOOK_SECRET...${NC}"
    # Update existing line
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|" .env.local
    else
        # Linux
        sed -i "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|" .env.local
    fi
else
    echo -e "${BLUE}Adding STRIPE_WEBHOOK_SECRET...${NC}"
    echo "" >> .env.local
    echo "# Stripe Webhook Secret" >> .env.local
    echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> .env.local
fi

echo -e "${GREEN}✅ Webhook secret added to .env.local${NC}"
echo ""
echo "Current STRIPE_WEBHOOK_SECRET value:"
grep "STRIPE_WEBHOOK_SECRET" .env.local
