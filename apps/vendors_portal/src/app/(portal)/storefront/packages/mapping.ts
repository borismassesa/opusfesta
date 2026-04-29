import type {
  PackageBadge,
  PackageBadgeIcon,
  PackageBadgeTone,
  PackageDraft,
} from '@/lib/onboarding/packages'

const VALID_ICONS: PackageBadgeIcon[] = [
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
]

const VALID_TONES: PackageBadgeTone[] = [
  'lavender',
  'gold',
  'emerald',
  'rose',
  'dark',
]

function freshId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `pkg-${Math.random().toString(36).slice(2, 10)}`
}

function parseBadge(raw: unknown): PackageBadge | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const r = raw as Record<string, unknown>
  const label = typeof r.label === 'string' ? r.label.trim() : ''
  const icon = typeof r.icon === 'string' ? r.icon : ''
  const tone = typeof r.tone === 'string' ? r.tone : ''
  if (!label) return undefined
  if (!VALID_ICONS.includes(icon as PackageBadgeIcon)) return undefined
  if (!VALID_TONES.includes(tone as PackageBadgeTone)) return undefined
  return {
    label,
    icon: icon as PackageBadgeIcon,
    tone: tone as PackageBadgeTone,
  }
}

/**
 * Hydrate a vendors.packages JSONB row into PackageDraft[]. Missing or
 * malformed entries are dropped (with a console.warn). IDs are stable when
 * present; freshly assigned (and persisted on next save) when not.
 */
export function dbPackagesToUi(raw: unknown): PackageDraft[] {
  if (!Array.isArray(raw)) {
    if (raw != null) {
      console.warn('[storefront/packages] vendors.packages is not an array — coercing to empty')
    }
    return []
  }

  const out: PackageDraft[] = []
  let dropped = 0
  const seenIds = new Set<string>()

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') {
      dropped += 1
      continue
    }
    const e = entry as Record<string, unknown>

    const name = typeof e.name === 'string' ? e.name : ''
    const price = typeof e.price === 'string' ? e.price : ''
    const description = typeof e.description === 'string' ? e.description : ''
    const includes = Array.isArray(e.includes)
      ? e.includes.filter((x): x is string => typeof x === 'string')
      : []

    let id = typeof e.id === 'string' && e.id.length > 0 ? e.id : freshId()
    // De-collide id if a duplicate sneaks in.
    while (seenIds.has(id)) id = freshId()
    seenIds.add(id)

    out.push({
      id,
      name,
      price,
      description,
      includes,
      badge: parseBadge(e.badge),
    })
  }

  if (dropped > 0) {
    console.warn(
      `[storefront/packages] mapper dropped ${dropped} malformed package entries`,
    )
  }

  return out
}

/**
 * Strip empty `includes` lines and unsupported badge fields before persisting.
 * Validation of caps / total count happens in the server action.
 */
export function uiPackagesToDb(packages: PackageDraft[]): PackageDraft[] {
  return packages.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description,
    includes: p.includes.filter((line) => line.trim().length > 0),
    ...(p.badge ? { badge: p.badge } : {}),
  }))
}
