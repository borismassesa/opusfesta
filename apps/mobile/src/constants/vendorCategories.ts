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
}[] = [
  { key: 'Venues', label: 'Venues', icon: 'business-outline', bg: purpleTints[100], iconColor: purpleTints[700], emoji: '🏛️' },
  { key: 'Photographers', label: 'Photo', icon: 'camera-outline', bg: purpleTints[50], iconColor: purpleTints[500], emoji: '📸' },
  { key: 'Caterers', label: 'Catering', icon: 'restaurant-outline', bg: purpleTints[150], iconColor: purpleTints[800], emoji: '🍽️' },
  { key: 'Decorators', label: 'Decor', icon: 'sparkles-outline', bg: purpleTints[50], iconColor: purpleTints[700], emoji: '✨' },
  { key: 'DJs & Music', label: 'Music', icon: 'musical-notes-outline', bg: purpleTints[100], iconColor: purpleTints[500], emoji: '🎵' },
  { key: 'Bridal Salons', label: 'Bridal', icon: 'shirt-outline', bg: purpleTints[150], iconColor: purpleTints[800], emoji: '👗' },
  { key: 'Cake & Desserts', label: 'Cakes', icon: 'cafe-outline', bg: purpleTints[50], iconColor: purpleTints[700], emoji: '🎂' },
  { key: 'Wedding Planners', label: 'Planning', icon: 'clipboard-outline', bg: purpleTints[100], iconColor: purpleTints[500], emoji: '📋' },
];
