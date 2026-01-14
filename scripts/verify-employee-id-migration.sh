#!/bin/bash

# Verify and apply employee_id column migration
# This script checks if the employee_id column exists and provides instructions to fix it

set -e

echo "🔍 Verifying employee_id column migration"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found.${NC}"
    echo "You can still apply the migration manually via Supabase Dashboard."
    echo ""
    echo "To apply the migration:"
    echo "1. Go to Supabase Dashboard → SQL Editor"
    echo "2. Copy and paste the contents of: supabase/migrations/043_add_employee_id_number.sql"
    echo "3. Click 'Run' to execute"
    echo ""
    exit 0
fi

echo -e "${BLUE}Step 1: Checking if employee_id column exists...${NC}"

# Check if column exists
COLUMN_CHECK=$(supabase db query "
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'employee_id'
);
" --format json 2>/dev/null || echo "[]")

if [[ "$COLUMN_CHECK" == *"true"* ]] || [[ "$COLUMN_CHECK" == *"t"* ]]; then
    echo -e "${GREEN}✅ employee_id column exists${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  If you're still getting the error, the schema cache may need to be refreshed.${NC}"
    echo ""
    echo "To refresh the schema cache:"
    echo "1. Go to Supabase Dashboard → Settings → API"
    echo "2. Click 'Reload schema cache' or wait a few minutes for automatic refresh"
    echo ""
    exit 0
else
    echo -e "${RED}❌ employee_id column not found${NC}"
    echo ""
    echo -e "${BLUE}Step 2: Applying migration...${NC}"
    echo ""
    
    # Try to apply the migration
    if [ -f "supabase/migrations/043_add_employee_id_number.sql" ]; then
        echo "Found migration file. Applying..."
        supabase db push --include-all 2>/dev/null || {
            echo -e "${YELLOW}⚠️  Could not apply migration automatically.${NC}"
            echo ""
            echo "Please apply the migration manually:"
            echo ""
            echo "Option 1: Via Supabase Dashboard"
            echo "1. Go to Supabase Dashboard → SQL Editor"
            echo "2. Copy and paste the contents of: supabase/migrations/043_add_employee_id_number.sql"
            echo "3. Click 'Run' to execute"
            echo ""
            echo "Option 2: Via Supabase CLI"
            echo "Run: supabase db push"
            echo ""
            exit 1
        }
        
        echo -e "${GREEN}✅ Migration applied successfully${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Note: The schema cache may take a few minutes to refresh automatically.${NC}"
        echo "If the error persists, refresh the schema cache in Supabase Dashboard → Settings → API"
    else
        echo -e "${RED}❌ Migration file not found: supabase/migrations/043_add_employee_id_number.sql${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✅ Verification complete${NC}"
