import type { Ionicons } from '@expo/vector-icons';

type IonIcon = keyof typeof Ionicons.glyphMap;

/** Tanzania cities for location selection */
export const CITIES = [
  { key: 'dar_es_salaam', label: 'Dar es Salaam', icon: '🏙️' as const },
  { key: 'arusha', label: 'Arusha', icon: '🏔️' as const },
  { key: 'zanzibar', label: 'Zanzibar', icon: '🏝️' as const },
  { key: 'mwanza', label: 'Mwanza', icon: '🌊' as const },
  { key: 'dodoma', label: 'Dodoma', icon: '🏛️' as const },
  { key: 'moshi', label: 'Moshi', icon: '⛰️' as const },
  { key: 'other', label: 'Other', icon: '📍' as const },
] as const;

export type CityKey = (typeof CITIES)[number]['key'];

/** Budget ranges in TZS */
export const BUDGET_RANGES = [
  { key: 'under_5m', label: 'Under TZS 5M', min: 0, max: 5_000_000 },
  { key: '5m_15m', label: 'TZS 5M \u2013 15M', min: 5_000_000, max: 15_000_000 },
  { key: '15m_30m', label: 'TZS 15M \u2013 30M', min: 15_000_000, max: 30_000_000 },
  { key: '30m_50m', label: 'TZS 30M \u2013 50M', min: 30_000_000, max: 50_000_000 },
  { key: 'over_50m', label: 'TZS 50M+', min: 50_000_000, max: null },
  { key: 'undisclosed', label: 'Prefer not to say', min: null, max: null },
] as const;

export type BudgetKey = (typeof BUDGET_RANGES)[number]['key'];

/** Guest count presets */
export const GUEST_PRESETS = [50, 100, 200, 300, 500] as const;

/** Planning stage options for onboarding step 2 */
export const PLANNING_STAGES = [
  {
    key: 'exploring',
    label: 'Just exploring',
    description: 'Gathering inspiration and dreaming big.',
    icon: 'sparkles-outline' as const,
    bgColor: '#F0E2F7',
    iconColor: '#2A1245',
  },
  {
    key: 'recently_engaged',
    label: 'Recently engaged',
    description: 'The ring is on! Ready to start the logistics.',
    icon: 'ribbon-outline' as const,
    bgColor: '#D8B8E8',
    iconColor: '#3D1B66',
  },
  {
    key: 'booked_venue',
    label: 'Booked a venue',
    description: 'Date is locked in. Time to find vendors.',
    icon: 'location-outline' as const,
    bgColor: '#E5CFF0',
    iconColor: '#3D1B66',
  },
  {
    key: 'sending_invitations',
    label: 'Sending invitations',
    description: 'The guest list is ready. Managing RSVPs.',
    icon: 'mail-outline' as const,
    bgColor: '#e0d4e8',
    iconColor: '#1A0A2E',
  },
] as const;

export type PlanningStageKey = (typeof PLANNING_STAGES)[number]['key'];

/** Guest count options matching the brutalist design */
export const GUEST_COUNT_OPTIONS = [
  { key: 'under_50', label: 'Under 50', subtitle: 'Intimate Gathering', value: 50 },
  { key: '50_100', label: '50\u2013100', subtitle: 'Small Boutique', value: 100 },
  { key: '100_200', label: '100\u2013200', subtitle: 'Classic Celebration', value: 200 },
  { key: '200_400', label: '200\u2013400', subtitle: 'Grand Gala', value: 400 },
  { key: '400_plus', label: '400+', subtitle: 'Large Scale Festival', value: 500 },
] as const;

export type GuestCountKey = (typeof GUEST_COUNT_OPTIONS)[number]['key'];

/** Vendor categories for couple preference selection (expanded from theme.ts) */
export const ONBOARDING_CATEGORIES: { key: string; label: string; icon: IonIcon }[] = [
  { key: 'venues', label: 'Venues', icon: 'business-outline' },
  { key: 'photographers', label: 'Photography', icon: 'camera-outline' },
  { key: 'videographers', label: 'Videography', icon: 'videocam-outline' },
  { key: 'caterers', label: 'Catering', icon: 'restaurant-outline' },
  { key: 'decor', label: 'Decor', icon: 'sparkles-outline' },
  { key: 'djs-music', label: 'Music & DJs', icon: 'musical-notes-outline' },
  { key: 'beauty-makeup', label: 'Beauty & Makeup', icon: 'brush-outline' },
  { key: 'bridal-wear', label: 'Bridal Wear', icon: 'shirt-outline' },
  { key: 'cakes', label: 'Cakes & Desserts', icon: 'cafe-outline' },
  { key: 'planners', label: 'Wedding Planning', icon: 'clipboard-outline' },
  { key: 'florists', label: 'Florists', icon: 'flower-outline' },
  { key: 'transport', label: 'Transportation', icon: 'car-outline' },
  { key: 'rentals', label: 'Rentals', icon: 'easel-outline' },
];

