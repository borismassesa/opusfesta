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
 * Persist the About section directly into the vendor's live columns
 * (business_name, bio, years_in_business, location, contact_info,
 * social_links). Every other storefront editor (photos, packages, team,
 * faq, recognition, services) already writes straight to live, so keeping
 * About in a draft-then-publish dance was inconsistent and confused
 * vendors — they hit Save, saw nothing change on the public profile, and
 * thought saving was broken.
 *
 * Read-before-write preserves any sibling keys inside the JSONB columns
 * (location/contact_info/social_links) that this editor doesn't own —
 * admin-only or future-schema fields aren't silently wiped.
 *
 * Trust boundary: getCurrentVendor validates the Clerk session and
 * resolves the vendor row via the admin client; the write is scoped to
 * that vendor id. RLS is defense-in-depth.
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
    .select('business_name, years_in_business, bio, location, contact_info, social_links')
    .eq('id', state.vendor.id)
    .single<VendorRowFromDb>()

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

  const livePatch = profileToUpdatePatch(input, current.data)
  const { data, error } = await supabase
    .from('vendors')
    .update(livePatch)
    .eq('id', state.vendor.id)
    .select('id')

  if (error) {
    console.error('[storefront/about] save failed:', error)
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
        error: 'Profile failed validation. Check field shapes.',
      }
    }
    return {
      ok: false,
      reason: 'unknown',
      error: 'Could not save profile. Please try again.',
    }
  }
  // Defensive: matching 0 rows means the vendor record vanished between
  // the existence check and this update — surface it instead of pretending
  // the save worked. (Same guard as savePhotos.)
  if (!data || data.length === 0) {
    return {
      ok: false,
      reason: 'stale',
      error: 'Vendor record not found — try refreshing the page.',
    }
  }

  revalidatePath('/storefront/about')
  return { ok: true }
}
