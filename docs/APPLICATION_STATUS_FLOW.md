# Application Status Change Flow

This document explains how application status changes work from both the **Admin side** and **Client/User side**.

## Overview

When an admin changes an application status from "Pending" to another status (e.g., "Reviewing"), the change flows through several layers:

1. **Admin UI** → User selects new status
2. **API Route** → Validates and updates database
3. **Activity Log** → Records the change
4. **Database** → Status is updated in `job_applications` table
5. **Client Side** → User can see updated status via tracking page

---

## 🔧 ADMIN SIDE: Changing Status

### Step 1: Admin Views Application
**Location:** `/admin/careers/applications/[id]`

**File:** `apps/admin/src/app/careers/applications/[id]/page.tsx`

The admin sees a dropdown in the "Status & Actions" card:

```tsx
<Select value={status} onValueChange={setStatus}>
  <SelectContent>
    <SelectItem value="pending">Pending</SelectItem>
    <SelectItem value="reviewing">Reviewing</SelectItem>
    <SelectItem value="phone_screen">Phone Screen</SelectItem>
    // ... other statuses
  </SelectContent>
</Select>
```

**State Management:**
- `status` state is initialized from the application data
- When admin selects a new status, `setStatus(newStatus)` is called
- The UI updates immediately (optimistic update)

### Step 2: Admin Clicks "Save Changes"
**Location:** Same page, "Save Changes" button

**Code Flow:**
```tsx
const handleSave = async () => {
  // 1. Get current session
  const { data: { session } } = await supabase.auth.getSession();
  
  // 2. Call API to update
  const response = await fetch(
    getAdminApiUrl(`/api/admin/careers/applications`),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        id: applicationId,
        status: status,        // New status value
        notes: notes,          // Admin notes (optional)
      }),
    }
  );
  
  // 3. Refresh application data
  await fetchApplication();
  
  // 4. Trigger activity timeline refresh
  window.dispatchEvent(new Event('refresh-activity-timeline'));
};
```

### Step 3: API Route Processes Request
**Location:** `apps/admin/src/app/api/admin/careers/applications/route.ts`

**File:** `route.ts` - PATCH handler (lines 76-186)

**Process:**

1. **Authentication Check:**
   ```typescript
   if (!(await isAdmin(request))) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }
   ```
   - Verifies the user is an admin
   - Checks JWT token from Authorization header

2. **Get Current State:**
   ```typescript
   const { data: currentApplication } = await supabaseAdmin
     .from("job_applications")
     .select("status, notes")
     .eq("id", id)
     .single();
   ```
   - Fetches current status before update
   - Needed to log the change (old_status → new_status)

3. **Validate Status:**
   ```typescript
   const validStatuses = [
     "pending", "reviewing", "phone_screen", 
     "technical_interview", "final_interview",
     "interviewed", "offer_extended", "offer_accepted",
     "offer_declined", "rejected", "hired"
   ];
   if (!validStatuses.includes(status)) {
     return NextResponse.json({ error: "Invalid status" }, { status: 400 });
   }
   ```

4. **Update Database:**
   ```typescript
   const { data: application, error } = await supabaseAdmin
     .from("job_applications")
     .update(updateData)  // { status: "reviewing" }
     .eq("id", id)
     .select(`*, job_postings(...)`)
     .single();
   ```
   - Updates the `status` column in `job_applications` table
   - Also updates `updated_at` timestamp (via database trigger)

5. **Log to Activity Timeline:**
   ```typescript
   if (status && currentApplication && currentApplication.status !== status) {
     await supabaseAdmin
       .from("application_activity_log")
       .insert({
         application_id: id,
         action_type: "status_changed",
         action_details: {
           old_status: currentApplication.status,  // "pending"
           new_status: status,                     // "reviewing"
         },
         performed_by: user?.id || null,          // Admin user ID
       });
   }
   ```
   - Creates an activity log entry
   - Records who made the change and when
   - Stores old and new status values

6. **Return Updated Application:**
   ```typescript
   return NextResponse.json({ application });
   ```

### Step 4: UI Updates
After the API call succeeds:

1. **Application Data Refreshes:**
   - `fetchApplication()` is called
   - New status is displayed in the UI
   - Badge color updates based on status

2. **Activity Timeline Refreshes:**
   - Event `refresh-activity-timeline` is dispatched
   - Timeline component fetches new activities
   - Shows new entry: "Status changed from 'Pending' to 'Reviewing'"

---

## 👤 CLIENT/USER SIDE: Viewing Status

### Step 1: User Accesses Tracking Page
**Location:** `/careers/track`

**File:** `apps/website/src/app/careers/track/TrackApplicationClient.tsx`

**URL Format:**
```
/careers/track?id=f09166f4-fba3-4234-b146-f51ad5a94634&email=user@example.com
```

### Step 2: Auto-Track on Page Load
**Code Flow:**
```tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const emailParam = params.get("email");
  
  // Auto-track if both are provided
  if (id && emailParam) {
    trackApplication(id, emailParam);
  }
}, [trackApplication]);
```

### Step 3: Fetch Application Status
**Function:** `trackApplication()`

