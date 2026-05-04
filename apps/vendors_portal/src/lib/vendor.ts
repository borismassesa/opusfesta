import { auth } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from './supabase'

export type CurrentVendor = {
  id: string
  slug: string
  businessName: string
  category: string
  bio: string | null
  logo: string | null
  coverImage: string | null
  onboardingStatus: VendorOnboardingStatus
  role: 'owner' | 'manager' | 'staff'
  stats: {
    viewCount: number
    inquiryCount: number
    saveCount: number
    averageRating: number
    reviewCount: number
  }
}

// Mirrors the `vendor_onboarding_status` enum after migration
// 20260501000002_vendor_verification_b_lite.sql. `active` is the only state
// that grants dashboard access; everything else funnels to /pending.
export type VendorOnboardingStatus =
  | 'application_in_progress'
  | 'verification_pending'
  | 'admin_review'
  | 'needs_corrections'
  | 'active'
  | 'suspended'

export type CurrentVendorState =
  | { kind: 'live'; vendor: CurrentVendor }
  | { kind: 'no-application' }
  | {
      kind: 'pending-approval'
      status: Exclude<VendorOnboardingStatus, 'active' | 'suspended'>
      vendorName: string
      // Surfaced so /pending can fetch per-artifact verification progress
      // (which doc is uploaded, whether the agreement is signed) and reflect
      // it as per-step pills on the timeline.
      vendorId: string
    }
  | { kind: 'suspended'; vendorName: string; vendorId: string }
  | { kind: 'no-env' }

type VendorRow = {
  id: string
  slug: string
  business_name: string
  category: string
  bio: string | null
  logo: string | null
  cover_image: string | null
  onboarding_status: CurrentVendor['onboardingStatus']
  stats: CurrentVendor['stats'] | null
}

type MembershipRow = {
  vendor_id: string
  role: CurrentVendor['role']
  vendors: VendorRow | VendorRow[] | null
}

const DEFAULT_STATS: CurrentVendor['stats'] = {
  viewCount: 0,
  inquiryCount: 0,
  saveCount: 0,
  averageRating: 0,
  reviewCount: 0,
}

// Map legacy onboarding_status values to their B-lite equivalents. The
// migration UPDATE statement handles the bulk migration; this is a runtime
// safety net for any row that slipped through (e.g. partial migration apply).
function normalizeStatus(
  raw: string,
): Exclude<VendorOnboardingStatus, 'active' | 'suspended'> {
  switch (raw) {
    case 'application_in_progress':
    case 'invited':
    case 'in_progress':
      return 'application_in_progress'
    case 'verification_pending':
    case 'pending_review':
      return 'verification_pending'
    case 'admin_review':
      return 'admin_review'
    case 'needs_corrections':
      return 'needs_corrections'
    default:
      console.warn(
        `[vendor] unknown onboarding_status '${raw}' — defaulting to verification_pending`,
      )
      return 'verification_pending'
  }
}

/**
 * Resolve the current Clerk-authenticated user's vendor record for portal
 * pages to render against.
 *
 * Vendors register individually as businesses on OpusFesta — there is no team
 * to be invited to. A signed-in user without a vendor row has not yet started
 * a vendor application. The `vendor_memberships` table is still used internally
 * (a solo vendor is the `owner` of their own record) so we can layer in staff
 * support later without re-modeling.
 *
 * **Why the admin client (service role) for reads:**
 * The Clerk-authed Supabase client only works when the Clerk app has a JWT
 * template named `supabase` configured — and many dev environments (including
 * Clerk's keyless mode) don't have that out of the box. Without it the JWT's
 * `sub` claim never reaches PostgREST, so every RLS-bound query reads as
 * unauthenticated, and getCurrentVendor() returns `no-application` even for
 * a vendor that just submitted. We bypass that fragility by reading via the
 * service-role admin client and applying our own `WHERE user_id = ?` filter
 * — `userId` comes from `auth()`, which the Clerk middleware has already
 * verified, so the trust boundary is the same.
 *
 * Returns a discriminated state:
 *   - `live`: vendor approved and active — render the dashboard
 *   - `pending-approval`: vendor exists but not yet active — /pending shows
 *     which verification gate they're at (application / docs / agreement /
 *     admin review / corrections needed)
 *   - `suspended`: admin disabled the vendor — locked-out screen
 *   - `no-application`: signed-in user with no vendor record yet — apply CTA
 *   - `no-env`: Supabase env vars missing (dev-only fallback)
 *
 * Throws on any unexpected Supabase error so the portal `error.tsx` boundary
 * can render an actionable fallback instead of silent mock data.
 */
