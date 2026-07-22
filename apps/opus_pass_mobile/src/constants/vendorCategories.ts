import type { Ionicons } from '@expo/vector-icons';

export type IonIcon = keyof typeof Ionicons.glyphMap;

export interface VendorCategory {
  key: string;
  label: string;
  icon: IonIcon;
  emoji: string;
  image: string;
}

/**
 * `key` is the literal `vendors.category` value stored in the DB — category
 * browse queries filter on it exactly, so these strings must not be reworded.
 * `label` is the display name and is free to differ.
 */
export const VENDOR_CATEGORIES: VendorCategory[] = [
  {
    key: 'Venues',
    label: 'Venues',
    icon: 'business-outline',
    emoji: '🏛️',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80&auto=format&fit=crop',
  },
  {
    key: 'Photographers',
    label: 'Photography',
    icon: 'camera-outline',
    emoji: '📸',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80&auto=format&fit=crop',
  },
  {
    key: 'Caterers',
    label: 'Catering',
    icon: 'restaurant-outline',
    emoji: '🍽️',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80&auto=format&fit=crop',
  },
  {
    key: 'Decorators',
    label: 'Decor',
    icon: 'sparkles-outline',
    emoji: '✨',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80&auto=format&fit=crop',
  },
  {
    key: 'DJs & Music',
    label: 'Music',
    icon: 'musical-notes-outline',
    emoji: '🎵',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80&auto=format&fit=crop',
  },
  {
    key: 'Bridal Salons',
    label: 'Bridal',
    icon: 'shirt-outline',
    emoji: '👗',
    image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800&q=80&auto=format&fit=crop',
  },
  {
    key: 'Cake & Desserts',
    label: 'Cakes',
    icon: 'cafe-outline',
    emoji: '🎂',
    image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800&q=80&auto=format&fit=crop',
  },
  {
    key: 'Wedding Planners',
    label: 'Planning',
    icon: 'clipboard-outline',
    emoji: '📋',
    image: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?w=800&q=80&auto=format&fit=crop',
  },
];

export function findVendorCategory(key: string | undefined): VendorCategory | undefined {
  return VENDOR_CATEGORIES.find((category) => category.key === key);
}
