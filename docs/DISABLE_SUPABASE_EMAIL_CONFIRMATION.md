# Disable Supabase Email Confirmation

To use our custom code-based verification system instead of Supabase's default email confirmation links, you need to disable email confirmation in your Supabase project settings.

## Steps to Disable Email Confirmation

1. **Go to Supabase Dashboard**
   - Navigate to your project: https://supabase.com/dashboard

2. **Open Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on **Providers** tab
   - Find the **Email** provider

3. **Disable Email Confirmation**
   - Scroll down to **Email Auth Settings**
   - Find **"Enable email confirmations"** toggle
   - **Turn OFF** the toggle (it should be gray/unchecked)
   - This prevents Supabase from sending default confirmation emails

4. **Save Changes**
   - Click **Save** if there's a save button
   - Changes are usually auto-saved

## Alternative: Disable via SQL (if available)

If you have access to the Supabase SQL editor, you can also run:

```sql
-- This updates the auth configuration to disable email confirmations
-- Note: This may not work in all Supabase versions - use dashboard method above
UPDATE auth.config 
SET enable_signup = true,
    enable_email_confirmations = false
WHERE id = 1;
```

## Verify It's Disabled

After disabling:
1. Try signing up a new user
2. You should **NOT** receive a Supabase confirmation email
3. You **SHOULD** receive our custom verification code email from OpusFesta

## Important Notes

- This setting affects **all** new signups in your project
- Existing users who haven't confirmed their email will still need to use the verification code system
- Password reset emails will still work (they're separate from signup confirmation)

## Troubleshooting

If you're still receiving Supabase confirmation emails after disabling:

1. **Check Email Templates**: Go to Authentication → Email Templates and make sure the confirmation template isn't being triggered
2. **Clear Cache**: Try signing up again after a few minutes
3. **Check API Usage**: Make sure you're using the `/api/auth/signup` endpoint, not the direct Supabase client `signUp()` method
