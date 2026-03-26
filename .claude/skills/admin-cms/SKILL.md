---
name: admin-cms
description: "Admin dashboard — content management, vendor moderation, review moderation, careers, employee management, platform analytics."
---

# Admin Dashboard

## Route Structure

All admin routes under `/studio-admin/*`:

| Route | Purpose |
|-------|---------|
| `/studio-admin` | Dashboard with platform stats |
| `/studio-admin/bookings` | Booking management pipeline |
| `/studio-admin/bookings/[id]` | Booking detail and status transitions |
| `/studio-admin/pages` | CMS page section editor |
| `/studio-admin/pages/[page]` | Edit sections for specific page |
| `/studio-admin/vendors` | Vendor moderation and management |
| `/studio-admin/reviews` | Review moderation queue |
| `/studio-admin/careers` | Job posting management |
| `/studio-admin/employees` | Team member profiles and roles |
| `/studio-admin/services` | Service catalog management |
| `/studio-admin/analytics` | Platform analytics dashboard |

## Auth (Clerk)

```typescript
// Middleware protects all /studio-admin/* routes
// Server component pattern:
import { auth } from '@clerk/nextjs/server'

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  // Verify admin role from database
  const admin = await getAdminProfile(userId)
  if (!admin) redirect('/')
}
```

## API Routes

All admin APIs under `/api/admin/*`:

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/admin/bookings` | GET | List bookings with filters |
| `/api/admin/bookings/[id]` | GET, PATCH | View/update booking |
| `/api/admin/bookings/[id]/status` | PATCH | Transition booking status |
| `/api/admin/page-sections` | GET, POST, DELETE | CMS section CRUD |
| `/api/admin/services` | GET, POST, PATCH, DELETE | Service catalog |
| `/api/admin/vendors` | GET, PATCH | Vendor list, approve/reject |
| `/api/admin/reviews` | GET, PATCH, DELETE | Review moderation |
| `/api/admin/careers` | GET, POST, PATCH, DELETE | Job postings |
| `/api/admin/employees` | GET, POST, PATCH | Team members |
| `/api/admin/analytics` | GET | Platform stats |

### API Route Pattern

```typescript
// apps/studio/app/api/admin/bookings/route.ts
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getStudioSupabaseAdmin()
  const { data, error } = await supabase
    .from('studio_bookings')
    .select('*, studio_client_profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

## Admin UI Components

| Component | Purpose |
|-----------|---------|
| `AdminSidebar` | Left navigation rail |
| `AdminDataTable` | Sortable, filterable data table |
| `AdminStatusBadge` | Booking/vendor status pill |
| `AdminMediaUpload` | Image/video upload to Supabase storage |
| `AdminPageSectionEditor` | CMS section field editor |
| `AdminAnalyticsCard` | Stat card with trend indicator |

## Key Management Areas

- **Content Management** — CMS page section editing (Homepage, About, What We Do)
- **Vendor Moderation** — approve/reject vendor applications, manage listings
- **Review Moderation** — approve, flag, or remove user reviews
- **Careers** — manage job postings and applications
- **Employee Management** — team member profiles and roles
- **Platform Analytics** — booking stats, revenue in TZS, vendor performance

## Design

- Consistent brutalist design: `border-3`, `shadow-brutal`, `font-mono`
- Admin sidebar always visible on desktop
- Data tables with pagination, sorting, and search
- Action buttons with confirmation dialogs for destructive operations
