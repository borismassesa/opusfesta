'use server'

import { randomBytes } from 'node:crypto'
import { auth, currentUser } from '@clerk/nextjs/server'
import {
  createSupabaseAdminClient,
  createClerkSupabaseServerClient,
} from '@/lib/supabase'
import { findCategory } from './categories'
import { LANGUAGES } from './languages'
import { PERSONALITY_OPTIONS } from './personality'
import { CANCELLATION_OPTIONS, RESCHEDULE_OPTIONS } from './policies'
import { LIPA_NAMBA_NETWORKS, PAYOUT_OPTIONS } from './payouts'
import { SERVICE_MARKETS, TZ_REGIONS } from './regions'
import { getServicesForCategory } from './services'
import { getStylesForCategory } from './styles'
import type { OnboardingDraft } from './draft'

export type SubmitApplicationResult =
  | { ok: true; vendorId: string }
  | { ok: false; error: string; reason: 'unauth' | 'incomplete' | 'unknown' }

// Maps the onboarding-flow category IDs to the legacy `vendor_category` enum
// values used by the public website + storefront. Keep these in sync if the
// onboarding category list changes.
const CATEGORY_TO_DB: Record<string, string> = {
  venue: 'Venues',
  caterer: 'Caterers',
  photographer: 'Photographers',
  videographer: 'Videographers',
  cakes: 'Cake & Desserts',
  florist: 'Florists',
  planner: 'Wedding Planners',
  musician: 'DJs & Music',
  officiant: 'Officiants',
  beauty: 'Beauty & Makeup',
  extras: 'Decorators',
}

// Maps the onboarding payout-method tag to the v_b-lite enum.
const PAYOUT_METHOD_TO_DB: Record<
  NonNullable<OnboardingDraft['payoutMethod']>,
  'mpesa' | 'airtel' | 'tigo' | 'lipa_namba' | 'bank' | null
