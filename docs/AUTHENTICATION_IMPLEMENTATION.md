# Authentication Implementation Summary

## Overview
Complete Supabase authentication system with email/password, OAuth (Google & Apple), and password reset functionality.

## Implemented Features

### 1. Email/Password Authentication
- ✅ **Sign Up**: Creates user account, stores user_type (couple/vendor), creates database record
- ✅ **Sign In**: Authenticates user, verifies database record, redirects based on role
- ✅ **User Record Creation**: Automatically creates user in `users` table after authentication
- ✅ **Role-Based Redirects**: 
  - Couple → `/` (homepage)
  - Vendor → `/vendor-portal`
  - Admin → `/admin`

### 2. OAuth Authentication (Google & Apple)
- ✅ **OAuth Sign Up**: Supports user type selection (couple/vendor) during signup
- ✅ **OAuth Sign In**: Works for existing users
- ✅ **OAuth Callback Handler**: Client-side component handles both PKCE and implicit flows
- ✅ **User Record Creation**: Automatically creates user record after OAuth authentication
- ✅ **Role Assignment**: Properly assigns role based on user_type parameter

### 3. Password Reset Flow
- ✅ **Forgot Password**: Sends reset email with proper redirect URL
- ✅ **Reset Password**: Handles password reset from email link
- ✅ **Session Validation**: Checks for valid reset session before allowing password change
- ✅ **URL Hash Handling**: Properly extracts tokens from URL hash

### 4. Error Handling & User Feedback
- ✅ **Toast Notifications**: All authentication actions use toast notifications
- ✅ **Error Messages**: Clear, user-friendly error messages
- ✅ **Success Messages**: Confirmation messages for successful actions
- ✅ **Loading States**: Proper loading indicators during async operations

## File Structure

### Core Authentication Files
- `apps/website/src/lib/auth.ts` - Authentication utilities and helpers
- `apps/website/src/lib/quotes.ts` - Random quotes for login/signup pages
- `apps/website/src/lib/supabaseClient.ts` - Supabase client configuration

### Authentication Pages
- `apps/website/src/app/login/page.tsx` - Sign in page
- `apps/website/src/app/signup/page.tsx` - Sign up page
- `apps/website/src/app/forgot-password/page.tsx` - Forgot password page
- `apps/website/src/app/reset-password/page.tsx` - Reset password page
- `apps/website/src/app/auth/callback/page.tsx` - OAuth callback handler (client-side)
- `apps/website/src/app/auth/callback/route.ts` - OAuth callback route (server-side redirect)

## Authentication Flow Details

### Sign Up Flow
1. User fills form (name, email, password, user_type)
2. `supabase.auth.signUp()` creates auth user
3. If session exists → `ensureUserRecord()` creates database record
4. `getUserTypeFromSession()` determines user type
5. `getRedirectPath()` returns appropriate redirect
6. User redirected to their dashboard

### Sign In Flow
1. User enters email/password
2. `supabase.auth.signInWithPassword()` authenticates
3. `ensureUserRecord()` verifies/creates database record
4. `getUserTypeFromSession()` gets user type
5. `getRedirectPath()` returns redirect path
6. User redirected to their dashboard

### OAuth Flow (Google/Apple)
1. User clicks OAuth button
2. `handleOAuthSignIn()` initiates OAuth flow
3. User redirected to provider (Google/Apple)
4. Provider redirects to `/auth/callback` with code/tokens
5. Client-side callback page handles session:
   - Extracts tokens from URL hash (implicit flow) OR
   - Exchanges code for session (PKCE flow)
6. `ensureUserRecord()` creates/verifies database record
7. Role updated if user_type provided
8. User redirected to appropriate dashboard

### Forgot Password Flow
1. User enters email
2. `supabase.auth.resetPasswordForEmail()` sends reset email
3. Email contains link to `/reset-password`
4. User clicks link → redirected with tokens in URL hash
5. Reset password page extracts tokens and validates session
6. User sets new password
7. `supabase.auth.updateUser()` updates password
8. User redirected to login

## Database Schema Requirements

The `users` table must have:
- `id` (UUID, primary key, references auth.users.id)
- `email` (VARCHAR, unique, not null)
- `password` (VARCHAR, not null) - placeholder value used
- `name` (VARCHAR, nullable)
- `phone` (VARCHAR, nullable)
- `avatar` (TEXT, nullable)
- `role` (ENUM: 'user' | 'vendor' | 'admin', default 'user')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

## Supabase Configuration

### Required Settings
1. **OAuth Providers**: Enable Google and Apple in Supabase Dashboard
   - Go to Authentication → Providers in Supabase Dashboard
   - Toggle Google/Apple to Enabled
   - Add OAuth credentials (Client ID, Secret, etc.)
   - See [SUPABASE_OAUTH_SETUP.md](./SUPABASE_OAUTH_SETUP.md) for detailed instructions

