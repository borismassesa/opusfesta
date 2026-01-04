# Vercel Monorepo Deployment Guide

This monorepo contains three Next.js applications sharing the same Supabase instance:
- **Website** (`apps/website`) - Main public website at `thefestaevents.com`
- **Admin** (`apps/admin`) - Admin portal at `thefestaevents.com/admin`
- **Vendor Portal** (`apps/vendor-portal`) - Vendor portal at `thefestaevents.com/vendors`

## Deployment Setup: Same Domain with Paths

All three apps will be accessible on the same domain using different paths. This is the recommended approach for monorepos sharing the same Supabase.

### Step 1: Deploy All Three Apps as Separate Vercel Projects

#### Project 1: Website (Main Project)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Use your existing website project or create new one
3. **Root Directory**: `apps/website`
4. **Domain**: `thefestaevents.com` (your main domain)
5. **Environment Variables**: Your existing Supabase variables

#### Project 2: Admin
1. Create a new project in Vercel Dashboard
2. Import repository: `borismassesa/thefesta`
3. **Project Name**: `thefesta-admin` (or any name)
4. **Root Directory**: `apps/admin`
5. **Framework**: Next.js (auto-detected)
6. **Build Command**: `npm run build` (uses `apps/admin/vercel.json`)
7. **Output Directory**: `.next` (uses `apps/admin/vercel.json`)
8. **Install Command**: `cd ../.. && npm install`
9. **Environment Variables**: Same Supabase variables as website
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

#### Project 3: Vendor Portal
1. Create a new project in Vercel Dashboard
2. Import repository: `borismassesa/thefesta`
3. **Project Name**: `thefesta-vendor-portal` (or any name)
4. **Root Directory**: `apps/vendor-portal`
5. **Framework**: Next.js (auto-detected)
6. **Build Command**: `npm run build` (uses `apps/vendor-portal/vercel.json`)
7. **Output Directory**: `.next` (uses `apps/vendor-portal/vercel.json`)
8. **Install Command**: `cd ../.. && npm install`
9. **Environment Variables**: Same Supabase variables as website

### Step 2: Get Deployment URLs

After deploying admin and vendor-portal projects, note their Vercel deployment URLs:
- Admin: `https://thefesta-admin.vercel.app` (or your custom name)
- Vendor Portal: `https://thefesta-vendor-portal.vercel.app` (or your custom name)

### Step 3: Configure Rewrites in Main Website Project

Update the root `vercel.json` (or website project's vercel.json) with rewrites pointing to your deployed admin and vendor-portal projects:

```json
{
  "rewrites": [
    {
      "source": "/admin/:path*",
      "destination": "https://thefesta-admin.vercel.app/admin/:path*"
    },
    {
      "source": "/vendors/:path*",
      "destination": "https://thefesta-vendor-portal.vercel.app/vendors/:path*"
    }
  ]
}
```

**Important**: Replace the URLs above with your actual Vercel project URLs after deployment.

### Step 4: Verify Configuration

- ✅ Admin app has `basePath: '/admin'` in `apps/admin/next.config.mjs`
- ✅ Vendor portal has `basePath: '/vendors'` in `apps/vendor-portal/next.config.js`
- ✅ Root `vercel.json` has rewrites configured (update URLs after deployment)
- ✅ All three projects use the same Supabase environment variables

### Access URLs

After deployment:
- Website: `https://thefestaevents.com`
- Admin: `https://thefestaevents.com/admin`
- Vendor Portal: `https://thefestaevents.com/vendors`

## Configuration Files

- `vercel.json` (root) - Website deployment + rewrites
- `apps/admin/vercel.json` - Admin deployment config
- `apps/admin/next.config.mjs` - Admin Next.js config with `basePath: '/admin'`
- `apps/vendor-portal/vercel.json` - Vendor portal deployment config
- `apps/vendor-portal/next.config.js` - Vendor portal Next.js config with `basePath: '/vendors'`

## Environment Variables (Same for All Projects)

All three projects should have the same Supabase environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
