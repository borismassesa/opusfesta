import { light } from './palette';

/**
 * Light-mode design tokens for use outside NativeWind (e.g. LinearGradient,
 * StatusBar). These re-export the LIGHT palette so existing static importers keep
 * their current behavior. For color that must respond to dark mode, read the
 * active tokens from the `useTheme()` hook (src/theme/useTheme.ts) instead — it
 * returns the light or dark variant of these same objects. Both derive from the
 * single source in src/constants/palette.ts.
 */
export const colors = light.colors;

/**
 * Editorial Romance design tokens (light). Neutral black/white/gray with a
 * single lavender accent (#C9A0DC), matching apps/opus_pass — see
 * src/constants/palette.ts for the light + dark definitions. `purpleTints`
 * below is a separate, still-purple decorative scale (welcome hero, category
 * tinting) left untouched by this.
 */
export const editorial = light.editorial;

/**
 * Auth flow design tokens — matches the flat, monochrome OpusFesta/OpusPass
 * web auth screens (apps/opus_website, apps/opus_pass) rather than the
 * Editorial Romance system above. Scoped to app/(auth)/* and src/components/auth/*.
 */
export const authTheme = {
  bg: '#FFFFFF',
  ink: '#1A1A1A',
  textSecondary: '#6B7280',
  placeholder: '#9CA3AF',  // muted text: input placeholders, disabled/cooldown labels
  chipBg: '#F3F4F6',       // neutral pill/chip background
  border: '#D1D5DB',
  borderFocus: '#C9A0DC',
  accent: '#7E5896',
  danger: '#DC2626',
  radius: 8,
} as const;

/** Brand purple tint scale for direct use */
export const purpleTints = {
  950: '#1A0A2E',
  900: '#2A1245',
  800: '#3D1B66',
  700: '#5B2D8E',  // Primary
  500: '#7B4FA2',  // Accent
  400: '#9B73B8',
  350: '#AD8AC8',
  300: '#C9A0DC',  // Soft / Lavender
  200: '#D8B8E8',
  150: '#E5CFF0',
  100: '#F0E2F7',
  50:  '#F8F1FC',
} as const;

/**
 * Soft elevation shadows (OpusFesta "Editorial Romance" system).
 * Blurred, low-opacity, minimal offset — the shared web look, not hard offset.
 */
export const shadowSoft = {
  shadowColor: '#1A1A1A',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 6,
} as const;

export const shadowSoftSm = {
  shadowColor: '#1A1A1A',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
} as const;

export const shadowSoftPrimary = {
  shadowColor: '#1A1A1A',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.22,
  shadowRadius: 28,
  elevation: 8,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
} as const;

export const radii = {
  card: 24,
  button: 9999,
  pill: 9999,
  chip: 20,
  input: 14,
  full: 9999,
} as const;

// Keys are the actual `vendors.category` DB values (see
// supabase/migrations/20260611000002_vendor_categories_table.sql db_value column) —
// they must match exactly for getVendorsByCategory()'s .eq('category', key) to return results.
export const VENDOR_CATEGORIES = [
  { key: 'Venues', label: 'Venues', icon: 'business-outline' },
  { key: 'Photographers', label: 'Photography', icon: 'camera-outline' },
  { key: 'Caterers', label: 'Catering', icon: 'restaurant-outline' },
  { key: 'Decorators', label: 'Decor', icon: 'sparkles-outline' },
  { key: 'DJs & Music', label: 'Music & DJs', icon: 'musical-notes-outline' },
  { key: 'Bridal Salons', label: 'Bridal Wear', icon: 'shirt-outline' },
  { key: 'Cake & Desserts', label: 'Cakes', icon: 'cafe-outline' },
  { key: 'Wedding Planners', label: 'Planning', icon: 'clipboard-outline' },
] as const;

export const TAB_ICONS = {
  home: { active: 'home', inactive: 'home-outline' },
  categories: { active: 'search', inactive: 'search-outline' },
  dashboard: { active: 'calendar', inactive: 'calendar-outline' },
  messages: { active: 'chatbubble', inactive: 'chatbubble-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
} as const;
