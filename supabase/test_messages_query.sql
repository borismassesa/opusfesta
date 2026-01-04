-- Test query to verify RLS is working
-- This simulates what the frontend does

-- First, check what vendor the current user owns
SELECT 
  'Your Vendor' as info,
  v.id as vendor_id,
  v.business_name,
  v.user_id as vendor_owner_user_id,
  auth.uid() as your_auth_uid,
  (v.user_id = auth.uid()) as is_your_vendor
FROM vendors v
WHERE v.user_id = auth.uid()
LIMIT 1;

-- Then try to get threads for that vendor (this is what the app does)
-- Note: This will only work if you're authenticated
SELECT 
  'Threads Query Test' as info,
  mt.id as thread_id,
  mt.vendor_id,
  mt.user_id as customer_user_id,
  u.email as customer_email,
  v.business_name as vendor_name,
  mt.last_message_at
FROM message_threads mt
JOIN vendors v ON v.id = mt.vendor_id
JOIN users u ON u.id = mt.user_id
WHERE mt.vendor_id = (
  SELECT id FROM vendors WHERE user_id = auth.uid() LIMIT 1
)
ORDER BY mt.last_message_at DESC;

-- If the above returns empty, check RLS directly
SELECT 
  'RLS Check' as info,
  COUNT(*) as visible_threads,
  (SELECT COUNT(*) FROM message_threads) as total_threads
FROM message_threads mt
WHERE EXISTS (
  SELECT 1 FROM vendors
  WHERE vendors.id = mt.vendor_id
  AND vendors.user_id = auth.uid()
);
