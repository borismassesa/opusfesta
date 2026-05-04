'use server'

import { revalidatePath } from 'next/cache'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import { getServicesForCategory } from '@/lib/onboarding/services'
import type { DbServiceEntry } from './mapping'

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
 * Persist the vendor's services to vendors.services_offered (JSONB array of
 * `{title, description}` per migration 025). RLS via migration 056 limits
 * write access to owner/manager — staff role calls will be rejected by Postgres
 * with code 42501 and surfaced as a friendly error.
 *
 * Description preservation: the editor doesn't expose descriptions yet, so
 * the action reads the current row first and merges descriptions in by
 * case-insensitive title before writing. This protects descriptions that may
 * have been set via admin tooling or future write paths.
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

  const presetEntries = presetIds
    .filter((id) => presetById.has(id))
    .map((id) => ({ title: presetById.get(id)!, description: '' }))

  // De-dupe custom against preset labels (case-insensitive) to keep the public
  // services list tidy after a vendor adds a custom that shadows a preset.
  const presetLabelsLower = new Set(
    presetEntries.map((e) => e.title.toLowerCase()),
  )
  const seenCustom = new Set<string>()
  const customEntries: Array<{ title: string; description: string }> = []
  for (const label of customLabels) {
    const lower = label.toLowerCase()
    if (presetLabelsLower.has(lower) || seenCustom.has(lower)) continue
    seenCustom.add(lower)
    customEntries.push({ title: label, description: '' })
  }

  const services_offered = [...presetEntries, ...customEntries]

  if (services_offered.length > MAX_TOTAL_SERVICES) {
    return {
      ok: false,
      error: `Too many services (${services_offered.length}/${MAX_TOTAL_SERVICES}). Remove some entries.`,
    }
  }

  // Merge descriptions from the current row by lowercase title so we don't
  // wipe descriptions set elsewhere (admin tooling, future writes).
  const supabase = await createClerkSupabaseServerClient()
  const current = await supabase
    .from('vendors')
    .select('services_offered')
    .eq('id', state.vendor.id)
    .single<{ services_offered: DbServiceEntry[] | null }>()

  if (current.error) {
    console.error('[storefront/services] read-before-write failed:', current.error)
    return { ok: false, error: 'Could not load current services. Try again.' }
  }

  const descByLower = new Map<string, string>()
  for (const entry of current.data?.services_offered ?? []) {
    if (
      entry &&
      typeof entry.title === 'string' &&
      typeof entry.description === 'string' &&
      entry.description.length > 0
    ) {
      descByLower.set(entry.title.toLowerCase(), entry.description)
    }
  }
  for (const entry of services_offered) {
    const desc = descByLower.get(entry.title.toLowerCase())
    if (desc) entry.description = desc
  }

  const { error } = await supabase
    .from('vendors')
    .update({ services_offered })
    .eq('id', state.vendor.id)

  if (error) {
    console.error('[storefront/services] save failed:', error)
    if (error.code === '42501' || /permission denied/i.test(error.message)) {
      return {
        ok: false,
        error: 'You need owner or manager role to edit services.',
      }
    }
    if (error.code === '23514') {
      return {
        ok: false,
        error: 'Service entries failed validation. Please check titles are non-empty.',
      }
    }
    return {
      ok: false,
      error: 'Could not save services. Please try again.',
    }
  }

  revalidatePath('/storefront/services')
  return { ok: true }
}
