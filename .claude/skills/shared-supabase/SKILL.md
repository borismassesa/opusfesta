---
name: shared-supabase
description: "Supabase admin operations — migrations, RLS policies, storage buckets, SQL queries, edge functions. Use when working with Supabase database, storage, or auth configuration."
---

# Shared Supabase Operations

## Client Setup

```typescript
// Server-side admin (bypasses RLS) — for API routes and server components
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin'
const supabase = getStudioSupabaseAdmin()

// Client-side (respects RLS) — for client components
import { createClient } from '@/lib/supabase-client'
const supabase = createClient()
```

## Key Tables

| Table | Purpose |
|-------|---------|
| `studio_bookings` | Booking records with status, dates, pricing |
| `studio_client_profiles` | Client profiles linked to Clerk user ID |
| `studio_messages` | Per-booking message threads |
| `studio_page_sections` | CMS page content (Homepage, About, etc.) |
| `studio_services` | Available services with pricing |
| `vendors` | Vendor profiles and business info |
| `vendor_services` | Vendor service offerings |
| `vendor_reviews` | Client reviews of vendors |

## Migration Convention

- Location: `supabase/migrations/`
- Naming: `YYYYMMDDHHMMSS_description.sql` (e.g., `20260316143000_add_deposit_tracking.sql`)
- Include rollback logic as comments where possible

### Safe Migration Practices

```sql
-- Add columns nullable first
ALTER TABLE studio_bookings ADD COLUMN IF NOT EXISTS notes text;

-- Create indexes concurrently (doesn't lock table)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_status
  ON studio_bookings(status);

-- Partial indexes for common filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_active
  ON studio_bookings(event_date, status)
  WHERE status NOT IN ('completed', 'cancelled');

-- Never DROP COLUMN in production without backup
-- Never rename columns — add new, migrate data, then deprecate old
```

## RLS Policies

```sql
-- Pattern: clients see only their own records
CREATE POLICY "clients_own_bookings" ON studio_bookings
  FOR SELECT USING (clerk_user_id = auth.uid());

-- Pattern: public read for published content
CREATE POLICY "public_read_sections" ON studio_page_sections
  FOR SELECT USING (is_published = true);

-- Pattern: admin full access (handled by service role key, bypasses RLS)
```

- All tables must have RLS enabled
- Admin operations use `getStudioSupabaseAdmin()` (service role key)
- Client access scoped by Clerk user ID
- Public access only for published/approved content

## Storage

- **Bucket:** `studio-assets`
- **Max upload:** 50MB
- **Path convention:** `{entity}/{id}/{filename}` (e.g., `vendors/v_123/logo.jpg`)
- **Signed URLs** for private assets (expire after 1 hour)
- **Public URLs** for published content (gallery images, CMS media)

```typescript
// Upload
const { data, error } = await supabase.storage
  .from('studio-assets')
  .upload(`vendors/${vendorId}/${file.name}`, file)

// Signed URL for private access
const { data: { signedUrl } } = await supabase.storage
  .from('studio-assets')
  .createSignedUrl(path, 3600)
```

## Connection Pooling

- Use Supabase's built-in PgBouncer for connection pooling
- Connection string for pooled access: port `6543`
- Direct connection for migrations: port `5432`
- Keep queries short-lived — avoid holding connections during external API calls

## Query Performance

- Use `EXPLAIN ANALYZE` to check query plans before deploying
- Avoid `SELECT *` — specify only needed columns
- Use `.select('id, status, event_date, studio_client_profiles(full_name)')` with joins
- Paginate large result sets: `.range(0, 49)` for first 50 rows
