-- Verify Packages and Awards Migration
-- Run this to check if the packages and awards columns were added successfully

-- ============================================
-- 1. Check if columns exist
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name IN ('packages', 'awards') 
    THEN '✅'
    ELSE '❌'
  END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'vendors'
AND column_name IN ('packages', 'awards')
ORDER BY column_name;

-- ============================================
-- 2. Check if indexes exist
-- ============================================
SELECT 
  indexname,
  tablename,
  CASE 
    WHEN indexname IN ('idx_vendors_packages', 'idx_vendors_awards')
    THEN '✅'
    ELSE '❌'
  END as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'vendors'
AND indexname IN ('idx_vendors_packages', 'idx_vendors_awards')
ORDER BY indexname;

-- ============================================
-- 3. Test query to verify structure
-- ============================================
SELECT 
  id,
  business_name,
  packages,
  awards
FROM vendors
LIMIT 1;

-- ============================================
-- 4. Summary
-- ============================================
SELECT 
  'Columns' as component,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ All columns exist'
    WHEN COUNT(*) = 1 THEN '⚠️  One column missing'
    ELSE '❌ Columns missing - run migration 021_add_vendor_packages_awards.sql'
  END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'vendors'
AND column_name IN ('packages', 'awards')

UNION ALL

SELECT 
  'Indexes' as component,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ All indexes exist'
    WHEN COUNT(*) = 1 THEN '⚠️  One index missing'
    ELSE '❌ Indexes missing'
  END as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'vendors'
AND indexname IN ('idx_vendors_packages', 'idx_vendors_awards');
