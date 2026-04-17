import { unstable_cache } from 'next/cache';
import { getStudioSupabaseAdmin } from './supabase-admin';
import { getTransformedImageUrl } from './cms/assets';
import type {
  StudioService,
  StudioProject,
  StudioArticle,
  StudioTestimonial,
  StudioFaq,
  StudioSeo,
  StudioTeamMember,
} from './studio-types';

// ────────────────────────────────────────────────────────────────────────────
// Phase 4 content types are served from studio_documents. Legacy tables
// (studio_articles, studio_seo, studio_settings, studio_page_sections)
// are still read from their original locations until they get their own
// migration.
//
// The document→legacy shape translators below exist so the public site
// components (ServicesSection, FAQSection, portfolio pages, etc.) keep
// working without any changes. Once every reader has been audited we can
// expose the raw document shape directly.
// ────────────────────────────────────────────────────────────────────────────

interface DocRow {
  id: string;
  published_content: Record<string, unknown> | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Resolve an image field (`{ asset_id }` or null + legacy fallback URL) into a public URL. */
async function resolveImageUrl(
  content: Record<string, unknown>,
  imageField: string,
  legacyFallbackField: string,
  transform: { width?: number; height?: number } = {}
): Promise<string> {
  const ref = content[imageField] as { asset_id?: string } | null | undefined;
  if (ref?.asset_id) {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_assets')
      .select('path')
      .eq('id', ref.asset_id)
      .single();
    if (error && error.code !== 'PGRST116') {
      console.error('[data-access] resolveImageUrl asset lookup failed', { assetId: ref.asset_id, error });
    }
    if (data?.path) {
      return getTransformedImageUrl(data.path, { quality: 80, ...transform });
    }
  }
  // Backfill fallback: legacy_cover_image_url / legacy_avatar_url populated by the
  // Phase 4 backfill migration. Plain URL with no transform.
  const legacy = content[legacyFallbackField];
  if (typeof legacy === 'string' && legacy.length > 0) return legacy;
  return '';
}

// ────────────────────────────────────────────────────────────────────────────
// Services
// ────────────────────────────────────────────────────────────────────────────
async function docToService(doc: DocRow): Promise<StudioService> {
  const c = (doc.published_content ?? {}) as Record<string, unknown>;
  const includesArray = Array.isArray(c.includes) ? (c.includes as Array<{ text?: string }>) : [];
  return {
    id: doc.id,
    title: (c.title as string) ?? '',
    description: (c.description as string) ?? '',
    price: (c.price as string) ?? '',
    cover_image: await resolveImageUrl(c, 'cover_image', 'legacy_cover_image_url', { width: 1200 }),
    includes: includesArray.map((i) => (i?.text ?? '')).filter(Boolean),
    is_active: true, // published docs are "active"
    sort_order: typeof c.sort_order === 'number' ? c.sort_order : 0,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

export const getPublishedServices = unstable_cache(
  async (): Promise<StudioService[]> => {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_documents')
      .select('id, published_content, published_at, created_at, updated_at')
      .eq('type', 'service')
      .is('deleted_at', null)
      .not('published_content', 'is', null)
      .limit(500);
    if (error) { console.error('[data-access] getPublishedServices failed', error); return []; }
    const services = await Promise.all(((data ?? []) as DocRow[]).map(docToService));
    return services.sort((a, b) => a.sort_order - b.sort_order);
  },
  ['published-services-v2'],
  { revalidate: 60, tags: ['services'] }
);

// ────────────────────────────────────────────────────────────────────────────
// Projects
// ────────────────────────────────────────────────────────────────────────────
async function docToProject(doc: DocRow): Promise<StudioProject> {
  const c = (doc.published_content ?? {}) as Record<string, unknown>;
  const stats = Array.isArray(c.stats)
    ? (c.stats as Array<{ label?: string; value?: string }>).map((s) => ({
        label: s?.label ?? '',
        value: s?.value ?? '',
      }))
    : [];
  const highlights = Array.isArray(c.highlights)
    ? (c.highlights as Array<{ text?: string } | string>).map((h) =>
        typeof h === 'string' ? h : (h?.text ?? '')
      )
    : [];
  return {
    id: doc.id,
    slug: (c.slug as string) ?? '',
    number: (c.number as string) ?? '',
    category: (c.category as string) ?? '',
    title: (c.title as string) ?? '',
    description: (c.description as string) ?? '',
    full_description: (c.full_description as string) ?? '',
    cover_image: await resolveImageUrl(c, 'cover_image', 'legacy_cover_image_url', { width: 1600 }),
    video_url: (c.video_url as string) || null,
    gallery_images: [],
    stats,
    highlights,
    is_published: true,
    sort_order: typeof c.sort_order === 'number' ? c.sort_order : 0,
    seo_title: (c.seo_title as string) || null,
    seo_description: (c.seo_description as string) || null,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

export const getPublishedProjects = unstable_cache(
  async (): Promise<StudioProject[]> => {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_documents')
      .select('id, published_content, published_at, created_at, updated_at')
      .eq('type', 'project')
      .is('deleted_at', null)
      .not('published_content', 'is', null)
      .limit(500);
    if (error) { console.error('[data-access] getPublishedProjects failed', error); return []; }
    const projects = await Promise.all(((data ?? []) as DocRow[]).map(docToProject));
    return projects.sort((a, b) => a.sort_order - b.sort_order);
  },
  ['published-projects-v2'],
  { revalidate: 60, tags: ['projects'] }
);

export const getProjectBySlug = unstable_cache(
  async (slug: string): Promise<StudioProject | null> => {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_documents')
      .select('id, published_content, published_at, created_at, updated_at')
      .eq('type', 'project')
      .is('deleted_at', null)
      .filter('published_content->>slug', 'eq', slug)
      .single();
    if (error && error.code !== 'PGRST116') { console.error('[data-access] getProjectBySlug failed', { slug, error }); }
    if (!data) return null;
    return docToProject(data as DocRow);
  },
  ['project-by-slug-v2'],
  { revalidate: 60, tags: ['projects'] }
);

// ────────────────────────────────────────────────────────────────────────────
// Articles — reads from studio_documents as of Phase 5.
// body_html preserved inside draft_content for the LegacyHtmlRenderer fallback.
// ────────────────────────────────────────────────────────────────────────────
async function docToArticle(doc: DocRow): Promise<StudioArticle> {
  const c = (doc.published_content ?? {}) as Record<string, unknown>;
  return {
    id: doc.id,
    slug: (c.slug as string) ?? '',
    title: (c.title as string) ?? '',
    excerpt: (c.excerpt as string) ?? '',
    body_html: (c.body_html as string) ?? '',
    cover_image: await resolveImageUrl(c, 'cover_image', 'legacy_cover_image_url', { width: 1600 }),
    author: (c.author as string) ?? '',
    category: (c.category as string) ?? '',
    published_at: (c.published_at as string) || doc.published_at || null,
    is_published: true,
    seo_title: null,
    seo_description: null,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

export const getPublishedArticles = unstable_cache(
  async (): Promise<StudioArticle[]> => {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_documents')
      .select('id, published_content, published_at, created_at, updated_at')
      .eq('type', 'article')
      .is('deleted_at', null)
      .not('published_content', 'is', null)
      .order('published_at', { ascending: false })
      .limit(500);
    if (error) { console.error('[data-access] getPublishedArticles failed', error); return []; }
    return Promise.all(((data ?? []) as DocRow[]).map(docToArticle));
  },
  ['published-articles-v2'],
  { revalidate: 60, tags: ['articles'] }
);

export const getArticleBySlug = unstable_cache(
  async (slug: string): Promise<StudioArticle | null> => {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_documents')
      .select('id, published_content, published_at, created_at, updated_at')
      .eq('type', 'article')
      .is('deleted_at', null)
      .filter('published_content->>slug', 'eq', slug)
      .single();
    if (error && error.code !== 'PGRST116') { console.error('[data-access] getArticleBySlug failed', { slug, error }); }
    if (!data) return null;
    return docToArticle(data as DocRow);
  },
  ['article-by-slug-v2'],
  { revalidate: 60, tags: ['articles'] }
);

// ────────────────────────────────────────────────────────────────────────────
// Testimonials
// ────────────────────────────────────────────────────────────────────────────
async function docToTestimonial(doc: DocRow): Promise<StudioTestimonial> {
  const c = (doc.published_content ?? {}) as Record<string, unknown>;
  return {
    id: doc.id,
    quote: (c.quote as string) ?? '',
    author: (c.author as string) ?? '',
    role: (c.role as string) ?? '',
    avatar_url: (await resolveImageUrl(c, 'avatar', 'legacy_avatar_url', { width: 200 })) || null,
    is_published: true,
    sort_order: typeof c.sort_order === 'number' ? c.sort_order : 0,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

export const getPublishedTestimonials = unstable_cache(
  async (): Promise<StudioTestimonial[]> => {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_documents')
      .select('id, published_content, published_at, created_at, updated_at')
      .eq('type', 'testimonial')
      .is('deleted_at', null)
      .not('published_content', 'is', null)
      .limit(500);
    if (error) { console.error('[data-access] getPublishedTestimonials failed', error); return []; }
    const rows = await Promise.all(((data ?? []) as DocRow[]).map(docToTestimonial));
    return rows.sort((a, b) => a.sort_order - b.sort_order);
  },
  ['published-testimonials-v2'],
  { revalidate: 60, tags: ['testimonials'] }
);

// ────────────────────────────────────────────────────────────────────────────
// FAQs
// ────────────────────────────────────────────────────────────────────────────
function docToFaq(doc: DocRow): StudioFaq {
  const c = (doc.published_content ?? {}) as Record<string, unknown>;
  return {
    id: doc.id,
    question: (c.question as string) ?? '',
    answer: (c.answer as string) ?? '',
    is_published: true,
    sort_order: typeof c.sort_order === 'number' ? c.sort_order : 0,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

export const getPublishedFaqs = unstable_cache(
  async (): Promise<StudioFaq[]> => {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_documents')
      .select('id, published_content, published_at, created_at, updated_at')
      .eq('type', 'faq')
      .is('deleted_at', null)
      .not('published_content', 'is', null)
      .limit(500);
    if (error) { console.error('[data-access] getPublishedFaqs failed', error); return []; }
    return ((data ?? []) as DocRow[]).map(docToFaq).sort((a, b) => a.sort_order - b.sort_order);
  },
  ['published-faqs-v2'],
  { revalidate: 60, tags: ['faqs'] }
);

// ────────────────────────────────────────────────────────────────────────────
// Team members
// ────────────────────────────────────────────────────────────────────────────
async function docToTeamMember(doc: DocRow): Promise<StudioTeamMember> {
  const c = (doc.published_content ?? {}) as Record<string, unknown>;
  const social: Record<string, string> = {};
  if (c.social_twitter)   social.twitter   = c.social_twitter as string;
  if (c.social_instagram) social.instagram = c.social_instagram as string;
  if (c.social_linkedin)  social.linkedin  = c.social_linkedin as string;
  if (c.social_website)   social.website   = c.social_website as string;

  return {
    id: doc.id,
    name: (c.name as string) ?? '',
    role: (c.role as string) ?? '',
    bio: (c.bio as string) || null,
    avatar_url: (await resolveImageUrl(c, 'avatar', 'legacy_avatar_url', { width: 400 })) || null,
    sort_order: typeof c.sort_order === 'number' ? c.sort_order : 0,
    is_published: true,
    social_links: social,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

export const getPublishedTeamMembers = unstable_cache(
  async (): Promise<StudioTeamMember[]> => {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_documents')
      .select('id, published_content, published_at, created_at, updated_at')
      .eq('type', 'teamMember')
      .is('deleted_at', null)
      .not('published_content', 'is', null)
      .limit(500);
    if (error) { console.error('[data-access] getPublishedTeamMembers failed', error); return []; }
    const rows = await Promise.all(((data ?? []) as DocRow[]).map(docToTeamMember));
    return rows.sort((a, b) => a.sort_order - b.sort_order);
  },
  ['published-team-members-v2'],
  { revalidate: 60 }
);

// ────────────────────────────────────────────────────────────────────────────
// Settings, SEO, Page sections — still reading from legacy tables
// ────────────────────────────────────────────────────────────────────────────
export const getSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb.from('studio_settings').select('key, value');
    if (error) { console.error('[data-access] getSettings failed', error); return {}; }
    const map: Record<string, string> = {};
    for (const row of data ?? []) {
      map[row.key] = typeof row.value === 'string' ? row.value : String(row.value ?? '');
    }
    return map;
  },
  ['settings'],
  { revalidate: 60, tags: ['settings'] }
);

export const getSeoForPage = unstable_cache(
  async (pageKey: string): Promise<StudioSeo | null> => {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_seo')
      .select('*')
      .eq('page_key', pageKey)
      .single();
    if (error && error.code !== 'PGRST116') { console.error('[data-access] getSeoForPage failed', { pageKey, error }); }
    return data;
  },
  ['seo'],
  { revalidate: 60, tags: ['seo'] }
);

export interface StudioPageSection {
  id: string;
  page_key: string;
  section_key: string;
  content: Record<string, unknown>;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const getPageSection = unstable_cache(
  async (pageKey: string, sectionKey: string): Promise<Record<string, unknown> | null> => {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_page_sections')
      .select('content')
      .eq('page_key', pageKey)
      .eq('section_key', sectionKey)
      .eq('is_published', true)
      .single();
    if (error && error.code !== 'PGRST116') { console.error('[data-access] getPageSection failed', { pageKey, sectionKey, error }); }
    return data?.content ?? null;
  },
  ['page-section'],
  { revalidate: 60, tags: ['page-sections'] }
);

export const getPageSections = unstable_cache(
  async (pageKey: string): Promise<Record<string, Record<string, unknown>>> => {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_page_sections')
      .select('section_key, content')
      .eq('page_key', pageKey)
      .eq('is_published', true)
      .order('sort_order');
    if (error) { console.error('[data-access] getPageSections failed', { pageKey, error }); return {}; }
    const map: Record<string, Record<string, unknown>> = {};
    for (const row of data ?? []) {
      map[row.section_key] = row.content;
    }
    return map;
  },
  ['page-sections'],
  { revalidate: 60, tags: ['page-sections'] }
);
