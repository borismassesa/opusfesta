import {
  Calendar,
  Camera,
  Clock,
  Flower,
  Gem,
  MapPin,
  Mic,
  Music,
  Sparkles,
  Users,
  Utensils,
  Video,
  type LucideIcon,
} from 'lucide-react'
import type { VendorIconKey } from './vendor-search'

export const VENDOR_ICON_OPTIONS: { key: VendorIconKey; label: string; icon: LucideIcon }[] = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
  { key: 'camera', label: 'Camera', icon: Camera },
  { key: 'music', label: 'Music', icon: Music },
  { key: 'utensils', label: 'Utensils', icon: Utensils },
  { key: 'flower', label: 'Flower', icon: Flower },
  { key: 'video', label: 'Video', icon: Video },
  { key: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { key: 'map-pin', label: 'Map Pin', icon: MapPin },
  { key: 'clock', label: 'Clock', icon: Clock },
  { key: 'mic', label: 'Mic', icon: Mic },
  { key: 'gem', label: 'Gem', icon: Gem },
]

export function getVendorIcon(key: VendorIconKey): LucideIcon {
  return VENDOR_ICON_OPTIONS.find((o) => o.key === key)?.icon ?? Users
}
