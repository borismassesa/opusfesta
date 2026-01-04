-- Fix Inquiries Using Your Auth User
-- This uses the actual UUID from your auth.users table

-- ============================================
-- STEP 1: Add your auth user to public.users
-- ============================================
INSERT INTO users (id, email, name, role, password)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) as name,
  'user' as role,
  encrypted_password as password
FROM auth.users
WHERE id = 'ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e'  -- Your auth user
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'user',
  name = COALESCE(EXCLUDED.name, users.name)
RETURNING id, email, name, role;

-- ============================================
-- STEP 2: Update inquiries with your user_id and past dates
-- ============================================
UPDATE inquiries
SET 
  user_id = 'ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e',  -- Your user ID
  event_date = CURRENT_DATE - INTERVAL '7 days'  -- Set to past date
WHERE id IN (
  '2b89a589-462b-45dc-a679-3e4cd364513e',
  'ba0f7d62-5cdf-4018-ae62-81bf935a2156'
)
RETURNING 
  id,
  vendor_id,
  user_id,
  status,
  event_date,
  CASE 
    WHEN status IN ('accepted', 'responded') 
      AND event_date <= CURRENT_DATE
      AND user_id IS NOT NULL
    THEN '✅ Eligible for review'
    ELSE '❌ Not eligible'
  END as review_eligibility;

-- ============================================
-- STEP 3: Verify everything is set up correctly
-- ============================================
SELECT 
  i.id as inquiry_id,
  i.vendor_id,
  v.business_name as vendor_name,
  i.user_id,
  u.email as user_email,
  u.role as user_role,
  i.status,
  i.event_date,
  CASE 
    WHEN i.status IN ('accepted', 'responded') 
      AND i.event_date <= CURRENT_DATE
      AND i.user_id IS NOT NULL
    THEN '✅ Eligible for review'
    WHEN i.user_id IS NULL
    THEN '❌ Not eligible (guest inquiry - no user_id)'
    WHEN i.event_date > CURRENT_DATE
    THEN '❌ Not eligible (event date in future: ' || i.event_date || ')'
    ELSE '❌ Not eligible (status: ' || i.status || ')'
  END as review_eligibility
FROM inquiries i
JOIN vendors v ON v.id = i.vendor_id
LEFT JOIN users u ON u.id = i.user_id
WHERE i.id IN (
  '2b89a589-462b-45dc-a679-3e4cd364513e',
  'ba0f7d62-5cdf-4018-ae62-81bf935a2156'
)
ORDER BY i.created_at DESC;

-- ============================================
-- STEP 4: Verify user was created
-- ============================================
SELECT id, email, name, role
FROM users
WHERE id = 'ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e';
