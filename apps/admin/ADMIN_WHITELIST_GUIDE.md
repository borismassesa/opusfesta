# Admin Whitelist Guide

## Overview

The admin whitelist is a security mechanism that restricts access to the admin portal to only authorized administrators. This document outlines what information should be tracked for each admin user.

## Current Implementation

Currently, the whitelist uses a simple comma-separated list of emails in the environment variable `NEXT_PUBLIC_ADMIN_WHITELIST`. This is checked before authentication to prevent unauthorized login attempts.

## Required Information for Admin Users

For each admin user in the whitelist, the following information should be tracked:

### 1. **Email** (Primary Identifier) ✅
- **Purpose**: Used for authentication and whitelist verification
- **Format**: Valid email address
- **Example**: `boris.massesa@opusfestaevents.com`
- **Required**: Yes
- **Current Implementation**: Stored in env var

### 2. **User ID** (UUID) ✅
- **Purpose**: Database reference, activity tracking, audit logs
- **Format**: UUID (e.g., `ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e`)
- **Required**: Yes
- **Current Implementation**: Fetched from `users` table after authentication

### 3. **Full Name** ✅
- **Purpose**: Display in UI, activity logs, audit trails
- **Format**: First and Last name (e.g., "Boris Massesa")
- **Required**: Recommended
- **Current Implementation**: Fetched from `users.full_name` or `auth.users.user_metadata.full_name`

### 4. **Role** ✅
- **Purpose**: Permission level (owner, admin, editor, viewer)
- **Format**: Enum value
- **Required**: Yes
- **Current Implementation**: Stored in `users.role` and checked in layout

### 5. **Active Status** ⚠️
- **Purpose**: Temporarily disable access without removing from whitelist
- **Format**: Boolean (true/false)
- **Required**: Recommended
- **Current Implementation**: Not implemented (would require database table)

### 6. **Created Date** ⚠️
- **Purpose**: Audit trail, track when admin was added
- **Format**: Timestamp
- **Required**: Recommended
- **Current Implementation**: Available in `users.created_at`

### 7. **Last Login** ⚠️
- **Purpose**: Security monitoring, identify inactive accounts
- **Format**: Timestamp
- **Required**: Recommended
- **Current Implementation**: Available in `auth.users.last_sign_in_at`

### 8. **Phone Number** (Optional)
- **Purpose**: Contact information, 2FA if implemented
- **Format**: Phone number string
- **Required**: No
- **Current Implementation**: Available in `users.phone` or `auth.users.phone`

### 9. **Avatar/Profile Picture** (Optional)
- **Purpose**: UI display, personalization
- **Format**: URL to image
- **Required**: No
- **Current Implementation**: Available in `users.avatar` or `auth.users.user_metadata.avatar_url`

## Recommended Data Structure

### Option 1: Keep Current Simple Approach (Recommended for Now)
- **Whitelist**: Emails in env var (`NEXT_PUBLIC_ADMIN_WHITELIST`)
- **Additional Data**: Fetched from database when needed
- **Pros**: Simple, secure, easy to manage
- **Cons**: Limited to email-based lookup

### Option 2: JSON Structure in Env Var
```json
{
  "admins": [
    {
      "email": "boris.massesa@opusfestaevents.com",
      "name": "Boris Massesa",
      "role": "owner",
      "active": true
    },
    {
      "email": "norah.kinunda@opusfestaevents.com",
      "name": "Norah Kinunda",
      "role": "admin",
      "active": true
    }
  ]
}
```
- **Pros**: More structured, includes additional metadata
- **Cons**: Harder to manage, requires JSON parsing

### Option 3: Database Table (Most Robust)
Create an `admin_whitelist` table:
```sql
CREATE TABLE admin_whitelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
- **Pros**: Most flexible, allows dynamic management, audit trail
- **Cons**: Requires database migration, more complex

## Current Data Flow

1. **Login Check**: Email checked against `NEXT_PUBLIC_ADMIN_WHITELIST`
2. **Authentication**: Supabase Auth validates credentials
3. **User Data Fetch**: After login, fetch from `users` table:
   - `id` (UUID)
   - `email`
   - `full_name` or `name`
   - `role`
   - `phone` (optional)
   - `avatar` (optional)
4. **Role Verification**: Layout checks role against allowed roles
5. **Activity Tracking**: User ID stored in `performed_by` for audit logs

## Important Considerations

### Security
- ✅ Email whitelist prevents unauthorized login attempts
- ✅ Role check ensures proper permissions
- ✅ User ID tracking for audit logs
- ⚠️ Consider adding active/inactive status
- ⚠️ Consider adding last login tracking

### Data Consistency
- Ensure `users` table has correct `full_name` for proper display
- Ensure `users.role` matches admin role requirements
- Sync data between `auth.users` and `public.users`

### Audit Trail
- All admin actions should include `performed_by` (user ID)
- Activity logs should show admin name, not just ID
- Consider logging admin access attempts (successful and failed)

## Recommendations

For the current implementation, ensure:

1. **Email whitelist** is properly configured in env var
2. **User records** in `users` table have:
   - Correct `email` matching whitelist
   - Proper `full_name` for display
   - Correct `role` (admin, owner, editor, or viewer)
3. **Auth users** have proper metadata:
   - `user_metadata.full_name` for name display
   - `app_metadata.role` for role verification

## Future Enhancements

Consider implementing:
- Admin management UI (add/remove admins)
- Active/inactive status toggle
- Last login tracking
- Admin activity dashboard
- Permission-based access control (beyond roles)
- 2FA/MFA for admins
- Admin session management