```tsx
const trackApplication = async (id: string, emailAddr: string) => {
  setIsLoading(true);
  
  // Call public API endpoint
  const response = await fetch(
    `/api/careers/applications/track?id=${encodeURIComponent(id)}&email=${encodeURIComponent(emailAddr)}`
  );
  
  const data = await response.json();
  setApplication(data.application);  // Contains status
};
```

### Step 4: API Route Returns Status
**Location:** `apps/website/src/app/api/careers/applications/track/route.ts`

**Process:**

1. **Extract Parameters:**
   ```typescript
   const applicationId = searchParams.get("id");
   const email = searchParams.get("email");
   ```

2. **Query Database:**
   ```typescript
   const { data: application, error } = await supabaseAdmin
     .from("job_applications")
     .select(`
       id,
       full_name,
       email,
       status,              // Current status (e.g., "reviewing")
       created_at,
       updated_at,
       job_postings (
         id,
         title,
         department
       )
     `)
     .eq("id", applicationId)
     .eq("email", email.toLowerCase())  // Security: verify email matches
     .single();
   ```

3. **Security Check:**
   - Verifies email matches the application
   - Prevents users from viewing other people's applications
   - Returns 404 if no match found

4. **Return Public Data:**
   ```typescript
   return NextResponse.json({
     application: {
       id: application.id,
       full_name: application.full_name,
       status: application.status,        // "reviewing"
       created_at: application.created_at,
       updated_at: application.updated_at,
       job_posting: {
         id: application.job_postings.id,
         title: application.job_postings.title,
         department: application.job_postings.department,
       },
     },
   });
   ```
   - **Note:** Only returns safe, public data
   - Does NOT return admin notes, internal IDs, or sensitive info

### Step 5: Display Status to User
**Status Display Logic:**
```tsx
const getStatusInfo = (status: string) => {
  const statusMap = {
    pending: {
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: <Clock className="w-4 h-4" />,
      description: "Your application has been received and is awaiting review.",
    },
    reviewing: {
      label: "Under Review",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: <FileText className="w-4 h-4" />,
      description: "Your application is currently being reviewed by our team.",
    },
    // ... other statuses
  };
  
  return statusMap[status] || statusMap.pending;
};
```

**UI Rendering:**
```tsx
{application && (
  <Card>
    <Badge className={getStatusInfo(application.status).color}>
      {getStatusInfo(application.status).icon}
      {getStatusInfo(application.status).label}  // "Under Review"
    </Badge>
    <p>{getStatusInfo(application.status).description}</p>
    {/* Shows application details */}
  </Card>
)}
```

---

## 🔄 Complete Flow Example

### Scenario: Admin changes status from "Pending" to "Reviewing"

1. **Admin Action:**
   - Admin opens application detail page
   - Sees current status: "Pending" (yellow badge)
   - Selects "Reviewing" from dropdown
   - Clicks "Save Changes"

2. **Backend Processing:**
   - API validates admin authentication
   - Fetches current status: "pending"
   - Updates database: `status = "reviewing"`
   - Logs activity: `status_changed` with old/new values
   - Returns updated application

3. **Admin UI Update:**
   - Status badge changes to blue "Reviewing"
   - Activity timeline shows new entry
   - Page refreshes with new data

4. **User Views Status:**
   - User visits `/careers/track?id=...&email=...`
   - Page auto-fetches status
   - API returns current status: "reviewing"
   - User sees blue "Under Review" badge
   - Description: "Your application is currently being reviewed by our team."

---

## 🔐 Security Considerations

### Admin Side:
- ✅ Requires admin authentication (JWT token)
- ✅ Validates user role is "admin"
- ✅ Uses service role key for database access (bypasses RLS)

### Client Side:
- ✅ Public endpoint (no auth required)
- ✅ Email verification required
- ✅ Only returns safe, public data
- ✅ No sensitive information exposed
- ✅ Users can only view their own applications

---

## 📊 Database Schema

### `job_applications` Table:
```sql
- id: UUID (primary key)
- status: application_status (enum)
- updated_at: TIMESTAMP (auto-updated)
- ... other fields
```

### `application_activity_log` Table:
```sql
- id: UUID (primary key)
- application_id: UUID (foreign key)
- action_type: TEXT ("status_changed")
- action_details: JSONB ({ old_status, new_status })
- performed_by: UUID (admin user ID)
- performed_at: TIMESTAMP
```

---

## 🎯 Key Differences: Admin vs Client

| Feature | Admin Side | Client Side |
|---------|-----------|-------------|
| **Authentication** | Required (Admin role) | Not required |
| **Data Access** | Full application data | Limited public data |
| **Can Modify** | Yes (status, notes) | No (read-only) |
| **Activity Log** | Visible | Not visible |
| **Admin Notes** | Visible & editable | Not visible |
| **API Endpoint** | `/api/admin/careers/applications` | `/api/careers/applications/track` |

---

## 🚀 Real-Time Updates

Currently, status changes are **not real-time**:
- Admin changes status → Database updated immediately
- User must refresh tracking page to see new status
- No WebSocket/polling implemented

**Future Enhancement:** Could add:
- WebSocket connection for real-time updates
- Email notifications on status change
- Push notifications to user
