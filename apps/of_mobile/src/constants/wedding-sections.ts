import type { Ionicons } from '@expo/vector-icons';
import type { PageKey, WebsitePresetId } from '@/types/site-doc';

type IonIcon = keyof typeof Ionicons.glyphMap;

export interface WebsitePageConfig {
  key: PageKey;
  label: string;
  icon: IonIcon;
}

// The 8 content pages opus_pass's builder supports (excludes 'home', which
// is always visible). Content on each page is opus_pass's own per-template
// copy, not couple-authored — mobile only controls whether the page shows
// at all (see meta.pages[].visible).
export const WEBSITE_PAGES: WebsitePageConfig[] = [
  { key: 'schedule', label: 'Schedule', icon: 'calendar-outline' },
  { key: 'travel', label: 'Travel', icon: 'airplane-outline' },
  { key: 'registry', label: 'Registry', icon: 'gift-outline' },
  { key: 'party', label: 'Wedding Party', icon: 'people-outline' },
  { key: 'gallery', label: 'Gallery', icon: 'images-outline' },
  { key: 'things', label: 'Things To Do', icon: 'compass-outline' },
  { key: 'faqs', label: 'FAQs', icon: 'help-circle-outline' },
  { key: 'rsvp', label: 'RSVP', icon: 'mail-outline' },
];

export const WEBSITE_THEMES = [
  {
    key: 'garden' as const,
    presetId: 'serengeti' as WebsitePresetId,
    label: 'Garden',
    description: 'Botanical & earthy',
    emoji: '🌿',
  },
  {
    key: 'classic' as const,
    presetId: 'tanzanite' as WebsitePresetId,
    label: 'Classic',
    description: 'Timeless & elegant',
    emoji: '✨',
  },
  {
    key: 'modern' as const,
    presetId: 'kanga' as WebsitePresetId,
    label: 'Modern',
    description: 'Bold & contemporary',
    emoji: '💜',
  },
] as const;
