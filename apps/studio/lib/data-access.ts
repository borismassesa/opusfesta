import { unstable_cache } from 'next/cache';
import { getStudioSupabaseAdmin } from './supabase-admin';
import type {
  StudioService,
  StudioProject,
  StudioArticle,
  StudioTestimonial,
  StudioFaq,
  StudioSeo,
  StudioTeamMember,
} from './studio-types';

// ─── Services ────────────────────────────────────────────────────
export const getPublishedServices = unstable_cache(
  async (): Promise<StudioService[]> => {
    const sb = getStudioSupabaseAdmin();
    const { data } = await sb
      .from('studio_services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    return data ?? [];
  },
  ['published-services'],
  { revalidate: 60, tags: ['services'] }
);

// ─── Projects ────────────────────────────────────────────────────
export const getPublishedProjects = unstable_cache(
  async (): Promise<StudioProject[]> => {
    const sb = getStudioSupabaseAdmin();
    const { data } = await sb
      .from('studio_projects')
      .select('*')
      .eq('is_published', true)
      .order('sort_order');
    return data ?? [];
  },
  ['published-projects'],
  { revalidate: 60, tags: ['projects'] }
);

export const getProjectBySlug = unstable_cache(
  async (slug: string): Promise<StudioProject | null> => {
    const sb = getStudioSupabaseAdmin();
    const { data } = await sb
      .from('studio_projects')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    return data;
  },
  ['project-by-slug'],
  { revalidate: 60, tags: ['projects'] }
);

// ─── Articles ────────────────────────────────────────────────────
export const getPublishedArticles = unstable_cache(
  async (): Promise<StudioArticle[]> => {
    const sb = getStudioSupabaseAdmin();
    const { data } = await sb
      .from('studio_articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    return data ?? [];
  },
  ['published-articles'],
  { revalidate: 60, tags: ['articles'] }
);

export const getArticleBySlug = unstable_cache(
  async (slug: string): Promise<StudioArticle | null> => {
    const sb = getStudioSupabaseAdmin();
    const { data } = await sb
      .from('studio_articles')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    return data;
  },
  ['article-by-slug'],
  { revalidate: 60, tags: ['articles'] }
);

// ─── Testimonials ────────────────────────────────────────────────
export const getPublishedTestimonials = unstable_cache(
  async (): Promise<StudioTestimonial[]> => {
    const sb = getStudioSupabaseAdmin();
    const { data } = await sb
      .from('studio_testimonials')
      .select('*')
      .eq('is_published', true)
      .order('sort_order');
    return data ?? [];
  },
  ['published-testimonials'],
  { revalidate: 60, tags: ['testimonials'] }
);

// ─── FAQs ────────────────────────────────────────────────────────
export const getPublishedFaqs = unstable_cache(
  async (): Promise<StudioFaq[]> => {
    const sb = getStudioSupabaseAdmin();
    const { data } = await sb
      .from('studio_faqs')
      .select('*')
      .eq('is_published', true)
      .order('sort_order');
    return data ?? [];
  },
  ['published-faqs'],
  { revalidate: 60, tags: ['faqs'] }
);

// ─── Team Members ───────────────────────────────────────────────
export const getPublishedTeamMembers = unstable_cache(
  async (): Promise<StudioTeamMember[]> => {
    const sb = getStudioSupabaseAdmin();
    const { data } = await sb
      .from('studio_team_members')
      .select('*')
      .eq('is_published', true)
      .order('sort_order');
    return data ?? [];
  },
  ['published-team-members'],
  { revalidate: 60 }
);

// ─── Settings ────────────────────────────────────────────────────
export const getSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const sb = getStudioSupabaseAdmin();
    const { data } = await sb.from('studio_settings').select('key, value');
    const map: Record<string, string> = {};
    for (const row of data ?? []) {
      map[row.key] = typeof row.value === 'string' ? row.value : String(row.value ?? '');
    }
    return map;
  },
  ['settings'],
  { revalidate: 60, tags: ['settings'] }
);

// ─── SEO ─────────────────────────────────────────────────────────
export const getSeoForPage = unstable_cache(
  async (pageKey: string): Promise<StudioSeo | null> => {
    const sb = getStudioSupabaseAdmin();
    const { data } = await sb
      .from('studio_seo')
      .select('*')
      .eq('page_key', pageKey)
      .single();
    return data;
  },
  ['seo'],
  { revalidate: 60, tags: ['seo'] }
);

// ─── Page Sections ───────────────────────────────────────────────
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
    const { data } = await sb
      .from('studio_page_sections')
      .select('content')
      .eq('page_key', pageKey)
      .eq('section_key', sectionKey)
      .eq('is_published', true)
      .single();
    return data?.content ?? null;
  },
  ['page-section'],
  { revalidate: 60, tags: ['page-sections'] }
);

export const getPageSections = unstable_cache(
  async (pageKey: string): Promise<Record<string, Record<string, unknown>>> => {
    const sb = getStudioSupabaseAdmin();
    const { data } = await sb
      .from('studio_page_sections')
      .select('section_key, content')
      .eq('page_key', pageKey)
      .eq('is_published', true)
      .order('sort_order');
    const map: Record<string, Record<string, unknown>> = {};
    for (const row of data ?? []) {
      map[row.section_key] = row.content;
    }
    return map;
  },
  ['page-sections'],
  { revalidate: 60, tags: ['page-sections'] }
);
