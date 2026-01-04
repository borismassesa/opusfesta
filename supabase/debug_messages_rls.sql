-- Debug script to check RLS policies and message thread access
-- Run this while logged in as the vendor user in Supabase

-- 1. Check current authenticated user
SELECT 
  'Current User' as check_type,
  auth.uid() as user_id,
  (SELECT email FROM users WHERE id = auth.uid()) as user_email;

-- 2. Check vendor for current user
SELECT 
  'Vendor for Current User' as check_type,
  v.id as vendor_id,
  v.business_name,
  v.user_id as vendor_user_id,
  (v.user_id = auth.uid()) as is_owner
FROM vendors v
WHERE v.user_id = auth.uid()
LIMIT 1;

-- 3. Check message threads (what RLS allows)
SELECT 
  'Threads Visible to Current User' as check_type,
  mt.id as thread_id,
  mt.user_id,
  mt.vendor_id,
  v.business_name,
  (v.user_id = auth.uid()) as vendor_owned_by_user,
  u.email as customer_email
FROM message_threads mt
JOIN vendors v ON v.id = mt.vendor_id
JOIN users u ON u.id = mt.user_id
WHERE EXISTS (
  SELECT 1 FROM vendors
  WHERE vendors.id = mt.vendor_id
  AND vendors.user_id = auth.uid()
)
ORDER BY mt.last_message_at DESC;

-- 4. Check if threads exist at all (bypassing RLS - admin only)
-- This will only work if you're using service role key
SELECT 
  'All Threads (Admin View)' as check_type,
  COUNT(*) as total_threads
FROM message_threads;

-- 5. Test the exact query the app uses
SELECT 
  'App Query Test' as check_type,
  mt.*,
  jsonb_build_object(
    'id', u.id,
    'name', u.name,
    'email', u.email,
    'avatar', u.avatar
  ) as user
FROM message_threads mt
JOIN users u ON u.id = mt.user_id
WHERE mt.vendor_id = (
  SELECT id FROM vendors WHERE user_id = auth.uid() LIMIT 1
)
ORDER BY mt.last_message_at DESC;
