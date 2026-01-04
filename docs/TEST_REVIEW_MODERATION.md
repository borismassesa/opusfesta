# Review Moderation System - Testing Guide

This guide walks you through testing the complete review moderation system.

## Prerequisites

1. **Supabase is running** and migrations are applied
2. **Test data setup** (see below)
3. **Admin user** with `role = 'admin'` in the `users` table
4. **Regular user** with a completed inquiry/booking

## Step 1: Verify Migration

Run the migration check script:

```bash
./scripts/test-review-moderation.sh
```

Or manually check:

```sql
-- Check if moderation status enum exists
SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_moderation_status');

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('can_user_review_vendor', 'approve_review', 'reject_review', 'flag_review');

-- Check if columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name IN ('moderation_status', 'inquiry_id', 'moderation_notes', 'flagged_reason');
```

## Step 2: Set Up Test Data

### 2.1 Create Admin User

```sql
-- Find or create an admin user
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@thefesta.com';

-- Or create a new admin user (if using Supabase Auth)
-- Then update the users table:
INSERT INTO users (id, email, name, role)
VALUES (
  'admin-user-uuid-here',
  'admin@thefesta.com',
  'Admin User',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### 2.2 Create Test User with Completed Inquiry

```sql
-- 1. Get a vendor ID
SELECT id, business_name FROM vendors LIMIT 1;

-- 2. Create or get a test user
-- (Assuming you have a user from Supabase Auth)
-- Get user ID from auth.users or create one

-- 3. Create a completed inquiry (required for review submission)
INSERT INTO inquiries (
  vendor_id,
  user_id,
  name,
  email,
  event_type,
  event_date,
  status,
  message
)
VALUES (
  'vendor-id-here',           -- Replace with actual vendor ID
  'user-id-here',             -- Replace with actual user ID
  'Test User',
  'test@example.com',
  'wedding',
  CURRENT_DATE - INTERVAL '7 days',  -- Event in the past (required for review)
  'accepted',                 -- Must be 'accepted' or 'responded'
  'Test inquiry for review testing'
)
RETURNING id, vendor_id, user_id, status;
```

### 2.3 Get Test Data IDs

```sql
-- Get vendor ID
SELECT id, business_name FROM vendors LIMIT 1;

-- Get user ID (if you need it)
SELECT id, email FROM auth.users LIMIT 1;

-- Get inquiry ID
SELECT id, vendor_id, user_id, status, event_date 
FROM inquiries 
WHERE status IN ('accepted', 'responded')
AND event_date <= CURRENT_DATE
LIMIT 1;
```

## Step 3: Test Review Submission

### 3.1 Get Authentication Tokens

You'll need JWT tokens for:
- **User token**: Regular user who will submit reviews
- **Admin token**: Admin user who will moderate reviews

To get tokens, you can:
1. Log in through your app and get the token from browser dev tools
2. Use Supabase Auth API directly
3. Use the Supabase client in a test script

### 3.2 Submit a Review (API Test)

```bash
# Set environment variables
export USER_TOKEN="your-user-jwt-token"
export VENDOR_ID="vendor-uuid-here"
export INQUIRY_ID="inquiry-uuid-here"  # Optional but recommended

# Test review submission
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "vendorId": "'"$VENDOR_ID"'",
    "rating": 5,
    "title": "Amazing Service!",
    "content": "This vendor provided excellent service. Highly recommended!",
    "eventType": "wedding",
    "eventDate": "2024-01-15",
    "inquiryId": "'"$INQUIRY_ID"'"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "review": {
    "id": "review-uuid",
    "vendorId": "vendor-uuid",
    "rating": 5,
    "moderationStatus": "pending",
    "verified": false,
    "createdAt": "2024-01-20T10:00:00Z"
  }
}
```

**Note:** If the inquiry is `accepted` and the event date is in the past, the review should be auto-approved by the trigger.

### 3.3 Verify Review in Database

```sql
-- Check the submitted review
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
ORDER BY created_at DESC
LIMIT 5;
```

## Step 4: Test Admin Moderation API

### 4.1 Get Pending Reviews

```bash
export ADMIN_TOKEN="your-admin-jwt-token"

