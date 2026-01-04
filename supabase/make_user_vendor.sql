-- Make User a Vendor
-- This script converts a user from auth.users into a vendor
-- User ID: aed1cfce-d2a5-4173-9de5-8563380b6f61
-- Email: bmassesa24@gmail.com

-- ============================================
-- STEP 1: Ensure user exists in public.users
-- ============================================
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
SET 
  role = 'vendor',
  name = COALESCE(EXCLUDED.name, users.name),
  email = EXCLUDED.email
RETURNING id, email, name, role;

-- ============================================
-- STEP 2: Create vendor record
-- ============================================
-- Check if vendor already exists
DO $$
DECLARE
  v_user_id UUID := 'aed1cfce-d2a5-4173-9de5-8563380b6f61';
  v_vendor_exists BOOLEAN;
  v_slug TEXT;
  v_business_name TEXT := 'My Business'; -- Change this to the actual business name
BEGIN
  -- Check if vendor already exists
  SELECT EXISTS(SELECT 1 FROM vendors WHERE user_id = v_user_id) INTO v_vendor_exists;
  
  IF NOT v_vendor_exists THEN
    -- Generate slug from business name
    v_slug := lower(regexp_replace(v_business_name, '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := trim(both '-' from v_slug);
    
    -- Ensure slug is unique
    WHILE EXISTS(SELECT 1 FROM vendors WHERE slug = v_slug) LOOP
      v_slug := v_slug || '-' || floor(random() * 1000)::text;
    END LOOP;
    
    -- Insert vendor record
    INSERT INTO vendors (
      slug,
      user_id,
      business_name,
      category,
      subcategories,
      bio,
      description,
      location,
      price_range,
      verified,
      tier,
      stats,
      contact_info,
      social_links,
      services_offered,
      created_at,
      updated_at
    ) VALUES (
      v_slug,
      v_user_id,
      v_business_name,
      'Photographers', -- Change this to the appropriate category
      ARRAY[]::TEXT[],
      NULL,
      NULL,
      '{"country": "Tanzania"}'::JSONB,
      NULL,
      false,
      'free',
      '{
        "viewCount": 0,
        "inquiryCount": 0,
        "saveCount": 0,
        "averageRating": 0,
        "reviewCount": 0
      }'::JSONB,
      '{"email": "bmassesa24@gmail.com"}'::JSONB,
      '{
        "instagram": null,
        "facebook": null,
        "twitter": null,
        "tiktok": null
      }'::JSONB,
      ARRAY[]::TEXT[],
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Vendor created successfully with slug: %', v_slug;
  ELSE
    RAISE NOTICE 'Vendor already exists for this user';
  END IF;
END $$;

-- ============================================
-- STEP 3: Verify the setup
-- ============================================
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  u.role,
  v.id as vendor_id,
  v.slug,
  v.business_name,
  v.category,
  v.verified,
  v.tier
FROM users u
LEFT JOIN vendors v ON v.user_id = u.id
WHERE u.id = 'aed1cfce-d2a5-4173-9de5-8563380b6f61';
