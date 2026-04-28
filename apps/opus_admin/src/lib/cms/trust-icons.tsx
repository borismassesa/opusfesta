import {
  Award,
  BadgeCheck,
  Globe,
  Headset,
  HeartHandshake,
  Landmark,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { TrustIconKey } from '@/lib/cms/trust'

export const TRUST_ICON_OPTIONS: { key: TrustIconKey; label: string; icon: LucideIcon }[] = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'landmark', label: 'Landmark', icon: Landmark },
  { key: 'headset', label: 'Headset', icon: Headset },
  { key: 'badge-check', label: 'Badge Check', icon: BadgeCheck },
  { key: 'shield-check', label: 'Shield Check', icon: ShieldCheck },
  { key: 'award', label: 'Award', icon: Award },
  { key: 'heart-handshake', label: 'Heart Handshake', icon: HeartHandshake },
  { key: 'star', label: 'Star', icon: Star },
  { key: 'thumbs-up', label: 'Thumbs Up', icon: ThumbsUp },
  { key: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { key: 'lock', label: 'Lock', icon: Lock },
  { key: 'globe', label: 'Globe', icon: Globe },
]

export function getTrustIcon(key: TrustIconKey): LucideIcon {
  return TRUST_ICON_OPTIONS.find((o) => o.key === key)?.icon ?? Users
}
