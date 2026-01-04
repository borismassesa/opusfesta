#!/bin/bash

# Test Review Submission API
# Usage: ./scripts/test-review-api.sh

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Review Submission API${NC}"
echo "===================================="
echo ""

# Check if API URL is set
API_URL=${API_URL:-"http://localhost:3000"}
echo -e "${YELLOW}API URL: ${API_URL}${NC}"
echo ""

# Check if tokens are set
if [ -z "$USER_TOKEN" ]; then
    echo -e "${RED}❌ USER_TOKEN not set${NC}"
    echo -e "${YELLOW}Please set it with:${NC}"
    echo "  export USER_TOKEN=\"your-jwt-token-here\""
    echo ""
    echo -e "${YELLOW}To get your token:${NC}"
    echo "  1. Log in through your app and check browser DevTools → Application → Local Storage"
    echo "  2. Or use Supabase Dashboard → Authentication → Users → Your User → Copy token"
    echo ""
    exit 1
fi

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  ADMIN_TOKEN not set (optional for admin tests)${NC}"
    echo ""
fi

# Test data
VENDOR_ID="b0000002-0002-4002-8002-000000000002"  # Bella Photography
INQUIRY_ID="ba0f7d62-5cdf-4018-ae62-81bf935a2156"  # One of your inquiries

echo -e "${BLUE}📝 Test 1: Submit Review${NC}"
echo "-------------------------"
echo ""

REVIEW_DATA=$(cat <<EOF
{
  "vendorId": "${VENDOR_ID}",
  "inquiryId": "${INQUIRY_ID}",
  "rating": 5,
  "title": "Amazing Photography Service!",
  "content": "Bella Photography Studio provided exceptional service for our wedding. The photos turned out beautifully and the team was professional throughout the entire event.",
  "eventType": "wedding",
  "eventDate": "2025-12-24"
}
EOF
)

echo "Submitting review..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/api/reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -d "${REVIEW_DATA}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ Review submitted successfully${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    # Extract review ID if possible
    REVIEW_ID=$(echo "$BODY" | jq -r '.review.id' 2>/dev/null || echo "")
    if [ -n "$REVIEW_ID" ] && [ "$REVIEW_ID" != "null" ]; then
        echo ""
        echo -e "${GREEN}Review ID: ${REVIEW_ID}${NC}"
        export REVIEW_ID
    fi
else
    echo -e "${RED}❌ Failed to submit review (HTTP ${HTTP_CODE})${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 Test 2: Get Pending Reviews (Admin)${NC}"
echo "----------------------------------------"
echo ""

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Skipping admin tests (ADMIN_TOKEN not set)${NC}"
else
    ADMIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}/api/admin/reviews?status=pending&limit=5" \
      -H "Authorization: Bearer ${ADMIN_TOKEN}")
    
    ADMIN_HTTP_CODE=$(echo "$ADMIN_RESPONSE" | tail -n1)
    ADMIN_BODY=$(echo "$ADMIN_RESPONSE" | sed '$d')
    
    if [ "$ADMIN_HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ Fetched pending reviews${NC}"
        echo "$ADMIN_BODY" | jq '.' 2>/dev/null || echo "$ADMIN_BODY"
    else
        echo -e "${RED}❌ Failed to fetch reviews (HTTP ${ADMIN_HTTP_CODE})${NC}"
        echo "$ADMIN_BODY" | jq '.' 2>/dev/null || echo "$ADMIN_BODY"
    fi
fi

echo ""
echo -e "${GREEN}✅ Test suite completed!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Check the review in the database:"
echo "   SELECT * FROM reviews WHERE user_id = 'ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e' ORDER BY created_at DESC LIMIT 1;"
echo ""
echo "2. Test the admin interface at /reviews"
echo ""
echo "3. Test the vendor page to see the review"
