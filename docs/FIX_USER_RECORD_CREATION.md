# Fix User Record Creation Issue

## Problem
Users can authenticate successfully (exist in `auth.users`) but cannot log in because their record doesn't exist in `public.users` table, and RLS policies are blocking the INSERT operation.

## Root Cause
1. The `users` table has RLS enabled
2. There's no INSERT policy allowing authenticated users to create their own records
3. When a user logs in, `ensureUserRecord()` tries to create a record in `public.users` but is blocked by RLS

## Solution

### Step 1: Apply the RLS Policy Migration
Run the migration to add the INSERT policy:

```sql
-- File: supabase/migrations/037_add_users_insert_policy.sql
CREATE POLICY "Users can insert their own record" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
```

**How to apply:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the SQL from `supabase/migrations/037_add_users_insert_policy.sql`
3. Click "Run"

### Step 2: Backfill Existing Users
For users that already exist in `auth.users` but not in `public.users`, run the backfill script:

```sql
-- File: supabase/fix_existing_auth_users.sql
-- This will create user records for all existing auth.users
```

**How to apply:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the SQL from `supabase/fix_existing_auth_users.sql`
3. Click "Run"
4. Check the output to see how many users were created

### Step 3: Verify
After applying both fixes:
1. Try logging in with an existing account
2. The user record should be created automatically if it doesn't exist
3. Or it should already exist from the backfill script

## Verification Queries

### Check if user exists in public.users
```sql
SELECT id, email, role, name 
FROM users 
WHERE id = 'e4fb900b-cb1c-45c6-8e2c-49e5cb6752c4';
```

### Check all auth.users without public.users records
```sql
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE WHEN pu.id IS NULL THEN 'Missing in public.users' ELSE 'Exists' END as status
FROM auth.users au
LEFT JOIN users pu ON pu.id = au.id
WHERE pu.id IS NULL;
```

## Prevention
After applying the migration, new users will automatically be able to create their own records when they sign up or log in for the first time.
