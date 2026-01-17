# Cleanup Duplicate Users Script

This script finds and merges duplicate user accounts that have the same email address (case-insensitive).

## What it does

1. **Finds duplicates**: Identifies users with the same email (case-insensitive)
2. **Keeps oldest**: Preserves the user account created first (by `created_at`)
3. **Merges data**: Combines information from duplicate accounts into the kept account
   - Name, phone, avatar (if missing in kept account)
   - Role (keeps the most permissive role)
   - Normalizes email to lowercase
4. **Updates references**: Updates foreign key references in related tables:
   - `vendors` table (user_id)
   - `job_applications` table (user_id)
5. **Deletes duplicates**: Removes duplicate user records and their auth accounts

## Usage

### Dry Run (Recommended First)

See what would be changed without making any modifications:

```bash
npm run cleanup:duplicates:dry-run
```

or

```bash
npx tsx scripts/cleanup-duplicate-users.ts --dry-run
```

### Actual Cleanup

After reviewing the dry run output, run the actual cleanup:

```bash
npm run cleanup:duplicates
```

or

```bash
npx tsx scripts/cleanup-duplicate-users.ts
```

## Prerequisites

1. **Environment Variables**: Make sure you have these set in `.env.local` or `env.development`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Dependencies**: Install `tsx` if not already installed:
   ```bash
   npm install -D tsx
   ```

## Example Output

```
🔍 Finding duplicate users...

📊 Found 1 duplicate email group(s):

📧 Email: isaulakh2004@gmail.com
   Keeping: abc123... (created: 2026-01-15T10:00:00Z)
   Duplicates: 1 user(s)
     - def456... (created: 2026-01-16T10:00:00Z)
  ✓ Updated user abc123... with merged data
  ✓ Updated 0 vendor record(s)
  ✓ Updated 0 job application(s)
  ✓ Deleted duplicate user def456...

📈 Summary:
   Duplicate groups: 1
   Total duplicates: 1
   Users merged: 1
   Users deleted: 1

✅ Cleanup complete!
```

## Safety Features

- **Dry run mode**: Test before making changes
- **Keeps oldest account**: Preserves the original user account
- **Merges data intelligently**: Only updates missing fields
- **Updates foreign keys**: Ensures data integrity across tables
- **Error handling**: Continues processing even if individual operations fail

## Important Notes

⚠️ **Backup First**: Consider backing up your database before running this script

⚠️ **Auth Users**: The script also deletes duplicate users from `auth.users` table

⚠️ **Irreversible**: Once duplicates are deleted, they cannot be recovered (unless you have a backup)

## Troubleshooting

If you encounter errors:

1. **Missing environment variables**: Check that `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
2. **Permission errors**: Ensure the service role key has admin access
3. **Foreign key constraints**: The script handles most common foreign keys, but you may need to add more if your schema has additional references

## Adding More Foreign Key Updates

If you have other tables that reference `users.id`, add them to the `updateForeignKeys` function in the script:

```typescript
// Example: Update bookings table
const { error: bookingError } = await supabase
  .from('bookings')
  .update({ user_id: keepUserId })
  .eq('user_id', duplicateUserId);
```
