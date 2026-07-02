/**
 * Design tokens for use outside NativeWind (e.g. LinearGradient, StatusBar).
 * NativeWind classes should be preferred for component styling.
 */
export const colors = {
  primary: '#5B2D8E',
  medium: '#7B4FA2',
  light: '#C9A0DC',
  pale: '#F3EBF9',
  cream: '#faf7fc',
  white: '#FFFFFF',
  dark: '#2A1245',
  text: '#1E1028',
  muted: '#6B5A7A',
  border: 'rgba(91,45,142,0.12)',
  green: '#2D8E5B',
  gold: '#C4920A',
  coral: '#D85A30',
} as const;

/**
 * Editorial Romance design tokens
 * Built from brand palette:
 *   Primary  #5B2D8E  (Deep Purple)
 *   Accent   #7B4FA2  (Accent Purple)
 *   Soft     #C9A0DC  (Lavender)
 *   Tints    950→50 purple scale
 */
export const editorial = {
  /* Backgrounds */
  bg: '#faf7fc',               // very faint purple-tinted white
  surface: '#faf7fc',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f6f1f9',
  surfaceContainer: '#f0e8f5',
  surfaceContainerHigh: '#e8ddf0',
  surfaceContainerHighest: '#e0d4e8',

  /* Text */
  onSurface: '#1A0A2E',        // 950 – near-black purple
  onSurfaceVariant: '#6B5A7A', // muted purple-grey

  /* Primary – Deep Purple #5B2D8E */
  primaryContainer: '#5B2D8E',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#C9A0DC', // Lavender for icons on primary bg
  primaryFixed: '#F0E2F7',       // tint 100 – lightest purple

  /* Accent / Surface tint */
  surfaceTint: '#7B4FA2',        // Accent Purple

  /* Secondary */
  secondary: '#7B4FA2',
  secondaryContainer: '#E5CFF0', // tint 150
  onSecondaryContainer: '#3D1B66', // 800

  /* Tertiary – gold accent for contrast */
  tertiaryContainer: '#7B4FA2',   // Accent Purple (used for highlights)
  tertiaryFixed: '#F3EBF9',       // tint 50 – palest purple
  onTertiaryFixed: '#2A1245',     // 900 – very dark
  onTertiaryContainer: '#C9A0DC', // Lavender

  /* Outline / borders */
  outline: '#8E7A9E',            // medium purple-grey
  outlineVariant: '#D8C8E4',     // soft purple border

  /* Status */
  error: '#ba1a1a',
} as const;

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
  shadowColor: '#2A1245',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 6,
} as const;

export const shadowSoftSm = {
  shadowColor: '#2A1245',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
} as const;

export const shadowSoftPrimary = {
  shadowColor: '#5B2D8E',
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

export const VENDOR_CATEGORIES = [
  { key: 'venues', label: 'Venues', icon: 'business-outline' },
  { key: 'photographers', label: 'Photography', icon: 'camera-outline' },
  { key: 'caterers', label: 'Catering', icon: 'restaurant-outline' },
  { key: 'decor', label: 'Decor', icon: 'sparkles-outline' },
  { key: 'djs-mcs', label: 'Music & DJs', icon: 'musical-notes-outline' },
  { key: 'designers', label: 'Bridal wear', icon: 'shirt-outline' },
  { key: 'rentals', label: 'Cakes', icon: 'cafe-outline' },
  { key: 'salons-makeup', label: 'Planning', icon: 'clipboard-outline' },
] as const;

export const TAB_ICONS = {
  home: { active: 'home', inactive: 'home-outline' },
  categories: { active: 'search', inactive: 'search-outline' },
  dashboard: { active: 'calendar', inactive: 'calendar-outline' },
  messages: { active: 'chatbubble', inactive: 'chatbubble-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
} as const;