/** Vendor categories matching the DB enum for vendor signup */
export const VENDOR_CATEGORY_OPTIONS: { key: string; label: string; icon: IonIcon }[] = [
  { key: 'Venues', label: 'Venues', icon: 'business-outline' },
  { key: 'Photographers', label: 'Photography', icon: 'camera-outline' },
  { key: 'Videographers', label: 'Videography', icon: 'videocam-outline' },
  { key: 'Caterers', label: 'Catering', icon: 'restaurant-outline' },
  { key: 'Wedding Planners', label: 'Wedding Planning', icon: 'clipboard-outline' },
  { key: 'Florists', label: 'Florists', icon: 'flower-outline' },
  { key: 'DJs & Music', label: 'Music & DJs', icon: 'musical-notes-outline' },
  { key: 'Beauty & Makeup', label: 'Beauty & Makeup', icon: 'brush-outline' },
  { key: 'Bridal Salons', label: 'Bridal Wear', icon: 'shirt-outline' },
  { key: 'Cake & Desserts', label: 'Cakes & Desserts', icon: 'cafe-outline' },
  { key: 'Decorators', label: 'Decorators', icon: 'sparkles-outline' },
  { key: 'Officiants', label: 'Officiants', icon: 'people-outline' },
  { key: 'Rentals', label: 'Rentals', icon: 'easel-outline' },
  { key: 'Transportation', label: 'Transportation', icon: 'car-outline' },
];

/** Wedding venue setting preferences for couple onboarding (brutalist grid) */
export const VENUE_STYLES = [
  { key: 'beach', label: 'Beach / Waterfront', emoji: '🏖️', color: '#E0F7FA' },
  { key: 'garden', label: 'Garden / Outdoor', emoji: '🌿', color: '#E8F5E9' },
  { key: 'ballroom', label: 'Hotel / Ballroom', emoji: '✨', color: '#F0E2F7' },
  { key: 'cultural', label: 'Cultural / Traditional', emoji: '🪘', color: '#F3EBF9' },
  { key: 'rustic', label: 'Rustic / Farm', emoji: '🏡', color: '#EFEBE9' },
  { key: 'modern', label: 'Modern / Minimal', emoji: '🏙️', color: '#ECEFF1' },
] as const;

export type VenueStyleKey = (typeof VENUE_STYLES)[number]['key'];

/** Wedding design style preferences for couple onboarding (brutalist grid) */
export const DESIGN_STYLES = [
  { key: 'bold', label: 'Bold & Colorful', emoji: '🎨', color: '#F3E5F5' },
  { key: 'classic', label: 'Classic & Elegant', emoji: '🕊️', color: '#F0E2F7' },
  { key: 'modern', label: 'Modern & Minimal', emoji: '◻️', color: '#ECEFF1' },
  { key: 'romantic', label: 'Romantic & Floral', emoji: '🌹', color: '#FCE4EC' },
  { key: 'cultural', label: 'Cultural & Traditional', emoji: '🪘', color: '#F3EBF9' },
  { key: 'bohemian', label: 'Bohemian & Eclectic', emoji: '🌾', color: '#EFEBE9' },
] as const;

export type DesignStyleKey = (typeof DESIGN_STYLES)[number]['key'];

/** Vendor need items for onboarding grid (matching brutalist design) */
export const VENDOR_NEED_ITEMS: { key: string; label: string; icon: string; iconColor: string }[] = [
  { key: 'venues', label: 'Venue', icon: 'storefront-outline', iconColor: '#421468' },
  { key: 'photographers', label: 'Photographer', icon: 'camera-outline', iconColor: '#421468' },
  { key: 'videographers', label: 'Videographer', icon: 'videocam-outline', iconColor: '#421468' },
  { key: 'caterers', label: 'Caterer', icon: 'restaurant-outline', iconColor: '#421468' },
  { key: 'planners', label: 'Wedding Planner', icon: 'clipboard-outline', iconColor: '#421468' },
  { key: 'djs-music', label: 'DJ / Music', icon: 'musical-notes-outline', iconColor: '#421468' },
  { key: 'florists', label: 'Florist', icon: 'flower-outline', iconColor: '#421468' },
  { key: 'cakes', label: 'Cake & Desserts', icon: 'cafe-outline', iconColor: '#421468' },
  { key: 'bridal-wear', label: 'Bridal Wear', icon: 'shirt-outline', iconColor: '#421468' },
  { key: 'grooms-wear', label: "Groom's Wear", icon: 'man-outline', iconColor: '#421468' },
  { key: 'decor', label: 'Decor & Rentals', icon: 'sparkles-outline', iconColor: '#421468' },
  { key: 'beauty-makeup', label: 'MC / Host', icon: 'mic-outline', iconColor: '#421468' },
];

/** Price range options for vendor onboarding */
export const PRICE_RANGE_OPTIONS = [
  { key: '$', label: 'Budget-friendly', description: 'Under TZS 2M' },
  { key: '$$', label: 'Mid-range', description: 'TZS 2M \u2013 10M' },
  { key: '$$$', label: 'Premium', description: 'TZS 10M \u2013 25M' },
  { key: '$$$$', label: 'Luxury', description: 'TZS 25M+' },
] as const;
