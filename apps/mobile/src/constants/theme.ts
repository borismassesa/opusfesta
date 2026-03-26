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
 * Brutalist editorial design tokens
 * Built from brand palette:
 *   Primary  #5B2D8E  (Deep Purple)
 *   Accent   #7B4FA2  (Accent Purple)
 *   Soft     #C9A0DC  (Lavender)
 *   Tints    950→50 purple scale
 */
export const brutalist = {
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

/** Brutalist shadow style for React Native */
export const brutalistShadow = {
  shadowColor: '#2A1245',
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 0.8,
  shadowRadius: 0,
  elevation: 4,
} as const;

export const brutalistShadowSm = {
  shadowColor: '#2A1245',
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.6,
  shadowRadius: 0,
  elevation: 2,
} as const;

export const brutalistShadowPrimary = {
  shadowColor: '#5B2D8E',
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
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
  card: 16,
  button: 14,
  pill: 20,
  input: 12,
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
