# Careers Page Authentication Flow

## Overview

The careers page has a specific authentication flow that ensures:
1. **Job listings are visible to everyone** (unauthenticated users can browse)
2. **Job descriptions are hidden** for unauthenticated users
3. **Apply page requires authentication** - redirects to login if not authenticated
4. **No auto-login** - users must manually log in

## Flow Diagram

```
User visits /careers
    ↓
Can see job listings (titles, departments, locations)
    ↓
Job descriptions are HIDDEN (shows login prompt)
    ↓
User clicks "Apply now"
    ↓
Redirects to /login?next=/careers/[id]/apply
    ↓
User enters credentials and logs in
    ↓
Redirected back to /careers/[id]/apply
    ↓
Can now see full job description and apply
```

## Key Components

### 1. Careers Listing Page (`/careers` and `/careers/positions`)

**Accessibility:** ✅ Public (everyone can view)

**What unauthenticated users see:**
- Job titles
- Departments
- Locations
- Employment types
- Salary ranges (if available)
- ❌ **NO job descriptions**
- Login prompts instead of descriptions
- "Log in to Apply" button instead of "Apply now"

**What authenticated users see:**
- Everything above PLUS:
- ✅ Full job descriptions
- ✅ Requirements
- ✅ Responsibilities
- ✅ "Apply now" button

**Implementation:**
- `JobSection.tsx` - Checks authentication but doesn't require it
- Fetches jobs from API (API filters descriptions based on auth)
- Shows login prompts for unauthenticated users

### 2. Apply Page (`/careers/[id]/apply`)

**Accessibility:** 🔒 **Requires Authentication**

**Behavior:**
1. User clicks "Apply now" → Redirects to `/login?next=/careers/[id]/apply`
2. User logs in → Redirected back to apply page
3. Apply page checks authentication:
   - ✅ Has session AND exists in database → Shows form
   - ❌ No session OR not in database → Redirects to login

**Implementation:**
- `ApplyClient.tsx` - Checks auth on mount
- Uses `router.replace()` to prevent back button issues
- Verifies user exists in database (not just session)
- Shows loading state while checking
- Redirects immediately if not authenticated

### 3. API Endpoint (`/api/careers/jobs`)

**Behavior:**
- **Without Authorization header:**
  - Returns jobs WITHOUT descriptions, requirements, responsibilities
  - Returns basic info only (title, department, location, etc.)

- **With valid Authorization header:**
  - Verifies token
  - Verifies user exists in database
  - Returns FULL job details including descriptions

**Implementation:**
- `route.ts` - Checks Authorization header
- Uses `getAuthenticatedUser()` helper
- Sanitizes response for unauthenticated users

## Authentication Checks

### Careers Page (Listing)
```typescript
// Checks auth but doesn't require it
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  // Verify user exists in database
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("id", session.user.id)
    .single();
  
  setIsAuthenticated(!!userData);
}
// Still shows jobs even if not authenticated
```

### Apply Page
```typescript
// REQUIRES authentication
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  router.replace(`/login?next=${encodeURIComponent(currentPath)}`);
  return; // Don't show anything
}

// Verify user exists in database
const { data: userData } = await supabase
  .from("users")
  .select("id")
  .eq("id", session.user.id)
  .single();

if (!userData) {
  router.replace(`/login?next=${encodeURIComponent(currentPath)}`);
  return; // Don't show anything
}

// Only show form if authenticated AND in database
```

## Common Issues and Fixes

### Issue: Careers page shows descriptions for unauthenticated users

**Cause:** API might be returning descriptions, or frontend is not checking auth properly

**Fix:**
- Ensure API endpoint checks Authorization header
- Ensure frontend passes token only if authenticated
- Verify `fetchJobPostings()` only passes token when session exists

### Issue: "Apply now" auto-logs users in

**Cause:** Apply page might not be checking auth properly

**Fix:**
- Apply page MUST check auth on mount
- Use `router.replace()` not `router.push()` to prevent back button
- Redirect immediately if no session or user not in database
- Don't show any content until authenticated

### Issue: Users can see apply page without logging in

**Cause:** Auth check might be failing or not running

**Fix:**
- Ensure `isCheckingAuth` starts as `true`
- Show loading state while checking
- Only set `isCheckingAuth` to `false` after verification
- Always redirect if check fails

## Testing Checklist

- [ ] Unauthenticated user can view careers page
- [ ] Unauthenticated user sees job listings (no descriptions)
- [ ] Unauthenticated user sees login prompts
- [ ] Unauthenticated user clicking "Apply now" redirects to login
- [ ] After login, user is redirected back to apply page
- [ ] Apply page shows full job description after login
- [ ] Apply page redirects if user logs out
- [ ] Apply page doesn't show content before auth check completes
- [ ] No auto-login happens anywhere
- [ ] All auth checks verify user exists in database

## Security Notes

1. **Never auto-login users** - They must manually enter credentials
2. **Always verify database existence** - Session token alone is not enough
3. **Use `router.replace()` for redirects** - Prevents back button bypass
4. **Show loading states** - Don't flash content before auth check
5. **API filters data** - Server-side filtering is more secure than client-side