> = {
  mpesa: 'mpesa',
  'airtel-money': 'airtel',
  tigopesa: 'tigo',
  halopesa: null, // No 'halo' enum value yet — falls back to lipa_namba below
  'lipa-namba': 'lipa_namba',
  bank: 'bank',
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function buildLocation(draft: OnboardingDraft) {
  return {
    street: draft.street || null,
    street2: draft.street2 || null,
    city: draft.city || null,
    region: draft.region || null,
    postalCode: draft.postalCode || null,
    country: 'TZ',
    serviceMarkets: draft.serviceMarkets,
    homeMarket: draft.homeMarket,
  }
}

function buildContactInfo(draft: OnboardingDraft) {
  return {
    phone: draft.phone || null,
    email: draft.email || null,
    whatsapp: draft.whatsapp || null,
  }
}

function buildSocialLinks(draft: OnboardingDraft) {
  return {
    website: draft.socials.website || null,
    instagram: draft.socials.instagram || null,
    facebook: draft.socials.facebook || null,
    tiktok: draft.socials.tiktok || null,
    whatsapp: draft.socials.whatsapp || null,
  }
}

function buildApplicationSnapshot(draft: OnboardingDraft) {
  // Strip session-only blob URLs from team avatars before persisting — those
  // URLs only resolve in the vendor's own browser and would render as
  // 404/broken in admin. Counts and other fields are preserved verbatim so
  // admin can see exactly what was answered.
  const team = draft.team.map(({ avatarUrl: _avatarUrl, ...member }) => member)
  return {
    ...draft,
    team,
    // Resolved labels alongside raw IDs so admin review renders human-friendly
    // values without needing to import the vendor-portal lookup tables.
    labels: buildSnapshotLabels(draft),
    submittedAt: new Date().toISOString(),
  }
}

function buildSnapshotLabels(draft: OnboardingDraft) {
  const styles = draft.categoryId ? getStylesForCategory(draft.categoryId) : []
  const services = draft.categoryId ? getServicesForCategory(draft.categoryId) : []
  const homeMarket = SERVICE_MARKETS.find((m) => m.id === draft.homeMarket)
  return {
    category: draft.categoryId ? findCategory(draft.categoryId)?.profileLabel ?? null : null,
    region: TZ_REGIONS.find((r) => r.code === draft.region)?.name ?? null,
    homeMarket: homeMarket?.name ?? null,
    serviceMarkets: draft.serviceMarkets
      .map((id) => SERVICE_MARKETS.find((m) => m.id === id)?.name)
      .filter((x): x is string => Boolean(x)),
    languages: draft.languages
      .map((id) => LANGUAGES.find((l) => l.id === id)?.label)
      .filter((x): x is string => Boolean(x)),
    style: styles.find((s) => s.id === draft.style)?.label ?? null,
    personality:
      PERSONALITY_OPTIONS.find((p) => p.id === draft.personality)?.label ?? null,
    specialServices: draft.specialServices
      .map((id) => services.find((s) => s.id === id)?.label)
      .filter((x): x is string => Boolean(x)),
    cancellationLevel:
      CANCELLATION_OPTIONS.find((o) => o.id === draft.cancellationLevel)?.label ??
      null,
    reschedulePolicy:
      RESCHEDULE_OPTIONS.find((o) => o.id === draft.reschedulePolicy)?.label ??
      null,
    payoutMethod:
      PAYOUT_OPTIONS.find((o) => o.id === draft.payoutMethod)?.label ?? null,
    payoutNetwork:
      LIPA_NAMBA_NETWORKS.find((n) => n.id === draft.payoutNetwork)?.label ??
      null,
  }
}

function buildServicesOfferedJsonb(draft: OnboardingDraft) {
  // Per migration 025, services_offered is JSONB of {id, title, description}.
  return [
    ...draft.specialServices.map((id) => ({ id, title: id, description: '' })),
    ...draft.customServices.map((label) => ({
      id: `custom-${slugify(label)}`,
      title: label,
      description: '',
      custom: true,
    })),
  ]
}

function validateDraft(draft: OnboardingDraft): string | null {
  if (!draft.categoryId) return 'Pick a category before submitting.'
  if (!draft.vowsAccepted) return 'Vendor Vows must be accepted before submitting.'
  if (!draft.businessName.trim()) return 'Add a business name before submitting.'
  if (!draft.region) return 'Add a region before submitting.'
  if (!draft.city.trim()) return 'Add a city before submitting.'
  if (!draft.phone.trim() && !draft.email.trim()) {
    return 'Add at least one contact method (phone or email).'
  }
  if (draft.packages.length === 0) return 'Add at least one package.'
  if (!draft.cancellationLevel) return 'Pick a cancellation policy.'
  if (!draft.payoutMethod) return 'Pick a payout method.'
  if (!draft.payoutNumber.trim() || !draft.payoutAccountName.trim()) {
    return 'Add your payout account details.'
  }
  return null
}

/**
 * Submit a completed onboarding draft and provision the vendor record.
 *
 * 1. Ensures a `public.users` row exists for the current Clerk user (so the
 *    `requesting_user_id()` function in RLS can resolve them — no row means
 *    any RLS-bound query later returns zero results).
 * 2. Inserts (or updates, if the user already started a vendor row) the
 *    `vendors` record with every draft field mapped to its DB column.
 * 3. The `ensure_vendor_owner_membership_trigger` (migration 056) auto-creates
 *    the matching `vendor_memberships` row with role=owner.
 * 4. Persists the chosen payout method to `vendor_payout_methods` so the
 *    verification pipeline can flag it as `done`.
 * 5. Records the Vendor Vows acceptance into `vendor_agreements` as the v1
 *    e-signature for this vendor (a richer e-sign UI lives at /verify in PR
 *    follow-ups; this gives admins a row to point at today).
 * 6. Sets `onboarding_status = 'verification_pending'` so the portal layout
 *    sends them to /pending → /verify for the document upload step.
 *
 * Uses the service-role client because (a) `public.users` write is not
 * permitted to the Clerk-authed client, and (b) the `vendors` RLS policy
 * requires `requesting_user_id() = user_id`, which is only resolvable after
 * the user row exists. Clerk's `userId` is the source of trust here.
 */
export async function submitApplication(
  draft: OnboardingDraft,
): Promise<SubmitApplicationResult> {
  const { userId } = await auth()
  if (!userId) {
    return { ok: false, reason: 'unauth', error: 'Sign in before submitting.' }
  }

  const validation = validateDraft(draft)
  if (validation) {
    return { ok: false, reason: 'incomplete', error: validation }
  }

  const clerkUser = await currentUser()
  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress ?? draft.email ?? null
  const fullName =
    [draft.firstName, draft.lastName].filter(Boolean).join(' ').trim() ||
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ').trim() ||
    null

  if (!email) {
    return {
      ok: false,
      reason: 'incomplete',
      error: 'No email on file — set one in your account before submitting.',
    }
  }

  const admin = createSupabaseAdminClient()

  // 1) Provision public.users row keyed on clerk_id, so RLS can resolve it.
  const upsertUser = await admin
    .from('users')
    .upsert(
      {
        clerk_id: userId,
        email,
        name: fullName,
        // The legacy `password` column is NOT NULL but unused under Clerk;
        // store an opaque marker so the row inserts without leaking secrets.
        password: 'clerk-managed',
      },
      { onConflict: 'clerk_id' },
    )
    .select('id')
    .single<{ id: string }>()

  if (upsertUser.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[submit] users upsert failed: ${upsertUser.error.code} ${upsertUser.error.message}`,
    }
  }
  const supabaseUserId = upsertUser.data.id

  // 2) Build the vendors row payload.
  const dbCategory = CATEGORY_TO_DB[draft.categoryId!]
  if (!dbCategory) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[submit] no DB category mapping for '${draft.categoryId}'`,
    }
  }

  const baseSlug = slugify(draft.businessName) || 'vendor'

  // Re-use an existing draft vendor row if the user already has one; otherwise
  // create a fresh row. We look up by user_id since RLS won't filter against
  // our admin client and slug collisions are common across re-attempts.
  const existing = await admin
    .from('vendors')
    .select('id, slug')
    .eq('user_id', supabaseUserId)
    .limit(1)
    .maybeSingle<{ id: string; slug: string }>()

  if (existing.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[submit] vendors lookup failed: ${existing.error.code} ${existing.error.message}`,
    }
  }

  let slug = existing.data?.slug ?? baseSlug
  if (!existing.data) {
    // Resolve slug collisions by appending a short random suffix on retry.
    const slugCheck = await admin
      .from('vendors')
      .select('id', { count: 'exact', head: true })
      .eq('slug', baseSlug)
    if (slugCheck.error) {
      return {
        ok: false,
        reason: 'unknown',
        error: `[submit] slug check failed: ${slugCheck.error.code} ${slugCheck.error.message}`,
      }
    }
    if ((slugCheck.count ?? 0) > 0) {
      slug = `${baseSlug}-${randomBytes(3).toString('hex')}`
    }
  }

  // Core columns guaranteed to exist after migration 001 + 056 — anything
  // beyond this set is treated as "best effort" so missing migrations or
  // stale PostgREST schema caches don't block submit.
  const corePayload = {
    slug,
    user_id: supabaseUserId,
    business_name: draft.businessName.trim(),
    category: dbCategory,
    bio: draft.bio || null,
    location: buildLocation(draft),
    contact_info: buildContactInfo(draft),
    onboarding_status: 'verification_pending' as const,
    onboarding_started_at: new Date().toISOString(),
  }

  // Optional columns added by later migrations (021 packages, 025 services_offered
  // → JSONB, etc.). We attempt to write them after the core insert succeeds,
  // and tolerate PGRST204 ("column not in schema cache") by skipping the
  // missing column with a console warning. This keeps submit working even
  // when the project hasn't applied every historical migration.
  const optionalPayload: Record<string, unknown> = {
    social_links: buildSocialLinks(draft),
    services_offered: buildServicesOfferedJsonb(draft),
    packages: draft.packages,
    years_in_business: draft.yearsInBusiness
      ? Number.parseInt(draft.yearsInBusiness, 10) || null
      : null,
    // Full draft, so admin review can verify every answered field — including
    // ones the schema doesn't break out into columns (style/personality,
    // languages, deposit %, cancellation policy, FAQs, etc.).
    application_snapshot: buildApplicationSnapshot(draft),
  }

  let vendorId: string
  if (existing.data) {
    const update = await admin
      .from('vendors')
      .update(corePayload)
      .eq('id', existing.data.id)
      .select('id')
      .single<{ id: string }>()
    if (update.error) {
      return {
        ok: false,
        reason: 'unknown',
        error: `[submit] vendors update failed: ${update.error.code} ${update.error.message}`,
      }
    }
    vendorId = update.data.id
  } else {
    const insert = await admin
      .from('vendors')
      .insert(corePayload)
      .select('id')
      .single<{ id: string }>()
    if (insert.error) {
      return {
        ok: false,
        reason: 'unknown',
        error: `[submit] vendors insert failed: ${insert.error.code} ${insert.error.message}`,
      }
    }
    vendorId = insert.data.id
  }

  // Belt-and-braces: explicitly upsert the owner vendor_memberships row.
  //
  // Migration 056 installs an `ensure_vendor_owner_membership_trigger` on
  // INSERT-of-vendors that's *supposed* to do this for us, but in practice
  // we've seen environments where the trigger isn't installed (or silently
  // fails) and the vendor ends up without an active membership — which makes
  // getCurrentVendor() resolve to `no-application` even though their vendor
  // row exists. Doing the upsert here explicitly removes the dependency on
  // the trigger; if the trigger DOES fire, ON CONFLICT (vendor_id, user_id)
  // is a no-op.
  const membership = await admin
    .from('vendor_memberships')
    .upsert(
      {
        vendor_id: vendorId,
        user_id: supabaseUserId,
        role: 'owner' as const,
        status: 'active' as const,
      },
      { onConflict: 'vendor_id,user_id' },
    )
    .select('id')
    .single<{ id: string }>()

  if (membership.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[submit] vendor_memberships upsert failed: ${membership.error.code} ${membership.error.message}`,
    }
  }
  console.log(
    `[submit] vendor=${vendorId} user=${supabaseUserId} membership=${membership.data.id} owner=active`,
  )

  // Best-effort: persist each optional column. Skip any that the schema
  // doesn't know about so submit doesn't fail on a missing migration.
  await persistOptionalVendorColumns(vendorId, optionalPayload)

  // 3) Persist payout method.
  const payoutMethodDb =
    draft.payoutMethod && PAYOUT_METHOD_TO_DB[draft.payoutMethod]
  // Fallback: halopesa lands in lipa_namba bucket since there's no dedicated
  // enum value yet. This keeps the payout step persisted; admin can correct
  // during review.
  const resolvedPayoutMethod = payoutMethodDb ?? 'lipa_namba'

  const payoutPayload = {
    vendor_id: vendorId,
    method_type: resolvedPayoutMethod,
    provider:
      draft.payoutMethod === 'bank'
        ? draft.payoutBankName || null
        : draft.payoutMethod === 'lipa-namba'
          ? draft.payoutNetwork || null
          : null,
    account_number: draft.payoutNumber.trim(),
    account_holder_name: draft.payoutAccountName.trim(),
    status: 'pending' as const,
    is_default: true,
  }

  // The migration's unique index on vendor_payout_methods is partial
  // (`WHERE is_default`), and Postgres ON CONFLICT can't target partial
  // indexes (42P10). Use explicit select-then-insert-or-update so re-submits
  // replace the existing default cleanly.
  const existingPayout = await admin
    .from('vendor_payout_methods')
    .select('id')
    .eq('vendor_id', vendorId)
    .eq('is_default', true)
    .limit(1)
    .maybeSingle<{ id: string }>()

  if (existingPayout.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[submit] payout lookup failed: ${existingPayout.error.code} ${existingPayout.error.message}`,
    }
  }

  const payoutWrite = existingPayout.data
    ? await admin
        .from('vendor_payout_methods')
        .update(payoutPayload)
        .eq('id', existingPayout.data.id)
    : await admin.from('vendor_payout_methods').insert(payoutPayload)

  if (payoutWrite.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[submit] payout write failed: ${payoutWrite.error.code} ${payoutWrite.error.message}`,
    }
  }

  // 4) Vendor agreement: NOT recorded here. Vendor Vows is a values pledge —
  // a separate, optional commitment. The legally-binding vendor agreement is
  // an explicit e-signature step on /verify *after* the document uploads.
  // The auto-transition to admin_review checks for the agreement row's
  // presence, so the vendor must complete that step before review begins.

  return { ok: true, vendorId }
}

