import type { Ionicons } from '@expo/vector-icons';
import { purpleTints } from './theme';

export type IonIcon = keyof typeof Ionicons.glyphMap;

// Keys are the actual `vendors.category` DB values — see VENDOR_CATEGORIES in
// constants/theme.ts. Colors come from the purple tint scale (fixed, does not
// flip in dark mode — labels/icons drawn on these tiles must stay fixed too).
export const BROWSE_CATEGORIES: {
  key: string;
  label: string;
  icon: IonIcon;
  bg: string;
  iconColor: string;
  emoji: string;
  image: string;
}[] = [
  { key: 'Venues', label: 'Venues', icon: 'business-outline', bg: purpleTints[100], iconColor: purpleTints[700], emoji: '🏛️', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80&auto=format&fit=crop' },
  { key: 'Photographers', label: 'Photo', icon: 'camera-outline', bg: purpleTints[50], iconColor: purpleTints[500], emoji: '📸', image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80&auto=format&fit=crop' },
  { key: 'Caterers', label: 'Catering', icon: 'restaurant-outline', bg: purpleTints[150], iconColor: purpleTints[800], emoji: '🍽️', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80&auto=format&fit=crop' },
  { key: 'Decorators', label: 'Decor', icon: 'sparkles-outline', bg: purpleTints[50], iconColor: purpleTints[700], emoji: '✨', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80&auto=format&fit=crop' },
  { key: 'DJs & Music', label: 'Music', icon: 'musical-notes-outline', bg: purpleTints[100], iconColor: purpleTints[500], emoji: '🎵', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80&auto=format&fit=crop' },
  { key: 'Bridal Salons', label: 'Bridal', icon: 'shirt-outline', bg: purpleTints[150], iconColor: purpleTints[800], emoji: '👗', image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800&q=80&auto=format&fit=crop' },
  { key: 'Cake & Desserts', label: 'Cakes', icon: 'cafe-outline', bg: purpleTints[50], iconColor: purpleTints[700], emoji: '🎂', image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800&q=80&auto=format&fit=crop' },
  { key: 'Wedding Planners', label: 'Planning', icon: 'clipboard-outline', bg: purpleTints[100], iconColor: purpleTints[500], emoji: '📋', image: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?w=800&q=80&auto=format&fit=crop' },
];
