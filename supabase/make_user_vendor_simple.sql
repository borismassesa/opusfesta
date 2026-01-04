-- Simple Script to Make User a Vendor
-- User ID: aed1cfce-d2a5-4173-9de5-8563380b6f61
-- Email: bmassesa24@gmail.com

-- Step 1: Add/Update user in public.users with vendor role
INSERT INTO users (id, email, name, role, password)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) as name,
  'vendor' as role,
  encrypted_password as password
FROM auth.users
WHERE id = 'aed1cfce-d2a5-4173-9de5-8563380b6f61'
ON CONFLICT (id) DO UPDATE 
SET role = 'vendor'
RETURNING id, email, name, role;

-- Step 2: Create vendor record (customize business_name and category as needed)
-- Available categories: 'Venues', 'Photographers', 'Videographers', 'Caterers',
-- 'Wedding Planners', 'Florists', 'DJs & Music', 'Beauty & Makeup',
-- 'Bridal Salons', 'Cake & Desserts', 'Decorators', 'Officiants',
-- 'Rentals', 'Transportation'

-- Check if vendor already exists, if not create one
INSERT INTO vendors (
  slug,
  user_id,
  business_name,
  category,
  location,
  contact_info,
  stats,
  social_links
)
SELECT 
  'my-business-' || substr('aed1cfce-d2a5-4173-9de5-8563380b6f61', 1, 8), -- Generate unique slug
  'aed1cfce-d2a5-4173-9de5-8563380b6f61',
  'My Business', -- CHANGE THIS to your business name
  'Photographers', -- CHANGE THIS to your category
  '{"country": "Tanzania"}'::JSONB,
  '{"email": "bmassesa24@gmail.com"}'::JSONB,
  '{"viewCount": 0, "inquiryCount": 0, "saveCount": 0, "averageRating": 0, "reviewCount": 0}'::JSONB,
  '{"instagram": null, "facebook": null, "twitter": null, "tiktok": null}'::JSONB
WHERE NOT EXISTS (
  SELECT 1 FROM vendors WHERE user_id = 'aed1cfce-d2a5-4173-9de5-8563380b6f61'
)
RETURNING id, slug, business_name, category;

-- Step 3: Verify
SELECT 
  u.id, u.email, u.role,
  v.id as vendor_id, v.slug, v.business_name, v.category
FROM users u
LEFT JOIN vendors v ON v.user_id = u.id
WHERE u.id = 'aed1cfce-d2a5-4173-9de5-8563380b6f61';
