'use server'

import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { auth, currentUser } from '@clerk/nextjs/server'
import {
  createSupabaseAdminClient,
  createClerkSupabaseServerClient,
} from '@/lib/supabase'
import { notifyOnVendorSubmit } from '@/lib/email/notify-on-submit'
import { ACTIVE_VENDOR_COOKIE } from '@/lib/vendor-cookie'
import { findCategory } from './categories'
import { LANGUAGES } from './languages'
import { PERSONALITY_OPTIONS } from './personality'
import { CANCELLATION_OPTIONS, RESCHEDULE_OPTIONS } from './policies'
import { LIPA_NAMBA_NETWORKS, PAYOUT_OPTIONS } from './payouts'
import { SERVICE_MARKETS, TZ_REGIONS } from './regions'
import { getServicesForCategory } from './services'
import { getStylesForCategory } from './styles'
import { type OnboardingDraft } from './draft'
import {
  hasCompletePayout,
  isPayoutEntryComplete,
  type PayoutMethod,
} from './payout'

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
  transport: 'Transportation',
  'bridal-salon': 'Bridal Salons',
  rentals: 'Rentals',
  // "Others" — the vendor typed their real category into customCategory;
  // admin recategorizes during review if a better enum value fits.
  other: 'Other',
  // Legacy drafts saved before "Event extras" was replaced by "Others".
  extras: 'Decorators',
}

