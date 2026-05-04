'use server'

import { revalidatePath } from 'next/cache'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import {
  profileToUpdatePatch,
  type DbProfile,
  type VendorRowFromDb,
} from './mapping'

export type SaveProfileResult =
  | { ok: true }
  | { ok: false; error: string; reason?: 'stale' | 'permission' | 'unknown' }

const MAX_BIO = 4000
const MAX_FIELD = 255
const MIN_BIO = 80

function validate(profile: DbProfile): string | null {
  if (!profile.businessName.trim()) return 'Business name is required.'
  if (profile.businessName.length > MAX_FIELD) {
    return 'Business name is too long.'
  }
  const bioTrimmed = profile.bio.trim()
  if (bioTrimmed.length > MAX_BIO) {
    return 'Bio is too long.'
  }
  if (bioTrimmed.length > 0 && bioTrimmed.length < MIN_BIO) {
    return `Bio is too short (min ${MIN_BIO} characters).`
  }
  if (profile.yearsInBusiness.trim()) {
    const n = Number.parseInt(profile.yearsInBusiness, 10)
    if (!Number.isFinite(n) || n < 0 || n > 199) {
      return 'Years in business must be 0–199.'
    }
  }
  if (profile.email.trim() && !/^\S+@\S+\.\S+$/.test(profile.email.trim())) {
    return 'Email looks invalid.'
  }
  return null
}

/**
 * Stage the About-section subset of the vendor's storefront into
 * `vendors.draft_content.about`. Live columns are NOT touched until the vendor
 * hits **Publish** (see apps/vendors_portal/src/app/(portal)/storefront/actions.ts).
 *
 * The draft content matches the shape of the live-columns patch so publish can
 * apply it directly. Read-before-write preserves any unknown keys in the
 * existing draft (or live JSONB columns when no draft exists) — so other
 * storefront sections' draft work isn't clobbered, and admin/future-schema
 * fields outside this editor's surface aren't silently wiped.
 *
 * RLS (migration 056) limits write access to owner/manager. Staff role
 * → code 42501 → friendly permission message.
 */
export async function saveProfile(input: DbProfile): Promise<SaveProfileResult> {
  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return {
      ok: false,
      reason: 'unknown',
      error:
        state.kind === 'no-env'
          ? 'Configuration error — please contact support.'
          : state.kind === 'pending-approval'
            ? 'Your vendor application is awaiting OpusFesta verification.'
            : state.kind === 'suspended'
              ? 'Your vendor account is suspended. Contact OpusFesta support.'
              : "You haven't started a vendor application yet.",
    }
  }

  if (!input || typeof input !== 'object') {
    return { ok: false, reason: 'unknown', error: 'Invalid payload.' }
  }

  const validationError = validate(input)
  if (validationError) {
    return { ok: false, reason: 'unknown', error: validationError }
  }

  const supabase = await createClerkSupabaseServerClient()
  const current = await supabase
    .from('vendors')
    .select('business_name, years_in_business, bio, location, contact_info, social_links, draft_content')
    .eq('id', state.vendor.id)
    .single<VendorRowFromDb & { draft_content: Record<string, unknown> | null }>()

  if (current.error) {
    console.error('[storefront/about] read-before-write failed:', current.error)
    if (
      current.error.code === '42501' ||
      /permission denied/i.test(current.error.message)
    ) {
      return {
        ok: false,
        reason: 'permission',
        error: 'You need owner or manager role to view this profile.',
      }
    }
    return {
      ok: false,
      reason: 'unknown',
      error: 'Could not load current profile. Try again.',
    }
  }
  if (!current.data) {
    return {
      ok: false,
      reason: 'stale',
      error: 'Vendor row not found. Refreshing…',
    }
  }

  // Build the same patch shape we'd apply on publish, then stash it under the
  // 'about' key inside draft_content so other sections' drafts (packages,
  // services, team, etc.) survive.
  const aboutPatch = profileToUpdatePatch(input, current.data)
  const existingDraft = current.data.draft_content ?? {}
  const nextDraft = { ...existingDraft, about: aboutPatch }

  const { error } = await supabase
    .from('vendors')
    .update({ draft_content: nextDraft })
    .eq('id', state.vendor.id)

  if (error) {
    console.error('[storefront/about] save draft failed:', error)
    if (error.code === '42501' || /permission denied/i.test(error.message)) {
      return {
        ok: false,
        reason: 'permission',
        error: 'You need owner or manager role to edit your storefront.',
      }
    }
    if (error.code === '23514') {
      return {
        ok: false,
        reason: 'unknown',
        error: 'Draft failed validation. Check field shapes.',
      }
    }
    return {
      ok: false,
      reason: 'unknown',
      error: 'Could not save draft. Please try again.',
    }
  }

  revalidatePath('/storefront/about')
  return { ok: true }
}
