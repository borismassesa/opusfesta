import {
  Camera,
  Video,
  Flower2,
  Music2,
  ChefHat,
  Cake,
  ClipboardList,
  Heart,
  PartyPopper,
  Wand2,
  Building2,
  HelpCircle,
  Tag,
  type LucideIcon,
} from 'lucide-react'

export type VendorCategory = {
  id: string
  label: string
  profileLabel: string
  icon: LucideIcon
  hint?: string
}

// Fallback list used when the DB query fails or the table doesn't exist yet.
export const VENDOR_CATEGORIES: VendorCategory[] = [
  { id: 'venue', label: 'Venue or event space', profileLabel: 'Venue', icon: Building2 },
  { id: 'caterer', label: 'Caterer / Bar services', profileLabel: 'Caterer', icon: ChefHat },
  { id: 'photographer', label: 'Photographer', profileLabel: 'Photographer', icon: Camera },
  { id: 'cakes', label: 'Cakes & desserts', profileLabel: 'Cake artist', icon: Cake },
  { id: 'florist', label: 'Florist', profileLabel: 'Florist', icon: Flower2 },
  { id: 'planner', label: 'Planner / Coordinator', profileLabel: 'Planner', icon: ClipboardList },
  { id: 'musician', label: 'Musician / DJ', profileLabel: 'Musician / DJ', icon: Music2 },
  { id: 'officiant', label: 'Officiant', profileLabel: 'Officiant', icon: Heart },
  { id: 'videographer', label: 'Videographer', profileLabel: 'Videographer', icon: Video },
  {
    id: 'extras',
    label: 'Event extras',
    profileLabel: 'Event extras',
    icon: PartyPopper,
    hint: 'Photo booths, decor, lighting, transport, security, MC',
  },
  { id: 'beauty', label: 'Beauty professional', profileLabel: 'Beauty pro', icon: Wand2 },
]

export const OTHER_CATEGORY: VendorCategory = {
  id: 'other',
  label: 'Something else',
  profileLabel: 'Other',
  icon: HelpCircle,
}

// Swahili translations keyed by category id/slug. Categories can come from the
// `vendor_categories` DB table (no Swahili column) or the fallback list above,
// so we resolve Swahili by stable id rather than carrying it inline.
export const CATEGORY_SW: Record<
  string,
  { label: string; profileLabel: string; hint?: string }
> = {
  venue: { label: 'Ukumbi au eneo la tukio', profileLabel: 'Ukumbi' },
  caterer: { label: 'Mpishi / Huduma za baa', profileLabel: 'Mpishi' },
  photographer: { label: 'Mpiga picha', profileLabel: 'Mpiga picha' },
  cakes: { label: 'Keki na vitamu', profileLabel: 'Mtengeneza keki' },
  florist: { label: 'Mwuza maua', profileLabel: 'Mwuza maua' },
  planner: { label: 'Mpangaji / Mratibu', profileLabel: 'Mpangaji' },
  musician: { label: 'Mwanamuziki / DJ', profileLabel: 'Mwanamuziki / DJ' },
  officiant: { label: 'Mwendesha sherehe', profileLabel: 'Mwendesha sherehe' },
  videographer: { label: 'Mpiga video', profileLabel: 'Mpiga video' },
  extras: {
    label: 'Vifaa vya ziada vya tukio',
    profileLabel: 'Vifaa vya ziada',
    hint: 'Vibanda vya picha, mapambo, taa, usafiri, ulinzi, MC',
  },
  beauty: { label: 'Mtaalam wa urembo', profileLabel: 'Mtaalam wa urembo' },
  other: { label: 'Kitu kingine', profileLabel: 'Nyingine' },
}

export function categorySw(id: string | null | undefined) {
  return id ? CATEGORY_SW[id] : undefined
}

// Reverse lookup: English `profileLabel` → Swahili. Used by the Stepper, which
// only receives the resolved English profileLabel string (not the category id).
// A custom "Other" label that isn't in the map passes through unchanged.
const PROFILE_LABEL_SW: Record<string, string> = Object.fromEntries(
  VENDOR_CATEGORIES.map((c) => [c.profileLabel, CATEGORY_SW[c.id]?.profileLabel ?? c.profileLabel]),
)
PROFILE_LABEL_SW[OTHER_CATEGORY.profileLabel] = CATEGORY_SW.other.profileLabel
PROFILE_LABEL_SW['Vendor'] = 'Mtoa huduma'

export function localizeProfileLabel(profileLabel: string, locale: string): string {
  return locale === 'sw' ? PROFILE_LABEL_SW[profileLabel] ?? profileLabel : profileLabel
}

// Maps lucide icon name strings (stored in DB) to components.
const ICON_MAP: Record<string, LucideIcon> = {
  Building2, ChefHat, Camera, Cake, Flower2, ClipboardList, Music2,
  Heart, Video, PartyPopper, Wand2, HelpCircle, Tag,
}

function iconFromName(name: string): LucideIcon {
  return ICON_MAP[name] ?? Tag
}

export type VendorCategoryRow = {
  slug: string
  label: string
  profile_label: string
  db_value: string
  icon: string
  sort_order: number
}

export function rowToCategory(row: VendorCategoryRow): VendorCategory {
  return {
    id: row.slug,
    label: row.label,
    profileLabel: row.profile_label,
    icon: iconFromName(row.icon),
  }
}

// Icon name strings for the fallback list — used when the DB isn't available
// so the server page can pass plain-object data to the client component.
export const FALLBACK_ICON_NAMES: Record<string, string> = {
  venue: 'Building2',
  caterer: 'ChefHat',
  photographer: 'Camera',
  cakes: 'Cake',
  florist: 'Flower2',
  planner: 'ClipboardList',
  musician: 'Music2',
  officiant: 'Heart',
  videographer: 'Video',
  extras: 'PartyPopper',
  beauty: 'Wand2',
  other: 'HelpCircle',
}

export function findCategory(id: string | null | undefined): VendorCategory | undefined {
  if (!id) return undefined
  if (id === 'other') return OTHER_CATEGORY
  return VENDOR_CATEGORIES.find((c) => c.id === id)
}

export function displayCategoryLabel(
  categoryId: string | null | undefined,
  customCategoryLabel: string,
): string {
  if (categoryId === 'other') return customCategoryLabel || 'Other'
  return findCategory(categoryId)?.profileLabel ?? 'Not set'
}