// Maps the onboarding payout-method tag to the v_b-lite enum.
const PAYOUT_METHOD_TO_DB: Record<
  NonNullable<PayoutMethod>,
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
    // Prefer the vendor's own words ("Others" card) over the generic label so
    // admin review sees exactly what they do.
    category:
      draft.customCategory?.trim() ||
      (draft.categoryId ? findCategory(draft.categoryId)?.profileLabel ?? null : null),
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
    // Resolved, human-friendly view of every payout method for admin review.
    payoutMethods: draft.payoutMethods.map((p) => ({
      method: PAYOUT_OPTIONS.find((o) => o.id === p.method)?.label ?? p.method,
      network: p.network
        ? LIPA_NAMBA_NETWORKS.find((n) => n.id === p.network)?.label ?? p.network
        : null,
      bankName: p.bankName || null,
      number: p.number,
      accountName: p.accountName,
      primary: p.primary,
    })),
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
  if (
    findCategory(draft.categoryId)?.requiresDetail &&
    !draft.customCategory?.trim()
  ) {
    return 'Tell us what your business does — go back to the category step.'
  }
  if (!draft.vowsAccepted) return 'Vendor Vows must be accepted before submitting.'
  if (!draft.businessName.trim()) return 'Add a business name before submitting.'
  if (!draft.region) return 'Add a region before submitting.'
  if (!draft.city.trim()) return 'Add a city before submitting.'
  if (!draft.phone.trim() && !draft.email.trim()) {
    return 'Add at least one contact method (phone or email).'
  }
  if (draft.packages.length === 0) return 'Add at least one package.'
  if (!draft.cancellationLevel) return 'Pick a cancellation policy.'
  if (!hasCompletePayout(draft)) {
    return 'Add at least one complete payout method.'
  }
  if (draft.payoutMethods.some((p) => p.method && !isPayoutEntryComplete(p))) {
    return 'Finish or remove the incomplete payout method.'
  }
  if (!draft.payoutMethods.some((p) => p.primary)) {
    return 'Mark one payout method as primary.'
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
  // Clerk's auth()/currentUser() and the Supabase admin client can THROW
  // (env misconfig, Clerk outage, Server Action origin rejection). Catch them
  // so this action always RESOLVES with a result object — a rejected promise
  // would otherwise hang the client's "Submitting…" button.
  let userId: string | null
  try {
    ;({ userId } = await auth())
  } catch (err) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[submit] auth check failed: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
  if (!userId) {
    return { ok: false, reason: 'unauth', error: 'Sign in before submitting.' }
  }

  const validation = validateDraft(draft)
  if (validation) {
    return { ok: false, reason: 'incomplete', error: validation }
  }

  let clerkUser
  try {
    clerkUser = await currentUser()
  } catch (err) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[submit] account lookup failed: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
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

  let admin
  try {
    admin = createSupabaseAdminClient()
  } catch (err) {
    // Thrown synchronously when NEXT_PUBLIC_SUPABASE_URL or
    // SUPABASE_SERVICE_ROLE_KEY is missing in the deployment env.
    return {
      ok: false,
      reason: 'unknown',
      error: `[submit] database unavailable — check Supabase env config: ${err instanceof Error ? err.message : String(err)}`,
    }
  }

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

  // Re-use an existing vendor row for THIS category if the user already has
  // one; otherwise create a fresh row. A user may legitimately run several
  // vendor profiles — one per category (e.g. Transportation + Bridal Salons)
  // — so the lookup is scoped to (user_id, category), matching the
  // unique_vendor_per_user_category constraint.
  type ExistingVendorRow = {
    id: string
    slug: string
    onboarding_status: string | null
  }
  const existing = await admin
    .from('vendors')
    .select('id, slug, onboarding_status')
    .eq('user_id', supabaseUserId)
    .eq('category', dbCategory)
    .limit(1)
    .maybeSingle<ExistingVendorRow>()

  if (existing.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[submit] vendors lookup failed: ${existing.error.code} ${existing.error.message}`,
    }
  }

  let existingRow: ExistingVendorRow | null = existing.data
  if (!existingRow) {
    // No row for this category — but if the user has a pre-submit draft row
    // (started onboarding, switched category, never submitted), reuse it
    // instead of leaving an orphaned half-application behind.
    const draftRow = await admin
      .from('vendors')
      .select('id, slug, onboarding_status')
      .eq('user_id', supabaseUserId)
      .eq('onboarding_status', 'application_in_progress')
      .limit(1)
      .maybeSingle<ExistingVendorRow>()
    if (draftRow.error) {
      return {
        ok: false,
        reason: 'unknown',
        error: `[submit] draft vendor lookup failed: ${draftRow.error.code} ${draftRow.error.message}`,
      }
    }
    existingRow = draftRow.data
  }

  let slug = existingRow?.slug ?? baseSlug
  if (!existingRow) {
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

  // First submission = no vendor row yet, or one that's still a pre-submit
  // draft. Only then do we advance the lifecycle to `verification_pending` and
  // stamp `onboarding_started_at`. On a later EDIT (vendor is already
  // verification_pending / admin_review / needs_corrections / active /
  // suspended) we must NOT touch the status or the started-at clock — otherwise
  // editing a detail silently knocks an advanced vendor back to
  // verification_pending and resets their review SLA.
  const currentStatus =
    existingRow?.onboarding_status ?? 'application_in_progress'
  const isFirstSubmission = !existingRow || currentStatus === 'application_in_progress'

  // Decide what (if anything) this submit does to the lifecycle:
  //  • First submission → advance to `verification_pending` + stamp the clock.
  //  • Re-submit after `needs_corrections` → push back into `admin_review` so
  //    the admin re-checks the fixes (the vendor has "answered" the request).
  //  • Any other edit (verification_pending / admin_review / active / …) →
  //    leave the status and SLA clock untouched.
  const lifecycleFields: Record<string, unknown> = isFirstSubmission
    ? {
        onboarding_status: 'verification_pending',
        onboarding_started_at: new Date().toISOString(),
      }
    : currentStatus === 'needs_corrections'
      ? { onboarding_status: 'admin_review' }
      : {}

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
    ...lifecycleFields,
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
    // Dedicated columns the admin storefront editors and public storefront
    // read directly. Without these the admin UI shows blank for fields the
    // vendor actually answered during onboarding.
    style: draft.style,
    personality: draft.personality,
    languages: draft.languages,
    cancellation_level: draft.cancellationLevel,
    reschedule_policy: draft.reschedulePolicy,
    deposit_percent: draft.depositPercent
      ? Number.parseInt(draft.depositPercent, 10) || null
      : null,
    // Full draft kept as a JSONB blob so admin review can audit every answered
    // field (resolved labels included), even ones we haven't broken out into
    // columns yet (FAQs, team avatars, etc.).
    application_snapshot: buildApplicationSnapshot(draft),
  }

  let vendorId: string
  if (existingRow) {
    const update = await admin
      .from('vendors')
      .update(corePayload)
      .eq('id', existingRow.id)
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
      // 23505 on the legacy one-vendor-per-user constraint means migration
      // 20260610... (multi-category vendors) hasn't been applied yet.
      if (
        insert.error.code === '23505' &&
        insert.error.message.includes('unique_vendor_per_user') &&
        !insert.error.message.includes('per_user_category')
      ) {
        return {
          ok: false,
          reason: 'unknown',
          error:
            '[submit] this account already has a vendor profile and the database still enforces one profile per account — apply the multi-category vendors migration.',
        }
      }
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

  // 3) Persist payout methods. A vendor can register several; exactly one is
  //    marked primary (is_default). We only (re)write them while the vendor is
  //    still pre-review — once admin has started verifying (admin_review and
  //    beyond), the admin owns these rows (verify / mark-failed / edit), so a
  //    vendor edit must NOT wipe that work. In the pre-review states we replace
  //    the whole set, which is safe because nothing's been verified yet.
  const payoutEditable =
    isFirstSubmission ||
    currentStatus === 'verification_pending' ||
    currentStatus === 'needs_corrections'

  if (payoutEditable) {
    const payoutRows = draft.payoutMethods
      .filter(isPayoutEntryComplete)
      .map((entry) => {
        // Fallback: halopesa lands in the lipa_namba bucket since there's no
        // dedicated enum value yet; admin can correct during review.
        const methodDb =
          (entry.method && PAYOUT_METHOD_TO_DB[entry.method]) || 'lipa_namba'
        return {
          vendor_id: vendorId,
          method_type: methodDb,
          provider:
            entry.method === 'bank'
              ? entry.bankName || null
              : entry.method === 'lipa-namba'
                ? entry.network || null
                : null,
          account_number: entry.number.trim(),
          account_holder_name: entry.accountName.trim(),
          status: 'pending' as const,
          is_default: entry.primary,
        }
      })

    // Guarantee exactly one default to satisfy the partial unique index
    // (`WHERE is_default`) and so payouts have a clear destination.
    if (payoutRows.length > 0 && !payoutRows.some((r) => r.is_default)) {
      payoutRows[0].is_default = true
    }

    // Replace the whole set: delete the existing pre-review rows, then insert
    // the current draft's methods. Cleaner than per-row reconciliation and
    // safe before any admin verification exists.
    const del = await admin
      .from('vendor_payout_methods')
      .delete()
      .eq('vendor_id', vendorId)
    if (del.error) {
      return {
        ok: false,
        reason: 'unknown',
        error: `[submit] payout clear failed: ${del.error.code} ${del.error.message}`,
      }
    }
    if (payoutRows.length > 0) {
      const ins = await admin.from('vendor_payout_methods').insert(payoutRows)
      if (ins.error) {
        return {
          ok: false,
          reason: 'unknown',
          error: `[submit] payout write failed: ${ins.error.code} ${ins.error.message}`,
        }
      }
    }
  }

  // 4) Vendor agreement: NOT recorded here. Vendor Vows is a values pledge —
  // a separate, optional commitment. The legally-binding vendor agreement is
  // an explicit e-signature step on /verify *after* the document uploads.
  // The auto-transition to admin_review checks for the agreement row's
  // presence, so the vendor must complete that step before review begins.

  // 5) Best-effort transactional emails: ping admins about the new
  //    application and receipt the vendor. Email failures are logged but
  //    never block the submit — the persisted vendor row + payout method
  //    above are the source of truth.
  //
  //    ONLY fire on events that actually need review: a first submission, or a
  //    re-submit after `needs_corrections` (the vendor answered the review
  //    request). A plain edit of an already-submitted vendor
  //    (verification_pending / admin_review / active / suspended) must NOT
  //    re-notify — otherwise every "Save changes" spams admins with a
  //    duplicate "new application" email and re-receipts the vendor.
  const shouldNotifySubmission =
    isFirstSubmission || currentStatus === 'needs_corrections'
  if (shouldNotifySubmission) {
    try {
      const region =
        TZ_REGIONS.find((r) => r.code === draft.region)?.name ?? draft.region ?? null
      // The set_vendor_code_trigger populated vendor_code on insert; on
      // re-submit it's already there. Read it back so the receipt + admin
      // notification can quote the human-readable application reference.
      const codeRow = await admin
        .from('vendors')
        .select('vendor_code')
        .eq('id', vendorId)
        .maybeSingle<{ vendor_code: string | null }>()
      await notifyOnVendorSubmit({
        vendorId,
        vendorCode: codeRow.data?.vendor_code ?? null,
        businessName: draft.businessName.trim(),
        category: findCategory(draft.categoryId!)?.profileLabel ?? dbCategory,
        region,
        city: draft.city.trim() || null,
        vendorContactEmail: draft.email?.trim() || email,
        vendorContactPhone: draft.phone?.trim() || null,
        submittedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.warn(
        `[submit] notifyOnVendorSubmit threw for vendor=${vendorId}:`,
        err instanceof Error ? err.message : err,
      )
    }
  } else {
    console.log(
      `[submit] vendor=${vendorId} edit (status=${currentStatus}) — skipping submit notifications`,
    )
  }

  // Point the portal at the business that was just submitted, so a user with
  // several profiles lands on THIS application's pending/verify flow instead
  // of whichever business happened to be selected before.
  try {
    const cookieStore = await cookies()
    cookieStore.set(ACTIVE_VENDOR_COOKIE, vendorId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
  } catch (err) {
    console.warn(
      `[submit] could not set active-vendor cookie for vendor=${vendorId}:`,
      err instanceof Error ? err.message : err,
    )
  }

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
