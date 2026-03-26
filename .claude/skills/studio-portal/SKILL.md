---
name: studio-portal
description: "Client portal features — dashboard, bookings, messages, settings. Use when working on the client-facing portal at /portal/*, portal API routes, or portal components."
---

# Studio Client Portal

## Route Structure

| Route | Purpose |
|-------|---------|
| `/portal` | Dashboard — stats, pending actions, upcoming events |
| `/portal/bookings` | Booking list with status/date filters |
| `/portal/bookings/[id]` | Booking detail view with chat |
| `/portal/messages` | Messaging center |
| `/portal/settings` | Client profile settings |
| `/portal/book` | New booking intake form |

## Auth Flow

1. **Clerk middleware** protects all `/portal/*` routes — unauthenticated users redirected to sign-in
2. **ClientAuthProvider** wraps portal layout, syncs Clerk user to `studio_client_profiles` table
3. **getPortalClient()** server helper resolves the authenticated client profile from Clerk session

```typescript
// Server component pattern
import { getPortalClient } from '@/lib/portal-auth'

export default async function PortalPage() {
  const client = await getPortalClient()
  if (!client) redirect('/sign-in')
  // ... fetch client-specific data
}
```

## API Routes

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/portal/bookings` | List client bookings with status/date filters |
| `POST` | `/api/portal/bookings` | Submit new booking intake |
| `GET` | `/api/portal/bookings/[id]` | Single booking detail |
| `GET` | `/api/portal/dashboard` | Dashboard stats and pending actions |
| `GET` | `/api/portal/messages` | Client messages |

## Dashboard Stats Pattern

```typescript
// Dashboard aggregates for the authenticated client
const stats = {
  totalBookings: number,
  activeBookings: number,        // status not in (completed, cancelled)
  pendingActions: number,        // bookings where client action needed
  upcomingEvents: Booking[],     // next 3 events by date
  recentMessages: Message[],     // unread messages
}
```

## Components

| Component | Purpose |
|-----------|---------|
| `BookingCard` | Booking summary with status badge, date, service |
| `BookingFilters` | Status/date filter bar |
| `BookingChat` | In-booking message thread |
| `DashboardStats` | Key metrics cards (total, active, pending) |
| `PendingActionBanner` | Alert banner for required client actions |
| `UpcomingEventCard` | Next event preview with countdown |
| `StatusBadge` | Booking status pill with color coding |
| `PortalSidebar` | Desktop sidebar navigation |
| `PortalMobileHeader` | Mobile nav with hamburger menu |
| `PortalLoader` | Loading skeleton matching portal layout |
| `ClientAuthProvider` | Auth context wrapper for portal |

## Design

- Mobile-first responsive layout
- Brutalist design: `border-3`, `shadow-brutal`, `font-mono`, `brand-*` CSS vars
- Sidebar on desktop (left rail), bottom nav on mobile
- Status badges use consistent color map across portal
