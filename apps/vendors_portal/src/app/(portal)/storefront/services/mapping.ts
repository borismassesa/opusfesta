import { getServicesForCategory } from '@/lib/onboarding/services'

export type DbServiceEntry = { title: string; description?: string | null }

export type UiServicesState = {
  specialServices: string[]
  customServices: string[]
}

/**
 * Map DB services_offered (Array<{title, description}>) to the editor's UI
 * shape (preset IDs + free-text custom labels).
 *
 * Resolution: a DB entry whose `title` case-insensitively matches a preset
 * label for the vendor's category becomes a preset selection (uses the preset
 * id). Anything else becomes a custom label.
 *
 * Unknown preset categories return only the COMMON presets (`getServicesForCategory`
 * fallback), so a vendor whose category was changed to something without
 * specific presets will see their old service titles flow through as custom.
 */
export function dbServicesToUi(
  dbServices: DbServiceEntry[] | null | undefined,
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
    if (!entry || typeof entry.title !== 'string') {
      dropped += 1
      continue
    }
    const title = entry.title.trim()
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
