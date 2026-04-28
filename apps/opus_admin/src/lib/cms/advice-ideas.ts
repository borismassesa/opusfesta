// Types and fallbacks for the Advice & Ideas CMS — page chrome lives in
// website_page_sections, individual posts in advice_ideas_posts.

export const ADVICE_IDEAS_PAGE_KEY = 'advice-and-ideas'

export const ADVICE_IDEAS_SECTION_IDS = [
  'featured-stories',
  'planning-guides',
  'real-weddings',
  'themes-styles',
  'etiquette-wording',
  'bridal-shower-ideas',
  'honeymoon-ideas',
] as const
export type AdviceIdeasSectionId = (typeof ADVICE_IDEAS_SECTION_IDS)[number]

// ---------- Hero (AdviceHero) ----------

export type AdviceHeroContent = {
  headline_prefix: string // "Plan a wedding"
  headline_suffix_prefix: string // "that feels"
  rotating_words: string[] // the rotated words
  subheadline: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
}

export const ADVICE_HERO_FALLBACK: AdviceHeroContent = {
  headline_prefix: 'Plan a wedding',
  headline_suffix_prefix: 'that feels',
  rotating_words: [
    'unforgettable',
    'cinematic',
    'effortless',
    'intentional',
    'coastal',
    'timeless',
    'romantic ♥',
    'personal',
    'warm',
  ],
  subheadline:
    'Real celebrations, honest planning advice, and the ideas worth borrowing. Gathered for couples building a wedding that feels unmistakably their own.',
  primary_cta_label: 'Start reading',
  primary_cta_href: '#editor-picks',
  secondary_cta_label: 'Latest stories',
  secondary_cta_href: '#latest-stories',
}

// ---------- Topics (sticky strip + Popular Topics grid) ----------

export type AdviceTopicItem = {
  id: AdviceIdeasSectionId
  label: string
  description: string
  cover_image_url: string
}

export type AdviceTopicsContent = { items: AdviceTopicItem[] }

export const ADVICE_TOPICS_FALLBACK: AdviceTopicsContent = {
  items: [
    { id: 'featured-stories', label: 'Featured Stories', description: 'Editor picks, sharp ideas, and standout inspiration.', cover_image_url: '/assets/images/coupleswithpiano.jpg' },
    { id: 'planning-guides', label: 'Planning Guides', description: 'Timelines, vendor strategy, and practical decision making.', cover_image_url: '/assets/images/brideincar.jpg' },
    { id: 'real-weddings', label: 'Real Weddings', description: 'Celebrations that feel personal, stylish, and deeply local.', cover_image_url: '/assets/images/authentic_couple.jpg' },
    { id: 'themes-styles', label: 'Themes & Styles', description: 'Moodboards, palettes, looks, and atmosphere.', cover_image_url: '/assets/images/flowers_pinky.jpg' },
    { id: 'etiquette-wording', label: 'Etiquette & Wording', description: 'Guest communication, boundaries, and graceful scripts.', cover_image_url: '/assets/images/hand_rings.jpg' },
    { id: 'bridal-shower-ideas', label: 'Bridal Shower Ideas', description: 'Modern ways to host pre-wedding celebrations.', cover_image_url: '/assets/images/mauzo_crew.jpg' },
    { id: 'honeymoon-ideas', label: 'Honeymoon Ideas', description: 'Escapes, soft landings, and memorable mini-moons.', cover_image_url: '/assets/images/bride_umbrella.jpg' },
  ],
}

// ---------- Section headers (editor picks, loved by couples, favorites, latest) ----------

export type AdviceSectionHeadersContent = {
  editor_picks: {
    title: string
    subtitle: string
    view_all_label: string
    view_all_href: string
    mobile_cta_label: string
  }
  popular_topics: {
    title: string
  }
  loved_by_couples: {
    title: string
    subtitle: string
    view_all_label: string
    view_all_href: string
    cta_label: string
  }
  favorites: {
    title: string
    subtitle: string
    view_all_label: string
    view_all_href: string
    cta_label: string
  }
  latest_stories: {
    id: string
    title: string
    subtitle: string
  }
  search: {
    eyebrow: string
    no_results_headline: string
    no_results_body: string
    clear_label: string
    back_label: string
  }
}