curl -X GET "http://localhost:3000/api/admin/reviews?status=pending&page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "reviews": [
    {
      "id": "review-uuid",
      "vendorId": "vendor-uuid",
      "vendorName": "Vendor Name",
      "vendorCategory": "Photographers",
      "userId": "user-uuid",
      "userName": "User Name",
      "userEmail": "user@example.com",
      "rating": 5,
      "title": "Amazing Service!",
      "content": "This vendor provided excellent service...",
      "images": [],
      "moderationStatus": "pending",
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### 4.2 Approve a Review

```bash
export REVIEW_ID="review-uuid-here"

curl -X POST "http://localhost:3000/api/admin/reviews/$REVIEW_ID/moderate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "action": "approve",
    "notes": "Review looks good, approved."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "review": {
    "id": "review-uuid",
    "moderationStatus": "approved",
    "verified": true,
    "moderatedAt": "2024-01-20T11:00:00Z"
  }
}
```

### 4.3 Reject a Review

```bash
curl -X POST "http://localhost:3000/api/admin/reviews/$REVIEW_ID/moderate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "action": "reject",
    "reason": "Inappropriate content",
    "notes": "Contains profanity"
  }'
```

### 4.4 Flag a Review

```bash
curl -X POST "http://localhost:3000/api/admin/reviews/$REVIEW_ID/moderate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "action": "flag",
    "reason": "Potential spam - needs further review"
  }'
```

## Step 5: Test Admin UI

1. **Start the admin app:**
   ```bash
   cd apps/admin
   npm run dev
   ```

2. **Navigate to:** `http://localhost:3001/reviews` (or your admin app port)

3. **Login as admin user** (you'll need to implement auth or use a test token)

4. **Test the UI:**
   - View pending reviews
   - Filter by status (pending, approved, rejected, flagged)
   - Search for reviews
   - Approve/Reject/Flag reviews
   - Add moderation notes

## Step 6: Verify Auto-Approval Trigger

The system should auto-approve reviews linked to completed inquiries:

```sql
-- Create a review linked to an accepted inquiry
-- The trigger should auto-approve it

-- Check if trigger is working
SELECT 
  r.id,
  r.moderation_status,
  r.verified,
  i.status as inquiry_status,
  i.event_date
FROM reviews r
LEFT JOIN inquiries i ON r.inquiry_id = i.id
WHERE r.inquiry_id IS NOT NULL
ORDER BY r.created_at DESC;
```

Reviews with `inquiry_id` pointing to an `accepted` inquiry should have:
- `moderation_status = 'approved'`
- `verified = true`

## Step 7: Test Review Counts

Verify that vendor stats only count approved reviews:

```sql
-- Check vendor stats
SELECT 
  id,
  business_name,
  stats->>'averageRating' as avg_rating,
  stats->>'reviewCount' as review_count
FROM vendors
WHERE stats->>'reviewCount' IS NOT NULL
LIMIT 5;

-- Compare with actual approved review count
SELECT 
  vendor_id,
  COUNT(*) as total_reviews,
  COUNT(*) FILTER (WHERE moderation_status = 'approved') as approved_reviews,
  ROUND(AVG(rating)::numeric, 1) as avg_rating
FROM reviews
GROUP BY vendor_id
LIMIT 5;
```

## Common Issues & Solutions

### Issue: "You can only review vendors you have booked with"

**Solution:** Ensure the user has a completed inquiry:
```sql
-- Check user's inquiries
SELECT id, vendor_id, status, event_date
FROM inquiries
WHERE user_id = 'user-id-here'
AND status IN ('accepted', 'responded')
AND event_date <= CURRENT_DATE;
```

### Issue: "Admin access required"

**Solution:** Ensure user has admin role:
```sql
UPDATE users SET role = 'admin' WHERE id = 'user-id-here';
```

### Issue: Review not auto-approved

**Solution:** Check the trigger:
```sql
-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'auto_verify_review_insert';

-- Manually check inquiry status
SELECT i.status, i.event_date, r.moderation_status
FROM reviews r
JOIN inquiries i ON r.inquiry_id = i.id
WHERE r.id = 'review-id-here';
```

### Issue: API returns 401 Unauthorized

**Solution:** 
1. Check that the JWT token is valid
2. Ensure token is in the Authorization header: `Bearer <token>`
3. Verify the user exists in the database

## Next Steps

After testing:
1. ✅ Verify all API endpoints work
2. ✅ Test the admin UI
3. ✅ Verify auto-approval for completed bookings
4. ✅ Check that vendor stats update correctly
5. ✅ Test edge cases (duplicate reviews, invalid data, etc.)

## Automated Testing

For automated testing, use the Node.js test script:

```bash
# Set environment variables
export ADMIN_TOKEN="admin-jwt-token"
export USER_TOKEN="user-jwt-token"
export VENDOR_ID="vendor-uuid"
export INQUIRY_ID="inquiry-uuid"
export API_URL="http://localhost:3000"

# Run tests (if using Node.js with fetch support)
node scripts/test-review-moderation-api.js
```
