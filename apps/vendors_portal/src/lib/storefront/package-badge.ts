import {
  Award,
  BadgeCheck,
  Crown,
  Flame,
  Gem,
  Heart,
  Sparkles,
  Star,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { PackageBadgeIcon, PackageBadgeTone } from '@/lib/onboarding/packages'

export const PACKAGE_BADGE_ICONS: Array<{
  id: PackageBadgeIcon
  label: string
  Icon: LucideIcon
}> = [
  { id: 'star', label: 'Star', Icon: Star },
  { id: 'crown', label: 'Crown', Icon: Crown },
  { id: 'gem', label: 'Gem', Icon: Gem },
  { id: 'sparkles', label: 'Sparkles', Icon: Sparkles },
  { id: 'award', label: 'Award', Icon: Award },
  { id: 'trophy', label: 'Trophy', Icon: Trophy },
  { id: 'flame', label: 'Flame', Icon: Flame },
  { id: 'heart', label: 'Heart', Icon: Heart },
  { id: 'badge-check', label: 'Verified', Icon: BadgeCheck },
  { id: 'zap', label: 'Zap', Icon: Zap },
]

export function packageBadgeIcon(id: PackageBadgeIcon): LucideIcon {
  return PACKAGE_BADGE_ICONS.find((b) => b.id === id)?.Icon ?? Star
}

export const PACKAGE_BADGE_TONES: Array<{
  id: PackageBadgeTone
  label: string
  // Tailwind classes for the rendered pill — kept inline so the colours stay
  // close to the brand-palette tokens without a runtime style lookup.
  className: string
  // Solid swatch shown in the picker grid.
  swatchClassName: string
}> = [
  {
    id: 'lavender',
    label: 'Lavender',
    className: 'bg-[#F0DFF6] text-[#7E5896]',
    swatchClassName: 'bg-[#7E5896]',
  },
  {
    id: 'gold',
    label: 'Gold',
    className: 'bg-[#FCE9C2] text-[#8a5a14]',
    swatchClassName: 'bg-[#B07F2C]',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    className: 'bg-emerald-50 text-emerald-700',
    swatchClassName: 'bg-emerald-500',
  },
  {
    id: 'rose',
    label: 'Rose',
    className: 'bg-rose-50 text-rose-700',
    swatchClassName: 'bg-rose-500',
  },
  {
    id: 'dark',
    label: 'Dark',
    className: 'bg-gray-900 text-white',
    swatchClassName: 'bg-gray-900',
  },
]

export function packageBadgeToneClass(id: PackageBadgeTone): string {
  return PACKAGE_BADGE_TONES.find((t) => t.id === id)?.className ?? PACKAGE_BADGE_TONES[0].className
}
