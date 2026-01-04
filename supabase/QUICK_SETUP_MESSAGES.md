# Quick Setup Guide for Messages

## Step 1: Run Migrations

Make sure you've run both migrations:

```sql
-- In Supabase SQL Editor, run:
-- 1. Migration 022 (creates tables)
-- 2. Migration 023 (creates auto-trigger)
```

Or via Supabase CLI:
```bash
supabase db push
```

## Step 2: Create Test Data

Run the verification and setup script:

```sql
-- Copy and paste the contents of verify_and_setup_messages.sql
-- into Supabase SQL Editor and run it
```

This will:
- ✅ Verify tables exist
- ✅ Check trigger is set up
- ✅ Create test conversations if none exist
- ✅ Show you all existing threads

## Step 3: Verify in Browser

1. Go to `/messages` page in vendor portal
2. You should see conversation threads
3. Click on a thread to see messages

## Troubleshooting

### Still seeing "No conversations yet"?

1. **Check if you have a vendor profile:**
   ```sql
   SELECT id, business_name, user_id FROM vendors LIMIT 1;
   ```

2. **Check if threads exist:**
   ```sql
   SELECT COUNT(*) FROM message_threads;
   ```

3. **Check RLS policies:**
   ```sql
   -- Make sure you're logged in as the vendor user
   SELECT auth.uid() as current_user_id;
   ```

4. **Check browser console** for any errors

5. **Verify vendor ID matches:**
   - The messages page gets vendor by `user_id` from auth
   - Make sure the logged-in user has a vendor profile

### Manual Test Data Creation

If the script doesn't work, manually create a thread:

```sql
-- Replace these UUIDs with your actual user and vendor IDs
INSERT INTO message_threads (user_id, vendor_id, last_message_at)
VALUES (
  'YOUR_USER_ID_HERE',
  'YOUR_VENDOR_ID_HERE',
  CURRENT_TIMESTAMP
)
RETURNING id;

-- Then create a message (use the thread_id from above)
INSERT INTO messages (thread_id, sender_id, content)
VALUES (
  'THREAD_ID_FROM_ABOVE',
  'YOUR_USER_ID_HERE',
  'Hello! This is a test message.'
);
```
