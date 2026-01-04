-- Verify Payment and Invoice Migration
-- Run this to check if everything was created successfully

-- ============================================
-- 1. Check Tables
-- ============================================
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('invoices', 'payments', 'payouts', 'payment_methods') 
    THEN '✅'
    ELSE '❌'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('invoices', 'payments', 'payouts', 'payment_methods')
ORDER BY table_name;

-- ============================================
-- 2. Check Enum Types
-- ============================================
SELECT 
  typname as type_name,
  CASE 
    WHEN typname IN ('payment_method', 'payment_status', 'invoice_status', 'invoice_type')
    THEN '✅'
    ELSE '❌'
  END as status
FROM pg_type
WHERE typname IN ('payment_method', 'payment_status', 'invoice_status', 'invoice_type')
ORDER BY typname;

-- ============================================
-- 3. Check Functions
-- ============================================
SELECT 
  routine_name,
  CASE 
    WHEN routine_name IN ('generate_invoice_number', 'update_invoice_paid_amount', 'mark_overdue_invoices')
    THEN '✅'
    ELSE '❌'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('generate_invoice_number', 'update_invoice_paid_amount', 'mark_overdue_invoices')
ORDER BY routine_name;

-- ============================================
-- 4. Check Triggers
-- ============================================
SELECT 
  trigger_name,
  event_object_table,
  CASE 
    WHEN trigger_name LIKE '%invoice%' OR trigger_name LIKE '%payment%' OR trigger_name LIKE '%payout%'
    THEN '✅'
    ELSE '❌'
  END as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND (
  trigger_name LIKE '%invoice%' 
  OR trigger_name LIKE '%payment%' 
  OR trigger_name LIKE '%payout%'
)
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 5. Check Indexes
-- ============================================
SELECT 
  indexname,
  tablename,
  CASE 
    WHEN indexname LIKE 'idx_%'
    THEN '✅'
    ELSE '❌'
  END as status
FROM pg_indexes
WHERE schemaname = 'public'
AND (
  tablename IN ('invoices', 'payments', 'payouts', 'payment_methods')
  OR indexname LIKE 'idx_invoice%'
  OR indexname LIKE 'idx_payment%'
  OR indexname LIKE 'idx_payout%'
)
ORDER BY tablename, indexname;

-- ============================================
-- 6. Check RLS Policies
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd as command,
  CASE 
    WHEN policyname IS NOT NULL
    THEN '✅'
    ELSE '❌'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('invoices', 'payments', 'payouts', 'payment_methods')
ORDER BY tablename, policyname;

-- ============================================
-- 7. Test Invoice Number Generation
-- ============================================
SELECT generate_invoice_number() as test_invoice_number;

-- ============================================
-- 8. Summary
-- ============================================
SELECT 
  'Tables' as component,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('invoices', 'payments', 'payouts', 'payment_methods')

UNION ALL

SELECT 
  'Functions' as component,
  COUNT(*) as count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('generate_invoice_number', 'update_invoice_paid_amount', 'mark_overdue_invoices')

UNION ALL

SELECT 
  'Enum Types' as component,
  COUNT(*) as count
FROM pg_type
WHERE typname IN ('payment_method', 'payment_status', 'invoice_status', 'invoice_type');
