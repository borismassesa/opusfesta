import type { Ionicons } from '@expo/vector-icons';
import type { SectionKey } from '@/types/wedding-website';

type IonIcon = keyof typeof Ionicons.glyphMap;

export interface SectionConfig {
  key: SectionKey;
  label: string;
  icon: IonIcon;
  defaultContent: Record<string, any>;
  defaultSortOrder: number;
  defaultPublished: boolean;
}

export const WEDDING_SECTIONS: SectionConfig[] = [
  {
    key: 'countdown',
    label: 'Countdown',
    icon: 'timer-outline',
    defaultContent: { target_date: '', message: 'We can\'t wait to celebrate with you!', show_on_homepage: true },
    defaultSortOrder: 0,
    defaultPublished: true,
  },
  {
    key: 'our_story',
    label: 'Our Story',
    icon: 'heart-outline',
    defaultContent: { title: 'Our Story', story: '', photos: [], timeline: [] },
    defaultSortOrder: 1,
    defaultPublished: true,
  },
  {
    key: 'wedding_details',
    label: 'Wedding Details',
    icon: 'calendar-outline',
    defaultContent: {
      ceremony_date: '', ceremony_time: '', ceremony_venue: '', ceremony_address: '',
      reception_venue: '', reception_address: '', reception_time: '', dress_code: '', notes: '',
    },
    defaultSortOrder: 2,
    defaultPublished: true,
  },
  {
    key: 'photo_gallery',
    label: 'Photo Gallery',
    icon: 'images-outline',
    defaultContent: { title: 'Our Gallery', photos: [] },
    defaultSortOrder: 3,
    defaultPublished: true,
  },
  {
    key: 'rsvp',
    label: 'RSVP',
    icon: 'mail-outline',
    defaultContent: {
      deadline: '', max_plus_ones: 1, meal_options: [],
      whatsapp_fallback: true, whatsapp_number: '', custom_message: '',
    },
    defaultSortOrder: 4,
    defaultPublished: true,
  },
  {
    key: 'bridal_party',
    label: 'Bridal Party',
    icon: 'people-outline',
    defaultContent: { title: 'Meet the Bridal Party', members: [] },
    defaultSortOrder: 5,
    defaultPublished: false,
  },
  {
    key: 'registry',
    label: 'Registry',
    icon: 'gift-outline',
    defaultContent: { title: 'Gift Registry', message: '', items: [], mobile_money: null },
    defaultSortOrder: 6,
    defaultPublished: false,
  },
  {
    key: 'travel',
    label: 'Travel & Stay',
    icon: 'airplane-outline',
    defaultContent: { title: 'Travel & Accommodation', hotels: [], transport_tips: '', local_tips: '' },
    defaultSortOrder: 7,
    defaultPublished: false,
  },
  {
    key: 'dress_code',
    label: 'Dress Code',
    icon: 'shirt-outline',
    defaultContent: { title: 'Dress Code', description: '', examples: [], colors_to_avoid: [] },
    defaultSortOrder: 8,
    defaultPublished: false,
  },
  {
    key: 'faq',
    label: 'FAQ',
    icon: 'help-circle-outline',
    defaultContent: { items: [] },
    defaultSortOrder: 9,
    defaultPublished: false,
  },
  {
    key: 'guestbook',
    label: 'Guestbook',
    icon: 'chatbubbles-outline',
    defaultContent: { title: 'Leave us a message', subtitle: 'Share your wishes', moderated: true },
    defaultSortOrder: 10,
    defaultPublished: false,
  },
];

export const WEBSITE_THEMES = [
  {
    key: 'garden' as const,
    label: 'Garden',
    description: 'Botanical & earthy',
    primaryColor: '#2D5E3A',
    accentColor: '#C4920A',
    fontFamily: 'cormorant',
    emoji: '🌿',
  },
  {
    key: 'classic' as const,
    label: 'Classic',
    description: 'Timeless & elegant',
    primaryColor: '#1A1A2E',
    accentColor: '#C4920A',
    fontFamily: 'playfair',
    emoji: '✨',
  },
  {
    key: 'modern' as const,
    label: 'Modern',
    description: 'Bold & contemporary',
    primaryColor: '#5B2D8E',
    accentColor: '#FF6B6B',
    fontFamily: 'montserrat',
    emoji: '💜',
  },
] as const;
