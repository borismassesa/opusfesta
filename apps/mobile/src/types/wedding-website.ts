export type WebsiteTheme = 'garden' | 'classic' | 'modern';

export type SectionKey =
  | 'countdown'
  | 'our_story'
  | 'wedding_details'
  | 'photo_gallery'
  | 'rsvp'
  | 'bridal_party'
  | 'registry'
  | 'travel'
  | 'dress_code'
  | 'faq'
  | 'guestbook';

export interface WeddingWebsite {
  id: string;
  user_id: string;
  couple_profile_id: string | null;
  slug: string;
  theme: WebsiteTheme;
  primary_color: string;
  accent_color: string;
  font_family: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface WeddingWebsiteSection {
  id: string;
  website_id: string;
  section_key: SectionKey;
  content: Record<string, any>;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WeddingRsvp {
  id: string;
  website_id: string;
  guest_name: string;
  email: string | null;
  phone: string | null;
  attending: 'yes' | 'no' | 'pending' | 'maybe';
  plus_one: boolean;
  plus_one_name: string | null;
  dietary_notes: string | null;
  message: string | null;
  meal_choice: string | null;
  submitted_via: 'form' | 'whatsapp';
  created_at: string;
}

export interface GuestbookEntry {
  id: string;
  website_id: string;
  guest_name: string;
  message: string;
  is_approved: boolean;
  created_at: string;
}

// ── Section content types ──

export interface CountdownContent {
  target_date: string;
  message: string;
  show_on_homepage: boolean;
}

export interface OurStoryContent {
  title: string;
  story: string;
  photos: string[];
  timeline: { date: string; event: string; description: string }[];
}

export interface WeddingDetailsContent {
  ceremony_date: string;
  ceremony_time: string;
  ceremony_venue: string;
  ceremony_address: string;
  reception_venue: string;
  reception_address: string;
  reception_time: string;
  dress_code: string;
  notes: string;
}

export interface PhotoGalleryContent {
  title: string;
  photos: { url: string; caption: string }[];
}

export interface RsvpContent {
  deadline: string;
  max_plus_ones: number;
  meal_options: string[];
  whatsapp_fallback: boolean;
  whatsapp_number: string;
  custom_message: string;
}

export interface BridalPartyContent {
  title: string;
  members: { name: string; role: string; photo_url: string; bio: string }[];
}

export interface RegistryContent {
  title: string;
  message: string;
  items: { name: string; url: string; price_tzs: number; image_url: string; purchased: boolean }[];
  mobile_money: { provider: string; number: string; name: string } | null;
}

export interface TravelContent {
  title: string;
  hotels: { name: string; address: string; url: string; price_range: string; notes: string }[];
  transport_tips: string;
  local_tips: string;
}

export interface DressCodeContent {
  title: string;
  description: string;
  examples: { label: string; image_url: string }[];
  colors_to_avoid: string[];
}

export interface FaqContent {
  items: { question: string; answer: string }[];
}

export interface GuestbookContent {
  title: string;
  subtitle: string;
  moderated: boolean;
}
