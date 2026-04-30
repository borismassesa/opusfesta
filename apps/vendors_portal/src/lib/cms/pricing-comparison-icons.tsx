import {
  Bell,
  CalendarCheck,
  ClipboardList,
  Gift,
  HeartHandshake,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { FeatureIconKey } from './pricing-comparison'

const ICONS: Record<FeatureIconKey, LucideIcon> = {
  'calendar-check': CalendarCheck,
  users: Users,
  'shield-check': ShieldCheck,
  sparkles: Sparkles,
  'heart-handshake': HeartHandshake,
  'message-square': MessageSquare,
  bell: Bell,
  'clipboard-list': ClipboardList,
  wallet: Wallet,
  gift: Gift,
  'map-pin': MapPin,
  star: Star,
}

export function getFeatureIcon(key: FeatureIconKey): LucideIcon {
  return ICONS[key] ?? CalendarCheck
}
