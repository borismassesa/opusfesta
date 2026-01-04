# Test Review Submission - Ready to Go! ✅

Your test data is now set up correctly:
- ✅ User: `boris.massesa@thefestaevents.com` (role: user)
- ✅ Inquiries: 2 eligible inquiries for Bella Photography Studio
- ✅ Event dates: In the past (2025-12-24)
- ✅ Status: Accepted

## Test Review Submission API

### Step 1: Get Your Authentication Token

You'll need a JWT token for your user. You can get this by:

**Option A: Via Supabase Dashboard**
1. Go to Supabase Dashboard → Authentication → Users
2. Find your user (`boris.massesa@thefestaevents.com`)
3. Click on the user → Copy the access token (or generate a new one)

**Option B: Via your app**
1. Log in through your website/app
2. Open browser DevTools → Application → Local Storage
3. Find the Supabase auth token

**Option C: Via API (if you have credentials)**
```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "boris.massesa@thefestaevents.com",
    "password": "YOUR_PASSWORD"
  }'
```

### Step 2: Submit a Review

```bash
# Set your token
export USER_TOKEN="your-jwt-token-here"
export VENDOR_ID="b0000002-0002-4002-8002-000000000002"  # Bella Photography
export INQUIRY_ID="ba0f7d62-5cdf-4018-ae62-81bf935a2156"  # One of your inquiries

# Submit review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "vendorId": "'"$VENDOR_ID"'",
    "inquiryId": "'"$INQUIRY_ID"'",
    "rating": 5,
    "title": "Amazing Photography Service!",
    "content": "Bella Photography Studio provided exceptional service for our wedding. The photos turned out beautifully and the team was professional throughout.",
    "eventType": "wedding",
    "eventDate": "2025-12-24"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "review": {
    "id": "review-uuid",
    "vendorId": "b0000002-0002-4002-8002-000000000002",
    "rating": 5,
    "moderationStatus": "approved",  // Auto-approved because inquiry is accepted
    "verified": true,
    "createdAt": "2025-12-31T..."
  }
}
```

### Step 3: Verify Review Was Created

```sql
SELECT 
  id,
  vendor_id,
  user_id,
  rating,
  title,
  content,
  moderation_status,
  verified,
  inquiry_id,
  created_at
FROM reviews
WHERE user_id = 'ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e'
ORDER BY created_at DESC
LIMIT 5;
```

### Step 4: Test Admin Moderation API

If the review was auto-approved, it should appear in the approved list. If not, test moderation:

```bash
# Get admin token (you'll need to create an admin user first)
export ADMIN_TOKEN="admin-jwt-token-here"
export REVIEW_ID="review-uuid-from-step-3"

# Get pending reviews
curl -X GET "http://localhost:3000/api/admin/reviews?status=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Approve a review
curl -X POST "http://localhost:3000/api/admin/reviews/$REVIEW_ID/moderate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "action": "approve",
    "notes": "Review looks good"
  }'
```

## Test Scenarios

### ✅ Success Case
- User with completed inquiry submits review
- Review is auto-approved (because inquiry is accepted)
- Review appears on vendor page

### ❌ Error Cases to Test

1. **Duplicate Review**
   ```bash
   # Try submitting a second review for the same vendor
   # Should fail with: "You have already submitted a review for this vendor"
   ```

2. **No Booking**
   ```bash
   # Try submitting review without a completed inquiry
   # Should fail with: "You can only review vendors you have booked with"
   ```

3. **Invalid Rating**
   ```bash
   # Try rating = 6 or rating = 0
   # Should fail with: "Rating must be between 1 and 5"
   ```

4. **Unauthenticated**
   ```bash
   # Try submitting without Authorization header
   # Should fail with: "Authentication required"
   ```

## Next Steps

1. ✅ Test review submission via API
2. ✅ Test admin moderation interface
3. ✅ Test review display on vendor page
4. ✅ Test vendor response functionality

## Troubleshooting

### Issue: "You can only review vendors you have booked with"
- **Solution:** Verify `can_user_review_vendor` function returns true:
  ```sql
  SELECT can_user_review_vendor(
    'ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e'::UUID,
    'b0000002-0002-4002-8002-000000000002'::UUID
  );
  ```

### Issue: "You have already submitted a review"
- **Solution:** Check for existing reviews:
  ```sql
  SELECT * FROM reviews 
  WHERE user_id = 'ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e'
    AND vendor_id = 'b0000002-0002-4002-8002-000000000002';
  ```

### Issue: Review not auto-approved
- **Solution:** Check inquiry status and event date:
  ```sql
  SELECT id, status, event_date, user_id
  FROM inquiries
  WHERE id = 'ba0f7d62-5cdf-4018-ae62-81bf935a2156';
  ```
