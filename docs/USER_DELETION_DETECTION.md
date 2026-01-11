# User Deletion Detection & Session Management

## Problem

When a user is deleted from Supabase Auth (the backend), the app doesn't immediately detect this because:
1. The session token is cached locally in the browser
2. The app only checks if the user exists in the `users` table, not in `auth.users`
3. Supabase's `getSession()` returns cached tokens without verifying the user still exists

## Solution

We've implemented a comprehensive check that verifies the user still exists in Supabase Auth before trusting any session. This check runs:

1. **On initial auth check** - When the app loads and checks authentication
2. **On auth state changes** - When tokens refresh or auth events occur
3. **Before database operations** - Before checking/creating user records

## Implementation

### Core Function

Added `verifyUserExistsInAuth()` in `apps/website/src/lib/auth.ts`:
- Uses `supabase.auth.getUser()` to verify the user still exists
- Returns `false` if user is deleted or session is invalid
- Automatically signs out if user doesn't exist

### Updated Components

1. **Navbar** (`apps/website/src/components/layout/Navbar.tsx`)
   - Checks user existence on mount
   - Checks on auth state changes
   - Signs out if user deleted

2. **MenuOverlay** (`apps/website/src/components/layout/MenuOverlay.tsx`)
   - Verifies user exists before showing authenticated state
   - Clears session if user deleted

3. **CareersNavbar** (`apps/website/src/components/careers/CareersNavbar.tsx`)
   - Same verification on auth checks
   - Handles deleted users gracefully

4. **Vendor Portal AuthGuard** (`apps/vendor-portal/src/components/auth/AuthGuard.tsx`)
   - Verifies user exists before allowing access
   - Redirects to login if user deleted

5. **ApplyClient** (`apps/website/src/app/careers/[id]/apply/ApplyClient.tsx`)
   - Verifies user exists before allowing job applications
   - Prevents orphaned sessions

## How It Works

```typescript
// Check if user still exists in Supabase Auth
const userExistsInAuth = await supabase.auth.getUser()
  .then(({ data, error }) => {
    if (error || !data.user || data.user.id !== session.user.id) {
      return false; // User deleted or session invalid
    }
    return true; // User exists
  })
  .catch(() => false);

if (!userExistsInAuth) {
  // User was deleted - clear session immediately
  await supabase.auth.signOut();
  // Update UI state
  setIsAuthenticated(false);
  // Redirect to login if needed
}
```

## Benefits

1. **Immediate Detection**: Detects deleted users as soon as the app checks auth
2. **Automatic Cleanup**: Signs out and clears session automatically
3. **Prevents Errors**: Avoids errors from trying to use invalid sessions
4. **Better UX**: User sees login page instead of broken authenticated state

## Testing

To test this:
1. Sign in to the app
2. Delete the user from Supabase Dashboard (Authentication → Users)
3. Refresh the page or trigger an auth check
4. The app should automatically sign you out and redirect to login

## Notes

- This check is non-blocking and happens in the background
- It doesn't affect performance significantly
- The check runs on every auth state change for maximum reliability
- Works across all apps (website, vendor-portal, careers)