export async function getCurrentVendor(): Promise<CurrentVendorState> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return { kind: 'no-env' }
  }

  const { userId } = await auth()
  if (!userId) {
    console.warn('[vendor] getCurrentVendor: no Clerk userId — auth() empty')
    // Clerk middleware should have already redirected unauthenticated users
    // to /sign-in for any non-public route; reaching here means somebody is
    // calling getCurrentVendor() from a public route. Treat as 'no
    // application' so /pending shows the apply CTA rather than crashing.
    return { kind: 'no-application' }
  }

  const admin = createSupabaseAdminClient()

  // 1) Resolve the Supabase users.id for this Clerk userId. The submit action
  //    auto-provisions this row, so its absence means the vendor never
  //    completed application submission.
  const userLookup = await admin
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle<{ id: string }>()

  if (userLookup.error) {
    if (userLookup.error.code === 'PGRST205') {
      console.warn(
        `[vendor] ${userLookup.error.code} — public.users not in schema cache. Run NOTIFY pgrst, 'reload schema' on your Supabase project. Falling back to no-env.`,
      )
      return { kind: 'no-env' }
    }
    throw new Error(
      `[vendor] users lookup failed: ${userLookup.error.code} ${userLookup.error.message}`,
    )
  }

  if (!userLookup.data) {
    console.warn(
      `[vendor] no public.users row for clerk_id=${userId} — submit() never ran for this Clerk user, or the upsert failed. Returning no-application.`,
    )
    return { kind: 'no-application' }
  }
  const supabaseUserId = userLookup.data.id

  // 2) Find the user's active vendor membership(s). We query with admin so
  //    RLS doesn't drop rows when no Clerk JWT template is configured; the
  //    explicit user_id filter scopes the result to the authenticated caller.
  const { data, error } = await admin
    .from('vendor_memberships')
    .select(
      `
      vendor_id,
      role,
      vendors (
        id, slug, business_name, category, bio, logo, cover_image,
        onboarding_status, stats
      )
    `,
    )
    .eq('user_id', supabaseUserId)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(5)
    .returns<MembershipRow[]>()

  if (error) {
    if (error.code === 'PGRST205') {
      console.warn(
        `[vendor] ${error.code} — table 'public.vendor_memberships' not in schema cache. Run pending migrations on your Supabase project, or NOTIFY pgrst, 'reload schema'. Falling back to no-env state.`,
      )
      return { kind: 'no-env' }
    }
    throw new Error(
      `[vendor] vendor_memberships query failed: ${error.code} ${error.message}`,
    )
  }

  if (data && data.length > 1) {
    console.warn(
      `[vendor] user has ${data.length} active vendor memberships — silently using the oldest. Vendor switcher ships when staff support lands.`,
    )
  }

  const row = data?.[0]
  if (!row) {
    console.warn(
      `[vendor] no active vendor_memberships for users.id=${supabaseUserId} (clerk_id=${userId}). The vendor row may not have been inserted, or the ensure_vendor_owner_membership trigger didn't fire. Returning no-application.`,
    )
    return { kind: 'no-application' }
  }

  const v = Array.isArray(row.vendors) ? row.vendors[0] : row.vendors
  if (!v) {
    console.warn(
      `[vendor] active membership has null vendor row — possible orphan (vendor_id=${row.vendor_id})`,
    )
    return { kind: 'no-application' }
  }

  console.log(
    `[vendor] resolved: clerk_id=${userId} users.id=${supabaseUserId} vendor.id=${v.id} status=${v.onboarding_status}`,
  )

  // Gate dashboard access behind admin approval. Only `active` grants
  // dashboard access; everything else funnels through /pending so the vendor
  // sees exactly which verification gate they're at.
  if (v.onboarding_status === 'suspended') {
    return { kind: 'suspended', vendorName: v.business_name, vendorId: v.id }
  }

  if (v.onboarding_status !== 'active') {
    // Migration 20260501000003 maps legacy values (invited / in_progress /
    // pending_review) to the new ones, but if any unmigrated row leaks through
    // — e.g. someone re-applies an old script — we coerce to the closest new
    // value rather than crash the /pending page.
    const status = normalizeStatus(v.onboarding_status)
    return {
      kind: 'pending-approval',
      status,
      vendorName: v.business_name,
      vendorId: v.id,
    }
  }

  return {
    kind: 'live',
    vendor: {
      id: v.id,
      slug: v.slug,
      businessName: v.business_name,
      category: v.category,
      bio: v.bio,
      logo: v.logo,
      coverImage: v.cover_image,
      onboardingStatus: v.onboarding_status,
      role: row.role,
      stats: v.stats ?? DEFAULT_STATS,
    },
  }
}