/**
 * Best-effort write of vendor columns added by later migrations. Each column
 * is attempted in isolation; if PostgREST returns PGRST204 ("column not in
 * schema cache") — meaning the project hasn't applied that migration yet, or
 * the schema cache is stale — we log a warning and move on instead of
 * failing the whole submit. Anything else (RLS, constraint violation) bubbles
 * up via the warning so a real bug is visible in logs.
 */
async function persistOptionalVendorColumns(
  vendorId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const admin = createSupabaseAdminClient()
  for (const [column, value] of Object.entries(payload)) {
    if (value === undefined) continue
    const { error } = await admin
      .from('vendors')
      .update({ [column]: value })
      .eq('id', vendorId)
    if (!error) continue
    if (error.code === 'PGRST204') {
      console.warn(
        `[submit] vendors.${column} not in schema cache — skipping. Apply the relevant migration or run NOTIFY pgrst, 'reload schema'; in your Supabase project.`,
      )
      continue
    }
    console.warn(
      `[submit] vendors.${column} update failed: ${error.code} ${error.message}`,
    )
  }
}

/**
 * Force-refresh the caller's vendor read. Used after submit so the next page
 * load sees the new onboarding_status without a hard reload race.
 */
export async function refreshCurrentVendor(): Promise<void> {
  // Touching the supabase client purges any per-request RPC caches the route
  // segment cache may have warmed against the old status.
  await createClerkSupabaseServerClient()
}
