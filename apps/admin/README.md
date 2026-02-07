# OpusFesta Admin App

Admin portal for managing OpusFesta platform.

## Setup

### Environment Variables

Since Supabase is already configured in the website app, you can copy the environment variables:

**Option 1: Use the setup script**
```bash
cd apps/admin
./setup-env.sh
```

**Option 2: Manual setup**
Copy the Supabase variables from `apps/website/.env.local` to `apps/admin/.env.local`:

```bash
# Copy Supabase variables (including service role key for admin API routes)
grep -E "NEXT_PUBLIC_SUPABASE|SUPABASE_SERVICE_ROLE_KEY" apps/website/.env.local >> apps/admin/.env.local
```

**Option 3: Create manually**
Create `apps/admin/.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-from-website-app
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-anon-key-from-website-app
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-dashboard
NEXT_PUBLIC_ADMIN_WHITELIST=admin1@example.com,admin2@example.com,admin3@example.com
```

**Note:** The `SUPABASE_SERVICE_ROLE_KEY` is required for admin API routes. You can find it in your Supabase project dashboard under Settings > API > service_role key (keep this secret!).

**Production – Advice & Ideas (and other CMS) publish:** For published content to appear on the **production website**, the admin app must use the **same Supabase project** as the production website. Set `NEXT_PUBLIC_SUPABASE_URL` (and keys) in the admin’s production environment to the same values as the website. Only users with role **owner** or **admin** can publish; **editor** can save drafts but cannot publish (RLS restricts `published_content` updates).

**Admin Whitelist:** The admin whitelist is now managed via a database table (`admin_whitelist`). 

**Database Setup:**
1. Run the migration: `supabase/migrations/040_create_admin_whitelist.sql`
2. Populate existing admins: Run `supabase/migrate_admins_to_whitelist.sql` to migrate existing admin users

**Environment Variable (Fallback):** The `NEXT_PUBLIC_ADMIN_WHITELIST` environment variable can still be used as a fallback for backward compatibility. It should contain a comma-separated list of email addresses. The system will check the database first, then fall back to the env var if the API check fails.

**Managing Admins:** Use the API endpoint `/api/admin/whitelist` (requires owner role) to add, update, or remove admins. See `ADMIN_WHITELIST_GUIDE.md` for more details.

**Adding new admins:** Run the SQL script in Supabase Dashboard → SQL Editor, e.g. `supabase/add_new_admins_2025.sql`. That adds emails to `admin_whitelist` and promotes any existing auth users to `role = admin` in `users` and `auth.users`. If the person doesn’t have an account yet, they sign up first (e.g. on the main site), then re-run the “Promote existing users to admin” part of the script or use `supabase/make_user_admin_simple.sql` with their user id. Optionally add their email to `NEXT_PUBLIC_ADMIN_WHITELIST` (comma-separated) as a fallback.

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000` (or next available port).

## Features

- Dashboard with revenue overview
- Content management (pages, blog, media)
- Marketplace management (vendors, products, orders)
- Event management (bookings, tools)
- Organization management (employees)
- Review moderation
