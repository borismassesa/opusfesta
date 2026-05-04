'use server'

import { revalidatePath } from 'next/cache'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import type {
  PackageBadge,
  PackageBadgeIcon,
  PackageBadgeTone,
} from '@/lib/onboarding/packages'

const VALID_ICONS = new Set<PackageBadgeIcon>([
  'star',
  'crown',
  'gem',
  'sparkles',
  'award',
  'trophy',
  'flame',
  'heart',
  'badge-check',
  'zap',
])
const VALID_TONES = new Set<PackageBadgeTone>([
  'lavender',
  'gold',
  'emerald',
  'rose',
  'dark',
])
const MAX_BADGE_LABEL = 24

export type SaveBadgeInput = {
  packageId: string
  // null clears the badge.
  badge: PackageBadge | null
}

export type SaveBadgeResult =
  | { ok: true }
  | { ok: false; error: string; reason?: 'stale' | 'permission' | 'unknown' }

function validateBadge(badge: PackageBadge): string | null {
  const label = badge.label.trim()
  if (!label) return 'Badge label is required.'
  if (label.length > MAX_BADGE_LABEL) {
    return `Badge label must be ${MAX_BADGE_LABEL} characters or fewer.`
  }
  if (!VALID_ICONS.has(badge.icon)) return 'Unsupported badge icon.'
  if (!VALID_TONES.has(badge.tone)) return 'Unsupported badge tone.'
  return null
}

/**
 * Save (or clear) the badge on a single package within vendors.packages.
 *
 * SURGICAL UPDATE — operates on the raw JSONB array, mutating only the
 * targeted entry's `badge` field. Other fields (name, price, description,
 * includes, future schema additions) and other packages pass through
 * untouched. Importantly: malformed entries that the UI mapper would drop
 * are preserved exactly as they exist in the DB. This avoids the silent
 * data-loss case where a "save" rewrites the entire array minus anything
 * the mapper didn't recognize.
 *
 * RLS via migration 056 limits write access on vendors to owner/manager —
 * staff role calls return code 42501 from Postgres and surface as a
 * friendly permission error.
 */
export async function saveBadge(input: SaveBadgeInput): Promise<SaveBadgeResult> {
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

  if (typeof input.packageId !== 'string' || !input.packageId) {
    return { ok: false, reason: 'unknown', error: 'Missing package id.' }
  }
  if (input.badge !== null && typeof input.badge !== 'object') {
    return { ok: false, reason: 'unknown', error: 'Invalid badge payload.' }
  }
  if (input.badge) {
    const err = validateBadge(input.badge)
    if (err) return { ok: false, reason: 'unknown', error: err }
  }

  const supabase = await createClerkSupabaseServerClient()
  const current = await supabase
    .from('vendors')
    .select('packages')
    .eq('id', state.vendor.id)
    .single<{ packages: unknown }>()

  if (current.error) {
    console.error('[storefront/packages] read-before-write failed:', current.error)
    if (
      current.error.code === '42501' ||
      /permission denied/i.test(current.error.message)
    ) {
      return {
        ok: false,
        reason: 'permission',
        error: 'You need owner or manager role to view packages.',
      }
    }
    return {
      ok: false,
      reason: 'unknown',
      error: 'Could not load current packages. Try again.',
    }
  }
  if (!current.data) {
    return {
      ok: false,
      reason: 'stale',
      error: 'Vendor row not found. Refreshing…',
    }
  }

  const raw = Array.isArray(current.data.packages)
    ? (current.data.packages as Array<Record<string, unknown>>).slice()
    : []
  const idx = raw.findIndex(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      typeof entry.id === 'string' &&
      entry.id === input.packageId,
  )
  if (idx < 0) {
    return {
      ok: false,
      reason: 'stale',
      error: 'Package not found. Refreshing…',
    }
  }

  // Surgical: keep the entry's existing keys (description, includes, etc.)
  // and only swap the badge. Clearing means deleting the badge key entirely
  // so we don't write `badge: undefined` which JSONB would coerce to null.
  const target = { ...raw[idx] }
  if (input.badge === null) {
    delete target.badge
  } else {
    target.badge = input.badge as unknown as Record<string, unknown>
  }
  raw[idx] = target

  const { error } = await supabase
    .from('vendors')
    .update({ packages: raw })
    .eq('id', state.vendor.id)

  if (error) {
    console.error('[storefront/packages] save failed:', error)
    if (error.code === '42501' || /permission denied/i.test(error.message)) {
      return {
        ok: false,
        reason: 'permission',
        error: 'You need owner or manager role to edit packages.',
      }
    }
    return {
      ok: false,
      reason: 'unknown',
      error: 'Could not save badge. Please try again.',
    }
  }

  revalidatePath('/storefront/packages')
  return { ok: true }
}

/**
 * One-shot lazy migration: assigns stable IDs to any vendors.packages entry
 * that lacks one, preserving every other field exactly. Called by the page
 * loader on first view when missing IDs are detected — without this, the
 * surgical saveBadge action would never match (the client's display ID
 * would be a fresh UUID generated each render, not present in the DB).
 *
 * Returns { healed: n } indicating how many IDs were assigned, so the
 * caller can decide whether to re-fetch with the new IDs.
 */
export async function ensurePackageIds(): Promise<
  { ok: true; healed: number } | { ok: false; error: string }
> {
  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return { ok: false, error: 'Not in live mode.' }
  }

  const supabase = await createClerkSupabaseServerClient()
  const current = await supabase
    .from('vendors')
    .select('packages')
    .eq('id', state.vendor.id)
    .single<{ packages: unknown }>()

  if (current.error || !current.data) {
    return { ok: false, error: 'Could not read packages for self-heal.' }
  }

  const raw = Array.isArray(current.data.packages)
    ? (current.data.packages as Array<Record<string, unknown>>).slice()
    : []

  let healed = 0
  for (let i = 0; i < raw.length; i++) {
    const entry = raw[i]
    if (entry && typeof entry === 'object' && typeof entry.id !== 'string') {
      raw[i] = {
        ...entry,
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `pkg-${Date.now()}-${i}`,
      }
      healed += 1
    }
  }

  if (healed === 0) return { ok: true, healed: 0 }

  const { error } = await supabase
    .from('vendors')
    .update({ packages: raw })
    .eq('id', state.vendor.id)

  if (error) {
    console.error('[storefront/packages] id self-heal failed:', error)
    if (error.code === '42501' || /permission denied/i.test(error.message)) {
      // Staff role lands here — fine to skip self-heal silently; saveBadge
      // is also disabled for staff so the missing IDs won't bite.
      return { ok: true, healed: 0 }
    }
    return { ok: false, error: error.message }
  }

  return { ok: true, healed }
}
