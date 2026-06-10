import {
  Camera,
  Video,
  Flower2,
  Music2,
  Sparkles,
  ChefHat,
  Cake,
  ClipboardList,
  Heart,
  PartyPopper,
  Wand2,
  Building2,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'

export type VendorCategory = {
  id: string
  label: string
  profileLabel: string
  icon: LucideIcon
  hint?: string
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

export function findCategory(id: string | null | undefined): VendorCategory | undefined {
  if (!id) return undefined
  if (id === 'other') return OTHER_CATEGORY
  return VENDOR_CATEGORIES.find((c) => c.id === id)
}
