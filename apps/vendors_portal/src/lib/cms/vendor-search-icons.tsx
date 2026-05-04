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

const ICONS: Record<VendorIconKey, LucideIcon> = {
  users: Users,
  calendar: Calendar,
  camera: Camera,
  music: Music,
  utensils: Utensils,
  flower: Flower,
  video: Video,
  sparkles: Sparkles,
  'map-pin': MapPin,
  clock: Clock,
  mic: Mic,
  gem: Gem,
}

export function getVendorIcon(key: VendorIconKey): LucideIcon {
  return ICONS[key] ?? Users
}
