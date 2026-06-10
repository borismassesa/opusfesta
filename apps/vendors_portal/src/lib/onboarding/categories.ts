import {
  Armchair,
  Camera,
  Video,
  Flower2,
  Music2,
  CarFront,
  ChefHat,
  Cake,
  ClipboardList,
  Gem,
  Heart,
  MoreHorizontal,
  Wand2,
  Building2,
  type LucideIcon,
} from 'lucide-react'

export type VendorCategory = {
  id: string
  label: string
  profileLabel: string
  icon: LucideIcon
  hint?: string
  // When true, picking this category reveals a required free-text field on
  // the category step — the vendor types what their business actually does
  // (e.g. "MC services", "photo booths"). Captured as draft.customCategory.
  requiresDetail?: boolean
}

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
  { id: 'beauty', label: 'Beauty professional', profileLabel: 'Beauty pro', icon: Wand2 },
  {
    id: 'transport',
    label: 'Transportation',
    profileLabel: 'Transportation',
    icon: CarFront,
    hint: 'Wedding cars, buses, guest shuttles',
  },
  {
    id: 'bridal-salon',
    label: 'Bridal salon',
    profileLabel: 'Bridal salon',
    icon: Gem,
    hint: 'Gowns, suits, fittings & accessories',
  },
  {
    id: 'rentals',
    label: 'Rentals',
    profileLabel: 'Rentals',
    icon: Armchair,
    hint: 'Tents, chairs, tables, sound & lighting',
  },
  {
    id: 'other',
    label: 'Others',
    profileLabel: 'Event services',
    icon: MoreHorizontal,
    hint: 'Decor, security, MC, photo booths — tell us what you do',
    requiresDetail: true,
  },
]

export function findCategory(id: string | null | undefined): VendorCategory | undefined {
  if (!id) return undefined
  return VENDOR_CATEGORIES.find((c) => c.id === id)
}
