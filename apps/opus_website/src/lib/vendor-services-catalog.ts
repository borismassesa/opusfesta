// Mirror of the onboarding service catalogue
// (`apps/vendors_portal/src/lib/onboarding/services.ts`). Kept in sync by
// hand because copying TypeScript imports between Next apps adds a build
// dependency we don't want yet. If you add or rename a service in the
// onboarding flow, also add it here.
//
// We use this on the public website to turn the raw IDs that vendors_portal
// writes into `vendors.services_offered` (e.g. "full-service") into the
// readable labels couples saw on the onboarding screen ("Full-service
// planning"). When an ID isn't in the map, we fall back to a title-cased
// version of the slug — so a missing entry degrades to "Full Service" rather
// than the literal "full-service".

const SERVICE_LABELS: Record<string, string> = {
  // Common
  travel: 'Travel to other regions',
  weekday: 'Weekday events',
  'extra-hours': 'Extra hours',

  // Videographer
  drone: 'Drone coverage',
  livestream: 'Livestream services',
  'engagement-reel': 'Engagement reel',
  'same-day-edit': 'Same-day editing',
  'next-day-edit': 'Next-day editing',
  film: 'Film / vintage stock',

  // Photographer
  'engagement-shoot': 'Engagement shoot',
  'second-shooter': 'Second shooter',
  'printed-album': 'Printed album',
  'photo-booth': 'Photo booth',
  'next-day-preview': 'Next-day preview gallery',

  // Venue
  'in-house-catering': 'In-house catering',
  lodging: 'On-site lodging',
  parking: 'Guest parking',
  outdoor: 'Outdoor ceremony space',
  'sound-system': 'Sound system included',

  // Caterer
  'bar-service': 'Bar service',
  tasting: 'Tasting session',
  halal: 'Halal options',
  vegetarian: 'Vegetarian / vegan',
  'live-cooking': 'Live cooking station',

  // Cakes (only IDs not already covered above)
  delivery: 'Delivery & setup',
  'custom-design': 'Custom design consult',
  'gluten-free': 'Gluten-free / dairy-free',

  // Florist
  bouquets: 'Bridal bouquets',
  arches: 'Ceremony arches',
  centerpieces: 'Reception centerpieces',
  rentals: 'Vase / structure rentals',

  // Planner
  'full-service': 'Full-service planning',
  'day-of': 'Day-of coordination',
  design: 'Design & styling',
  budget: 'Budget management',

  // Musician
  'live-band': 'Live band',
  mc: 'MC services',
  'sound-rig': 'Sound system rental',
  lighting: 'Lighting package',

  // Officiant
  religious: 'Religious ceremony',
  civil: 'Civil ceremony',
  traditional: 'Traditional ceremony',
  rehearsal: 'Rehearsal session',

  // Extras (collisions with other categories already covered above:
  // 'photo-booth', 'lighting' — same labels, no conflict)
  transport: 'Guest transport',
  security: 'Security',
  tents: 'Tents & marquees',

  // Beauty
  'bridal-trial': 'Bridal trial',
  bridesmaids: 'Bridesmaids package',
  'on-location': 'On-location service',
  'touch-ups': 'All-day touch-ups',
}

function titleCaseSlug(slug: string): string {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase())
}

/**
 * Resolve a service id (slug) or stringified JSON service object into a
 * human-readable label. Returns null when the input is empty or not
 * representable as a label.
 */
export function resolveServiceLabel(raw: unknown): string | null {
  if (raw == null) return null

  // Already a plain object (modern shape, after migration 025).
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>
    const id = typeof obj.id === 'string' ? obj.id.trim() : ''
    const title = typeof obj.title === 'string' ? obj.title.trim() : ''
    // If the storage carries a real label (not just a copy of the id),
    // prefer it — supports vendor_portal's customServices entries that
    // store the full label as `title`.
    if (title && title !== id) return title
    if (id) return SERVICE_LABELS[id] ?? titleCaseSlug(id)
    return null
  }

  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  // Pre-migration-025 shape: `services_offered` is a TEXT[] where each
  // element is a JSON-encoded `{ id, title, description }` object. Try to
  // parse it before falling through to the slug path.
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed)
      return resolveServiceLabel(parsed)
    } catch {
      // fall through to slug treatment
    }
  }

  // Plain slug or already-friendly label.
  return SERVICE_LABELS[trimmed] ?? titleCaseSlug(trimmed)
}