2. **Redirect URLs**: Add to Supabase Auth settings:
   - Go to Authentication → URL Configuration
   - Add `http://localhost:3000/auth/callback` (development)
   - Add `https://yourdomain.com/auth/callback` (production)
   - Set Site URL to your application URL

3. **Email Templates**: Configure password reset email template
4. **Email Confirmation**: Can be enabled/disabled based on requirements

### OAuth Provider Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `https://[your-project-ref].supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret to Supabase Dashboard

#### Apple OAuth Setup
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create a Services ID
3. Configure Sign in with Apple
4. Add your domain and redirect URLs
5. Create a Key for Sign in with Apple
6. Copy Services ID and Secret Key to Supabase Dashboard

For detailed step-by-step instructions, see [SUPABASE_OAUTH_SETUP.md](./SUPABASE_OAUTH_SETUP.md).

## Security Features

- ✅ Session validation before password reset
- ✅ User record verification in database
- ✅ Role-based access control
- ✅ Secure OAuth flow with PKCE support
- ✅ Proper error handling without exposing sensitive info
- ✅ Token validation in reset password flow

## Testing Checklist

- [ ] Sign up as couple → redirects to homepage
- [ ] Sign up as vendor → redirects to vendor portal
- [ ] Sign in as couple → redirects to homepage
- [ ] Sign in as vendor → redirects to vendor portal
- [ ] Sign in as admin → redirects to admin panel
- [ ] OAuth signup with Google (couple) → creates account, redirects correctly
- [ ] OAuth signup with Google (vendor) → creates account, redirects correctly
- [ ] OAuth signup with Apple (couple) → creates account, redirects correctly
- [ ] OAuth signup with Apple (vendor) → creates account, redirects correctly
- [ ] OAuth login with Google → redirects based on existing role
- [ ] OAuth login with Apple → redirects based on existing role
- [ ] Forgot password → sends email
- [ ] Reset password → updates password, redirects to login
- [ ] User records created in database for all flows
- [ ] Toast notifications appear for all actions
- [ ] Error handling works for invalid credentials
- [ ] Error handling works for network issues

## OAuth Implementation Details

### OAuth Flow Types Supported
- **PKCE Flow**: Uses authorization code exchange (more secure, recommended)
- **Implicit Flow**: Uses tokens in URL hash (fallback for compatibility)

### OAuth Metadata Extraction
The system automatically extracts user information from OAuth providers:
- **Name**: Extracted from `full_name`, `name`, `display_name`, or `first_name` + `last_name`
- **Avatar**: Extracted from `avatar_url`, `picture`, or `photo_url`
- **Email**: Provided by OAuth provider
- **Email Verified**: Automatically set by Supabase

### OAuth Error Handling
The implementation includes comprehensive error handling for:
- Provider not enabled errors
- Invalid credentials
- Network failures
- Session creation failures
- Missing redirect URLs

All errors are displayed as user-friendly toast notifications.

## Troubleshooting

### OAuth Provider Not Enabled Error
**Error**: `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`

**Solution**:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable the provider (Google/Apple)
3. Add required OAuth credentials
4. Save the configuration
5. Try again

### OAuth Redirect Not Working
**Error**: Redirects to error page or doesn't redirect back

**Solution**:
1. Verify redirect URL is added in Supabase Dashboard → Authentication → URL Configuration
2. Verify redirect URL matches exactly (including protocol and port)
3. Check that Site URL is set correctly in Supabase Dashboard
4. For Google: Verify redirect URI in Google Cloud Console matches Supabase callback URL
5. For Apple: Verify redirect URLs in Apple Developer Portal

### OAuth User Record Not Created
**Error**: User authenticated but no record in `users` table

**Solution**:
1. Check browser console for errors
2. Verify `ensureUserRecord()` is being called in callback handler
3. Check database permissions for `users` table
4. Verify user has INSERT permission on `users` table

### OAuth Session Not Persisting
**Error**: User redirected but immediately logged out

**Solution**:
1. Verify Supabase client is configured with `persistSession: true`
2. Check localStorage is available and not blocked
3. Verify `detectSessionInUrl: true` is set in Supabase client config
4. Check browser console for session errors

## Known Considerations

1. **Password Field**: The `users` table requires a password field, but we use a placeholder since Supabase Auth manages passwords separately.

2. **OAuth Callback**: Uses client-side component to handle both PKCE (code) and implicit (hash) flows for maximum compatibility.

3. **Session Persistence**: Sessions are automatically persisted by Supabase client in localStorage with proper configuration.

4. **Email Confirmation**: If email confirmation is enabled in Supabase, users will need to confirm before accessing the app.

5. **OAuth User Type**: For signup flows, `user_type` parameter is passed through OAuth callback to ensure correct role assignment.

6. **Metadata Extraction**: OAuth providers may return different metadata field names, so the implementation checks multiple possible fields.
