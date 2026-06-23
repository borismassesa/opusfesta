import { getServicesForCategory } from '@/lib/onboarding/services'

export type UiServicesState = {
  specialServices: string[]
  customServices: string[]
}

/**
 * Extract a service title from one stored `services_offered` element.
 *
 * Across the data's history an element can be:
 *  - a plain title string — the live text[] shape + what opus_website reads
 *  - an object `{ title, description }` — migration 025's intended jsonb shape
 *  - a string holding the JSON of that object, because earlier code wrote
 *    objects into the text[] column and PostgREST stringified each one
 *    ("double-encoding"). We parse those back so legacy rows still resolve
 *    instead of silently vanishing from the editor.
 */
export function serviceTitle(entry: unknown): string | null {
  if (typeof entry === 'string') {
    const s = entry.trim()
    if (!s) return null
    if (s.startsWith('{') && s.includes('"title"')) {
      try {
        const parsed = JSON.parse(s) as { title?: unknown }
        if (typeof parsed?.title === 'string') return parsed.title.trim() || null
      } catch {
        // Not valid JSON after all — fall through and treat as a plain title.
      }
    }
    return s
  }
  if (entry && typeof entry === 'object' && 'title' in entry) {
    const t = (entry as { title?: unknown }).title
    return typeof t === 'string' ? t.trim() || null : null
  }
  return null
}

/**
 * Map DB `services_offered` to the editor's UI shape (preset IDs + free-text
 * custom labels).
 *
 * Resolution: an entry whose title case-insensitively matches a preset label
 * for the vendor's category becomes a preset selection (uses the preset id).
 * Anything else becomes a custom label.
 *
 * Unknown preset categories return only the COMMON presets
 * (`getServicesForCategory` fallback), so a vendor whose category was changed
 * to something without specific presets will see their old service titles flow
 * through as custom.
 */
export function dbServicesToUi(
  dbServices: ReadonlyArray<unknown> | null | undefined,
  category: string | null | undefined,
): UiServicesState {
  const presets = getServicesForCategory(category)
  const presetByLabel = new Map(
    presets.map((p) => [p.label.toLowerCase(), p.id]),
  )

  const specialServices: string[] = []
  const customServices: string[] = []
  const seenPresetIds = new Set<string>()
  const seenCustomLower = new Set<string>()

  let dropped = 0
  for (const entry of dbServices ?? []) {
    const title = serviceTitle(entry)
    if (!title) {
      dropped += 1
      continue
    }

    const presetId = presetByLabel.get(title.toLowerCase())
    if (presetId) {
      if (!seenPresetIds.has(presetId)) {
        seenPresetIds.add(presetId)
        specialServices.push(presetId)
      }
    } else {
      const lower = title.toLowerCase()
      if (!seenCustomLower.has(lower)) {
        seenCustomLower.add(lower)
        customServices.push(title)
      }
    }
  }

  if (dropped > 0) {
    console.warn(
      `[storefront/services] mapper dropped ${dropped} malformed services_offered entries — saving will overwrite them.`,
    )
  }

  // Category-drift signal: if there were entries but ALL of them landed in
  // customServices, the vendor's category was likely changed and prior preset
  // selections no longer resolve. Saving will rewrite them as plain custom
  // entries. Visible breadcrumb for support.
  const totalInput = (dbServices ?? []).length
  if (totalInput > 0 && specialServices.length === 0 && customServices.length > 0) {
    console.warn(
      `[storefront/services] all ${customServices.length} services mapped to "custom" — possible category change drift (current category=${category ?? '<none>'}).`,
    )
  }

  return { specialServices, customServices }
}
