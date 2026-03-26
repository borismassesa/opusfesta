---
name: shared-data-api
description: "Database architecture — Supabase queries, migrations, API design, query optimization, data integrity."
---

# Shared Data & API Layer

## API Route Patterns (Next.js Route Handlers)

```typescript
// apps/studio/app/api/admin/bookings/route.ts
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = getStudioSupabaseAdmin()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const query = supabase
    .from('studio_bookings')
    .select('*, studio_client_profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (status) query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

## Error Handling Pattern

```typescript
// Consistent error response shape
{ error: string, code?: string, details?: unknown }

// HTTP status codes
// 400 — validation error (missing fields, bad format)
// 401 — not authenticated
// 403 — authenticated but not authorized
// 404 — resource not found
// 409 — conflict (duplicate, invalid state transition)
// 500 — server error
```

## N+1 Prevention

```typescript
// BAD: N+1 queries
const bookings = await supabase.from('studio_bookings').select('*')
for (const b of bookings.data) {
  const client = await supabase.from('studio_client_profiles').select('*').eq('id', b.client_id)
}

// GOOD: Join in single query
const { data } = await supabase
  .from('studio_bookings')
  .select('*, studio_client_profiles(full_name, email, phone)')
```

## Indexing Strategy

- Add indexes on columns used in `WHERE`, `ORDER BY`, and `JOIN`
- Use partial indexes for filtered queries:
  ```sql
  CREATE INDEX idx_bookings_active ON studio_bookings(status, event_date)
  WHERE status NOT IN ('completed', 'cancelled');
  ```
- Check query plans: `EXPLAIN ANALYZE SELECT ...`

## Safe Migrations

```sql
-- Always use CONCURRENTLY for indexes on existing tables
CREATE INDEX CONCURRENTLY idx_bookings_client_id ON studio_bookings(client_id);

-- Add columns as nullable first, then backfill, then add constraint
ALTER TABLE studio_bookings ADD COLUMN deposit_paid_at timestamptz;
-- backfill in separate migration
-- then: ALTER TABLE studio_bookings ALTER COLUMN deposit_paid_at SET NOT NULL;
```

## Data Conventions

- API routes: `/api/{domain}/{resource}` (e.g., `/api/admin/bookings`, `/api/portal/messages`)
- TZS currency values stored as integers (no floating point)
- Timestamps in UTC, display in `Africa/Dar_es_Salaam` timezone
- All database operations through Supabase client (admin or RLS-scoped)
- Soft delete with `deleted_at` timestamp where appropriate

## Request Validation

Validate incoming data at the API route level before database operations:

```typescript
const body = await request.json()
if (!body.event_date || !body.service_id) {
  return NextResponse.json(
    { error: 'event_date and service_id are required' },
    { status: 400 }
  )
}
```
