'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import { getServicesForCategory } from '@/lib/onboarding/services'

export type SaveServicesInput = {
  specialServices: string[]
  customServices: string[]
}

export type SaveServicesResult =
  | { ok: true }
  | { ok: false; error: string }

const MAX_CUSTOM_LABEL = 60
const MAX_TOTAL_SERVICES = 100

/**
 * Persist the vendor's services to vendors.services_offered — a Postgres
 * text[] of plain title strings. This is the shape the live DB column and the
 * public marketplace (opus_website) both use. (Migration 025 meant to convert
 * the column to a jsonb array of {title, description} objects, but that DDL
 * never took effect on the live database; writing objects therefore made
 * PostgREST stringify each one into a text cell, so saved services read back
 * malformed and disappeared from the editor.)
 */
export async function saveServices(
  input: SaveServicesInput,
): Promise<SaveServicesResult> {
  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return {
      ok: false,
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

  const presetIds = Array.isArray(input.specialServices)
    ? input.specialServices.filter((id): id is string => typeof id === 'string')
    : []
  const customLabelsRaw = Array.isArray(input.customServices)
    ? input.customServices.filter((s): s is string => typeof s === 'string')
    : []

  for (const label of customLabelsRaw) {
    if (label.trim().length > MAX_CUSTOM_LABEL) {
      return {
        ok: false,
        error: `Custom service labels must be 60 characters or fewer.`,
      }
    }
  }

  const customLabels = customLabelsRaw
    .map((s) => s.trim())
    .filter(Boolean)

  const presets = getServicesForCategory(state.vendor.category)
  const presetById = new Map(presets.map((p) => [p.id, p.label]))

  const presetTitles = presetIds
    .filter((id) => presetById.has(id))
    .map((id) => presetById.get(id)!)

  // De-dupe custom against preset labels (case-insensitive) to keep the public
  // services list tidy after a vendor adds a custom that shadows a preset.
  const presetLabelsLower = new Set(presetTitles.map((t) => t.toLowerCase()))
  const seenCustom = new Set<string>()
  const customTitles: string[] = []
  for (const label of customLabels) {
    const lower = label.toLowerCase()
    if (presetLabelsLower.has(lower) || seenCustom.has(lower)) continue
    seenCustom.add(lower)
    customTitles.push(label)
  }

  // text[] of plain title strings (see jsdoc) — never an array of objects.
  const services_offered = [...presetTitles, ...customTitles]

  if (services_offered.length > MAX_TOTAL_SERVICES) {
    return {
      ok: false,
      error: `Too many services (${services_offered.length}/${MAX_TOTAL_SERVICES}). Remove some entries.`,
    }
  }

  // Use the service-role admin client, scoped to the vendor id getCurrentVendor
  // already resolved for this authenticated owner. The Clerk-authed client
  // silently no-ops the UPDATE (RLS matches 0 rows, error: null) when the
  // 'supabase' JWT template isn't configured — the same failure mode savePhotos
  // guards against. `.select('id')` lets us detect a 0-row update.
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('vendors')
    .update({ services_offered })
    .eq('id', state.vendor.id)
    .select('id')

  if (error) {
    console.error('[storefront/services] save failed:', error)
    if (error.code === '42501' || /permission denied/i.test(error.message)) {
      return {
        ok: false,
        error: 'You need owner or manager role to edit services.',
      }
    }
    return {
      ok: false,
      error: 'Could not save services. Please try again.',
    }
  }
  if (!data || data.length === 0) {
    return {
      ok: false,
      error:
        '[storefront/services] save matched no rows — vendor record may have been deleted.',
    }
  }

  revalidatePath('/storefront/services')
  return { ok: true }
}
