# Authentication Flow in TheFesta Website

## Overview

The website uses Supabase Authentication for user management. This document explains how authentication works throughout the application.

## Authentication Components

### 1. Supabase Client (`apps/website/src/lib/supabaseClient.ts`)

- Creates a Supabase client using the anon key
- Uses lazy initialization to handle build-time scenarios
- Provides the `supabase` export used throughout the app

### 2. Authentication Check Flow

#### Step 1: Session Check
```typescript
const { data: { session } } = await supabase.auth.getSession();
```
- Checks if there's an active session token stored in the browser
- Returns `null` if no session exists
- Does NOT verify if the user exists in the database

#### Step 2: Database Verification
```typescript
const { data: userData } = await supabase
  .from("users")
  .select("id")
  .eq("id", session.user.id)
  .single();
```
- Verifies the user actually exists in the `users` table
- Uses RLS policy: "Users can view their own data" (auth.uid() = id)
- This is the critical step that ensures the user is in the database

### 3. Authentication States

**Not Authenticated:**
- No session token exists
- OR session exists but user not in database
- Shows: "Login" and "Get Started" buttons

**Authenticated:**
- Session token exists
- AND user exists in the `users` table
- Shows: "My Inquiries" and "My Applications" links

**Checking:**
- Initial state while verifying authentication
- Prevents showing wrong links during check
- Shows placeholder to prevent layout shift

## Where Authentication is Used

### 1. Navbar Component
- **Location:** `apps/website/src/components/layout/Navbar.tsx`
- **Purpose:** Show/hide user-specific navigation links
- **Check:** Verifies session + database existence
- **Behavior:** 
  - Shows "My Inquiries" and "My Applications" only when authenticated
  - Shows "Login" and "Get Started" when not authenticated
  - Shows nothing (placeholder) while checking

### 2. Apply Page
- **Location:** `apps/website/src/app/careers/[id]/apply/ApplyClient.tsx`
- **Purpose:** Require authentication to apply for jobs
- **Check:** Session check only (redirects to login if no session)
- **Behavior:** Redirects to login page if not authenticated

### 3. My Applications Page
- **Location:** `apps/website/src/app/careers/my-applications/MyApplicationsClient.tsx`
- **Purpose:** Show user's job applications
- **Check:** Session check + API authentication
- **Behavior:** Redirects to login if no session

### 4. API Endpoints

#### `/api/careers/jobs`
- **Public:** Returns job listings without descriptions
- **Authenticated:** Returns full job details including descriptions
- **Check:** Verifies session + user exists in database

#### `/api/careers/applications`
- **Requires:** Authentication (session + database user)
- **Check:** Uses `getAuthenticatedUser()` helper
- **Behavior:** Returns 401 if not authenticated

#### `/api/careers/applications/my-applications`
- **Requires:** Authentication
- **Returns:** User's own applications only
- **Check:** Verifies session + user exists in database

## Authentication Helper Functions

### `getAuthenticatedUser(request: NextRequest)`

Used in API routes to verify authentication:

```typescript
async function getAuthenticatedUser(request: NextRequest) {
  // 1. Extract token from Authorization header
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  // 2. Verify token with Supabase
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  
  // 3. Verify user exists in database
  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();
  
  // 4. Return user info if both checks pass
  return userData ? { userId: user.id, email: user.email } : null;
}
```

## Common Issues and Solutions

### Issue: Links showing when user not authenticated

**Cause:** Race condition - component renders before auth check completes

**Solution:** 
- Added `isCheckingAuth` state
- Show placeholder while checking
- Only show links after verification completes

### Issue: Session exists but user not in database

**Cause:** User logged in via Supabase Auth but not synced to `users` table

**Solution:**
- Always verify user exists in database, not just session
- Show as "not authenticated" if user missing from database

### Issue: Stale session tokens

**Cause:** Old session token still in browser storage

**Solution:**
- Supabase automatically refreshes tokens
- `onAuthStateChange` listener updates state when session changes
- Database check ensures user still exists

## Authentication Flow Diagram

```
User visits page
    ↓
Navbar checks auth
    ↓
Get session from Supabase
    ↓
Session exists? ──No──→ Show Login/Signup
    ↓ Yes
Query users table
    ↓
User exists? ──No──→ Show Login/Signup
    ↓ Yes
Show "My Inquiries" & "My Applications"
```

## Best Practices

1. **Always verify database existence** - Don't rely on session alone
2. **Use loading states** - Prevent showing wrong UI during checks
3. **Handle timeouts** - Add timeouts to prevent hanging
4. **Listen to auth changes** - Use `onAuthStateChange` for real-time updates
5. **Check in API routes** - Server-side verification is more secure

## Security Notes

- Session tokens are stored in browser (httpOnly cookies recommended for production)
- RLS policies ensure users can only access their own data
- API routes verify authentication server-side
- Database checks prevent unauthorized access even with valid session tokens
