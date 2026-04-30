import { createClerkSupabaseServerClient } from './supabase'

export type CurrentVendor = {
  id: string
  slug: string
  businessName: string
  category: string
  bio: string | null
  logo: string | null
  coverImage: string | null
  onboardingStatus:
    | 'invited'
    | 'in_progress'
    | 'pending_review'
    | 'active'
    | 'suspended'
  role: 'owner' | 'manager' | 'staff'
  stats: {
    viewCount: number
    inquiryCount: number
    saveCount: number
    averageRating: number
    reviewCount: number
  }
}

export type CurrentVendorState =
  | { kind: 'live'; vendor: CurrentVendor }
  | { kind: 'no-membership' }
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

/**
 * Resolve the current Clerk-authenticated user's "active" vendor for portal
 * pages to render against.
 *
 * **Multi-membership behaviour:** if the user is an active member of multiple
 * vendor teams (e.g. owner of vendor A + staff at vendor B), the *oldest*
 * active membership wins. A vendor switcher ships in Phase 5+; until then a
 * console.warn is emitted when the row count exceeds 1 so support can spot
 * users surprised by which vendor they landed on.
 *
 * Returns a discriminated state:
 *   - `live`: env present, user has an active membership, vendor row loaded
 *   - `no-membership`: signed in but no active vendor_memberships row
 *   - `no-env`: Supabase env vars missing (dev-only fallback)
 *
 * Throws on any Supabase error so the portal `error.tsx` boundary can render
 * an actionable fallback instead of silent mock data.
 */
export async function getCurrentVendor(): Promise<CurrentVendorState> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return { kind: 'no-env' }
  }

  const supabase = await createClerkSupabaseServerClient()

  const { data, error } = await supabase
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
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(5)
    .returns<MembershipRow[]>()

  if (error) {
    // PGRST205 = table missing from PostgREST schema cache. Two common causes
    // in dev: (a) migrations haven't been applied to the connected Supabase
    // project, (b) cache hasn't reloaded after a recent migration. Either way
    // the portal can't render real data — fall back to the empty `no-env`
    // state so the dashboard boots, and surface a clear console warning so
    // the underlying problem is fixable.
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
      `[vendor] user has ${data.length} active vendor memberships — silently using the oldest. Vendor switcher ships in Phase 5+.`,
    )
  }

  const row = data?.[0]
  if (!row) return { kind: 'no-membership' }

  const v = Array.isArray(row.vendors) ? row.vendors[0] : row.vendors
  if (!v) {
    console.warn(
      `[vendor] active membership has null vendor row — possible orphan or RLS gap (vendor_id=${row.vendor_id})`,
    )
    return { kind: 'no-membership' }
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
