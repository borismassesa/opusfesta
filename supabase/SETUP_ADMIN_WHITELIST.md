# Admin Whitelist Setup Instructions

## Step-by-Step Setup

### Step 1: Create the Table (REQUIRED - Run this FIRST)

1. Open Supabase Dashboard → SQL Editor
2. Copy the **entire contents** of `supabase/migrations/040_create_admin_whitelist.sql`
3. Paste it into the SQL Editor
4. Click "Run" or press Cmd/Ctrl + Enter
5. **Wait for it to complete successfully** - you should see "Success. No rows returned"

### Step 2: Populate Existing Admins (Run this AFTER Step 1)

1. In the same SQL Editor (or a new query)
2. Copy the **entire contents** of `supabase/migrate_admins_to_whitelist.sql`
3. Paste it into the SQL Editor
4. Click "Run"
5. You should see a summary showing how many admins were added

### Step 3: Verify Setup

Run this query to verify the table was created and populated:

```sql
SELECT 
  email,
  full_name,
  role,
  is_active,
  created_at
FROM admin_whitelist
ORDER BY created_at DESC;
```

You should see your admin users listed.

### Step 4: Set Owner Role (Optional)

If you want to set specific admins as "owner" (instead of "admin"):

```sql
UPDATE admin_whitelist 
SET role = 'owner' 
WHERE email = 'boris.massesa@thefestaevents.com';
```

## Troubleshooting

**Error: "relation admin_whitelist does not exist"**
- This means Step 1 hasn't been run yet
- Go back and run `040_create_admin_whitelist.sql` first

**Error: "invalid input value for enum user_role: owner"**
- This is fixed in the migration script
- Make sure you're using the latest version of the files

**No admins showing up after Step 2**
- Check that you have users with `role = 'admin'` in the `users` table:
  ```sql
  SELECT id, email, role FROM users WHERE role = 'admin';
  ```