export const ADVICE_SECTION_HEADERS_FALLBACK: AdviceSectionHeadersContent = {
  editor_picks: {
    title: 'Our editor’s picks',
    subtitle:
      'Welcome to the inspiration stage. The latest advice and trending ideas to help you design the best day ever.',
    view_all_label: 'View all',
    view_all_href: '/advice-and-ideas#latest-stories',
    mobile_cta_label: 'View all articles',
  },
  popular_topics: {
    title: 'Popular Topics',
  },
  loved_by_couples: {
    title: 'Loved by Couples',
    subtitle:
      'Expert tips, tricks, and wedding planning ideas our readers keep coming back to.',
    view_all_label: 'View all',
    view_all_href: '/advice-and-ideas#latest-stories',
    cta_label: 'Read story',
  },
  favorites: {
    title: 'Our Favorites',
    subtitle:
      'The OpusFesta editorial team. Fashion editors, honeymoon writers, and etiquette voices share their stories of the moment.',
    view_all_label: 'View all',
    view_all_href: '/advice-and-ideas#latest-stories',
    cta_label: 'Read story',
  },
  latest_stories: {
    id: 'latest-stories',
    title: 'Latest Stories',
    subtitle:
      'Fresh planning advice, style notes, and real wedding stories from across the OpusFesta journal.',
  },
  search: {
    eyebrow: 'Search results',
    no_results_headline: 'No stories match “{query}”',
    no_results_body:
      'Try a shorter query, a different keyword, or browse topics from the nav above.',
    clear_label: '← Clear search',
    back_label: 'Back to the hub',
  },
}

export type AdvicePageSectionRow<T> = {
  id: string
  page_key: string
  section_key: string
  content: T
  draft_content: T | null
  is_published: boolean
  updated_at: string
}

// ---------- Post rows ----------

export type AdviceIdeasBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'quote'; quote: string; attribution?: string }
  | { type: 'tip'; title: string; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'video'; src: string; poster?: string; alt: string; caption?: string }
  | { type: 'gallery'; items: { src: string; alt: string }[] }

export const ADVICE_BLOCK_TYPES: AdviceIdeasBlock['type'][] = [
  'paragraph',
  'subheading',
  'list',
  'quote',
  'tip',
  'image',
  'video',
  'gallery',
]

export type AdviceIdeasBodySection = {
  id: string
  label?: string
  heading: string
  blocks: AdviceIdeasBlock[]
}

export type AdviceIdeasSeedComment = {
  id: string
  name: string
  body: string
  date: string
  likes: number
}

export type AdviceIdeasAuthorRow = {
  id: string
  key: string
  name: string
  role: string
  bio: string
  initials: string
  avatar_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export const EMPTY_AUTHOR_DRAFT = (): Omit<AdviceIdeasAuthorRow, 'id' | 'created_at' | 'updated_at'> => ({
  key: '',
  name: '',
  role: '',
  bio: '',
  initials: '',
  avatar_url: '',
  sort_order: 100,
})

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 3)
}

export type AdviceIdeasPostRow = {
  id: string
  slug: string
  title: string
  description: string
  excerpt: string
  category: string
  section_id: AdviceIdeasSectionId
  author_name: string | null
  author_role: string | null
  author_avatar_url: string | null
  read_time: number // minutes
  featured: boolean
  published: boolean
  published_at: string
  hero_media_type: 'image' | 'video'
  hero_media_src: string
  hero_media_alt: string
  hero_media_poster: string | null
  body: AdviceIdeasBodySection[]
  seed_comments: AdviceIdeasSeedComment[]
  created_at: string
  updated_at: string
}

export const EMPTY_POST_DRAFT = (): Omit<AdviceIdeasPostRow, 'id' | 'created_at' | 'updated_at'> => ({
  slug: '',
  title: '',
  description: '',
  excerpt: '',
  category: 'Planning Guides',
  section_id: 'planning-guides',
  author_name: '',
  author_role: '',
  author_avatar_url: '',
  read_time: 5,
  featured: false,
  published: false,
  published_at: new Date().toISOString(),
  hero_media_type: 'image',
  hero_media_src: '',
  hero_media_alt: '',
  hero_media_poster: '',
  body: [],
  seed_comments: [],
})

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function formatReadTime(minutes: number): string {
  const m = Math.max(1, Math.round(minutes))
  return `${m} min read`
}

export function formatPublishedDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
