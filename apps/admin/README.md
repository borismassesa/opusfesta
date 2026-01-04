# TheFesta Admin App

Admin portal for managing TheFesta platform.

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
# Copy Supabase variables
grep "NEXT_PUBLIC_SUPABASE" apps/website/.env.local >> apps/admin/.env.local
```

**Option 3: Create manually**
Create `apps/admin/.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-from-website-app
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-anon-key-from-website-app
```

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
