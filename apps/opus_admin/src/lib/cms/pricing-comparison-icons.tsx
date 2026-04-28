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

export const FEATURE_ICON_OPTIONS: { key: FeatureIconKey; label: string; icon: LucideIcon }[] = [
  { key: 'calendar-check', label: 'Calendar Check', icon: CalendarCheck },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'shield-check', label: 'Shield Check', icon: ShieldCheck },
  { key: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { key: 'heart-handshake', label: 'Heart Handshake', icon: HeartHandshake },
  { key: 'message-square', label: 'Message Square', icon: MessageSquare },
  { key: 'bell', label: 'Bell', icon: Bell },
  { key: 'clipboard-list', label: 'Clipboard List', icon: ClipboardList },
  { key: 'wallet', label: 'Wallet', icon: Wallet },
  { key: 'gift', label: 'Gift', icon: Gift },
  { key: 'map-pin', label: 'Map Pin', icon: MapPin },
  { key: 'star', label: 'Star', icon: Star },
]

export function getFeatureIcon(key: FeatureIconKey): LucideIcon {
  return FEATURE_ICON_OPTIONS.find((o) => o.key === key)?.icon ?? CalendarCheck
}
