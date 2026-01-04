#!/bin/bash

# Test script for Review Moderation System
# This script tests the review submission and moderation APIs

set -e

echo "🧪 Testing Review Moderation System"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase is running
echo "📋 Step 1: Checking Supabase connection..."
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check if migration has been applied
echo "📋 Step 2: Verifying migration 010_reviews_moderation.sql..."
MIGRATION_CHECK=$(supabase db query "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_moderation_status');" --format json 2>/dev/null || echo "[]")
if [[ "$MIGRATION_CHECK" == *"true"* ]] || [[ "$MIGRATION_CHECK" == *"t"* ]]; then
    echo -e "${GREEN}✅ Migration applied successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Migration may not be applied. Run: supabase migration up${NC}"
fi

echo ""
echo "📋 Step 3: Testing Database Functions..."
echo "----------------------------------------"

# Test can_user_review_vendor function
echo "Testing can_user_review_vendor function..."
# This will need actual UUIDs - we'll check if function exists
FUNCTION_CHECK=$(supabase db query "SELECT routine_name FROM information_schema.routines WHERE routine_name = 'can_user_review_vendor';" --format json 2>/dev/null || echo "[]")
if [[ "$FUNCTION_CHECK" == *"can_user_review_vendor"* ]]; then
    echo -e "${GREEN}✅ can_user_review_vendor function exists${NC}"
else
    echo -e "${RED}❌ can_user_review_vendor function not found${NC}"
fi

# Test approve_review function
APPROVE_CHECK=$(supabase db query "SELECT routine_name FROM information_schema.routines WHERE routine_name = 'approve_review';" --format json 2>/dev/null || echo "[]")
if [[ "$APPROVE_CHECK" == *"approve_review"* ]]; then
    echo -e "${GREEN}✅ approve_review function exists${NC}"
else
    echo -e "${RED}❌ approve_review function not found${NC}"
fi

# Test reject_review function
REJECT_CHECK=$(supabase db query "SELECT routine_name FROM information_schema.routines WHERE routine_name = 'reject_review';" --format json 2>/dev/null || echo "[]")
if [[ "$REJECT_CHECK" == *"reject_review"* ]]; then
    echo -e "${GREEN}✅ reject_review function exists${NC}"
else
    echo -e "${RED}❌ reject_review function not found${NC}"
fi

# Test flag_review function
FLAG_CHECK=$(supabase db query "SELECT routine_name FROM information_schema.routines WHERE routine_name = 'flag_review';" --format json 2>/dev/null || echo "[]")
if [[ "$FLAG_CHECK" == *"flag_review"* ]]; then
    echo -e "${GREEN}✅ flag_review function exists${NC}"
else
    echo -e "${RED}❌ flag_review function not found${NC}"
fi

echo ""
echo "📋 Step 4: Checking Review Table Structure..."
echo "--------------------------------------------"

# Check if moderation columns exist
COLUMNS_CHECK=$(supabase db query "SELECT column_name FROM information_schema.columns WHERE table_name = 'reviews' AND column_name IN ('moderation_status', 'inquiry_id', 'moderation_notes', 'flagged_reason');" --format json 2>/dev/null || echo "[]")
if [[ "$COLUMNS_CHECK" == *"moderation_status"* ]]; then
    echo -e "${GREEN}✅ Review table has moderation columns${NC}"
else
    echo -e "${RED}❌ Review table missing moderation columns${NC}"
fi

echo ""
echo "📋 Step 5: Testing API Endpoints (Manual Testing Required)"
echo "-----------------------------------------------------------"
echo ""
echo "To test the API endpoints, you'll need:"
echo ""
echo "1. A test user with an admin role:"
echo "   UPDATE users SET role = 'admin' WHERE email = 'your-admin@example.com';"
echo ""
echo "2. A test user with a completed inquiry:"
echo "   - Create an inquiry with status = 'accepted'"
echo "   - Ensure event_date is in the past"
echo ""
echo "3. Test Review Submission API:"
echo "   POST /api/reviews"
echo "   Headers: Authorization: Bearer <user_token>"
echo "   Body: {"
echo "     vendorId: '<vendor_id>',"
echo "     rating: 5,"
echo "     content: 'Great service!',"
echo "     title: 'Amazing experience'"
echo "   }"
echo ""
echo "4. Test Admin Moderation API:"
echo "   GET /api/admin/reviews?status=pending"
echo "   Headers: Authorization: Bearer <admin_token>"
echo ""
echo "   POST /api/admin/reviews/<review_id>/moderate"
echo "   Headers: Authorization: Bearer <admin_token>"
echo "   Body: {"
echo "     action: 'approve',"
echo "     notes: 'Looks good'"
echo "   }"
echo ""
echo "📋 Step 6: Quick Database Queries"
echo "---------------------------------"
echo ""
echo "Check pending reviews:"
echo "SELECT id, rating, moderation_status, created_at FROM reviews WHERE moderation_status = 'pending' LIMIT 5;"
echo ""
echo "Check review counts by status:"
echo "SELECT moderation_status, COUNT(*) FROM reviews GROUP BY moderation_status;"
echo ""
echo "Check if trigger is working (auto-approve for completed inquiries):"
echo "SELECT r.id, r.moderation_status, r.verified, i.status as inquiry_status"
echo "FROM reviews r"
echo "LEFT JOIN inquiries i ON r.inquiry_id = i.id"
echo "WHERE r.inquiry_id IS NOT NULL;"
echo ""

echo -e "${GREEN}✅ Test script completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Run the database queries above to verify data"
echo "2. Test the API endpoints using curl or Postman"
echo "3. Access the admin interface at /reviews in the admin app"
