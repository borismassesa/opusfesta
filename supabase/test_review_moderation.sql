-- Review Moderation System - Test Queries
-- Run these queries in your Supabase SQL editor to test the system

-- ============================================
-- 1. VERIFY MIGRATION
-- ============================================

-- Check if moderation status enum exists
SELECT EXISTS (
  SELECT 1 FROM pg_type WHERE typname = 'review_moderation_status'
) as enum_exists;

-- Check if all required functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN (
  'can_user_review_vendor',
  'approve_review',
  'reject_review',
  'flag_review',
  'auto_verify_review_on_insert'
)
ORDER BY routine_name;

-- Check if all required columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews'
AND column_name IN (
  'moderation_status',
  'inquiry_id',
  'moderation_notes',
  'moderation_notes',
  'moderated_at',
  'moderated_by',
  'flagged_reason'
)
ORDER BY column_name;

-- Check if indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'reviews'
AND indexname LIKE '%moderation%'
ORDER BY indexname;

-- ============================================
-- 2. SET UP TEST DATA
-- ============================================

-- 2.1 Create or update admin user
-- Replace 'your-admin-email@example.com' with your admin email
UPDATE users
SET role = 'admin'
WHERE email = 'your-admin-email@example.com'
RETURNING id, email, name, role;

-- 2.2 Get a vendor for testing
SELECT id, business_name, category
FROM vendors
LIMIT 5;

-- 2.3 Get a user for testing
-- Note: auth.users doesn't have a 'name' column, use the public.users table instead
SELECT id, email, name, role
FROM users
LIMIT 5;

-- 2.4 Create a test inquiry (if needed)
-- Replace the UUIDs with actual values
/*
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
  'vendor-uuid-here',           -- Replace with actual vendor ID
  'user-uuid-here',             -- Replace with actual user ID
  'Test User',
  'test@example.com',
  'wedding',
  CURRENT_DATE - INTERVAL '7 days',  -- Event in the past
  'accepted',
  'Test inquiry for review testing'
)
RETURNING id, vendor_id, user_id, status, event_date;
*/

-- ============================================
-- 3. TEST REVIEW SUBMISSION (Manual via API)
-- ============================================

-- After submitting a review via API, check it:
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

-- ============================================
-- 4. TEST MODERATION FUNCTIONS
-- ============================================

-- 4.1 Test can_user_review_vendor function
-- Replace UUIDs with actual values
/*
SELECT can_user_review_vendor(
  'user-uuid-here'::UUID,
  'vendor-uuid-here'::UUID
) as can_review;
*/

-- 4.2 Get a pending review to test moderation
SELECT 
  id,
  vendor_id,
  user_id,
  rating,
  title,
  moderation_status,
  verified
FROM reviews
WHERE moderation_status = 'pending'
LIMIT 1;

-- 4.3 Test approve_review function
-- Replace 'review-uuid-here' and 'admin-uuid-here' with actual values
/*
SELECT approve_review(
  'review-uuid-here'::UUID,
  'admin-uuid-here'::UUID
);

-- Verify the review was approved
SELECT 
  id,
  moderation_status,
  verified,
  moderated_at,
  moderated_by
FROM reviews
WHERE id = 'review-uuid-here'::UUID;
*/

-- 4.4 Test reject_review function
/*
SELECT reject_review(
  'review-uuid-here'::UUID,
  'admin-uuid-here'::UUID,
  'Test rejection reason'
);

-- Verify the review was rejected
SELECT 
  id,
  moderation_status,
  moderation_notes,
  moderated_at
FROM reviews
WHERE id = 'review-uuid-here'::UUID;
*/

-- 4.5 Test flag_review function
/*
SELECT flag_review(
  'review-uuid-here'::UUID,
  'Potential spam - needs review'
);

-- Verify the review was flagged
SELECT 
  id,
  moderation_status,
  flagged_reason,
  moderated_at
FROM reviews
WHERE id = 'review-uuid-here'::UUID;
*/

-- ============================================
-- 5. TEST AUTO-APPROVAL TRIGGER
-- ============================================

-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'auto_verify_review_insert';

-- Check reviews linked to completed inquiries
-- These should be auto-approved
SELECT 
  r.id,
  r.moderation_status,
  r.verified,
  r.inquiry_id,
  i.status as inquiry_status,
  i.event_date,
  CASE 
    WHEN i.status IN ('accepted', 'responded') AND i.event_date <= CURRENT_DATE 
    THEN 'Should be auto-approved'
    ELSE 'Requires manual moderation'
  END as expected_status
FROM reviews r
LEFT JOIN inquiries i ON r.inquiry_id = i.id
WHERE r.inquiry_id IS NOT NULL
ORDER BY r.created_at DESC
LIMIT 10;

-- ============================================
-- 6. TEST VENDOR STATS UPDATE
-- ============================================

-- Check vendor stats (should only count approved reviews)
SELECT 
  v.id,
  v.business_name,
  v.stats->>'averageRating' as avg_rating,
  v.stats->>'reviewCount' as review_count,
  -- Compare with actual counts
  (
    SELECT COUNT(*) 
    FROM reviews r 
    WHERE r.vendor_id = v.id 
    AND r.moderation_status = 'approved'
  ) as actual_approved_count,
  (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM reviews r
    WHERE r.vendor_id = v.id
    AND r.moderation_status = 'approved'
  ) as actual_avg_rating
FROM vendors v
WHERE v.stats->>'reviewCount' IS NOT NULL
ORDER BY (v.stats->>'reviewCount')::int DESC
LIMIT 10;

-- ============================================
-- 7. REVIEW MODERATION STATISTICS
-- ============================================

-- Count reviews by moderation status
SELECT 
  moderation_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM reviews
GROUP BY moderation_status
ORDER BY count DESC;

-- Reviews pending moderation (for admin dashboard)
SELECT 
  COUNT(*) as pending_count,
  MIN(created_at) as oldest_pending,
  MAX(created_at) as newest_pending
FROM reviews
WHERE moderation_status = 'pending';

-- Reviews by vendor (with moderation status)
SELECT 
  v.business_name,
  COUNT(r.id) as total_reviews,
  COUNT(r.id) FILTER (WHERE r.moderation_status = 'approved') as approved,
  COUNT(r.id) FILTER (WHERE r.moderation_status = 'pending') as pending,
  COUNT(r.id) FILTER (WHERE r.moderation_status = 'rejected') as rejected,
  COUNT(r.id) FILTER (WHERE r.moderation_status = 'flagged') as flagged
FROM vendors v
LEFT JOIN reviews r ON r.vendor_id = v.id
GROUP BY v.id, v.business_name
HAVING COUNT(r.id) > 0
ORDER BY total_reviews DESC
LIMIT 10;

-- ============================================
-- 8. TEST RLS POLICIES
-- ============================================

-- Check RLS policies on reviews table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'reviews'
ORDER BY policyname;

-- ============================================
-- 9. CLEANUP (Optional - for testing)
-- ============================================

-- Delete test reviews (use with caution!)
/*
DELETE FROM reviews
WHERE title LIKE 'Test%'
OR content LIKE '%test review%'
RETURNING id, title;
*/
