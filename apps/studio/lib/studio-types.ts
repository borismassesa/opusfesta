export interface StudioProject {
  id: string;
  slug: string;
  number: string;
  category: string;
  title: string;
  description: string;
  full_description: string;
  cover_image: string;
  video_url: string | null;
  gallery_images: string[];
  stats: { label: string; value: string }[];
  highlights: string[];
  is_published: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudioArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_html: string;
  cover_image: string;
  author: string;
  category: string;
  published_at: string | null;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudioService {
  id: string;
  title: string;
  description: string;
  price: string;
  cover_image: string;
  includes: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface StudioTestimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface StudioFaq {
  id: string;
  question: string;
  answer: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface StudioTeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  avatar_url: string | null;
  sort_order: number;
  is_published: boolean;
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface StudioSeo {
  id: string;
  page_key: string;
  title: string | null;
  description: string | null;
  og_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudioSetting {
  key: string;
  value: unknown;
  updated_at: string;
}

export type StudioInquiryStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'closed_won'
  | 'closed_lost'
  | 'spam';

export interface StudioInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  project_type: string | null;
  budget_range: string | null;
  timeline: string | null;
  message: string | null;
  status: StudioInquiryStatus;
  assigned_to: string | null;
  internal_notes: string | null;
  contacted_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type StudioRole = 'studio_admin' | 'studio_editor' | 'studio_viewer';
