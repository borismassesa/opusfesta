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
import type { TrustIconKey } from './trust'

const ICONS: Record<TrustIconKey, LucideIcon> = {
  users: Users,
  landmark: Landmark,
  headset: Headset,
  'badge-check': BadgeCheck,
  'shield-check': ShieldCheck,
  award: Award,
  'heart-handshake': HeartHandshake,
  star: Star,
  'thumbs-up': ThumbsUp,
  sparkles: Sparkles,
  lock: Lock,
  globe: Globe,
}

export function getTrustIcon(key: TrustIconKey): LucideIcon {
  return ICONS[key] ?? Users
}
