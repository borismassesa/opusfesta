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
 * Persist the wireable subset of the About page (business identity, bio,
 * address, contact, socials) to the vendors row. Other fields on the page
 * (firstName/lastName/languages/style/personality/markets/hours/etc.) are
 * Phase 5 schema work and remain on useOnboardingDraft for now.
 *
 * Read-before-write preserves any unknown keys in the JSONB columns
 * (location, contact_info, social_links) so admin or future-schema fields
 * aren't silently wiped.
 *
 * RLS via migration 056 limits write access to owner/manager. Staff role
 * calls return code 42501 → friendly permission message.
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
          : 'You are not a member of any vendor team.',
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

  const patch = profileToUpdatePatch(input, current.data)

  const { error } = await supabase
    .from('vendors')
    .update(patch)
    .eq('id', state.vendor.id)

  if (error) {
    console.error('[storefront/about] save failed:', error)
    if (error.code === '42501' || /permission denied/i.test(error.message)) {
      return {
        ok: false,
        reason: 'permission',
        error: 'You need owner or manager role to edit your profile.',
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

  revalidatePath('/storefront/about')
  return { ok: true }
}
