import type { SupabaseClient } from '@supabase/supabase-js';
import { WEDDING_SECTIONS } from '@/constants/wedding-sections';
import type { WebsiteTheme } from '@/types/wedding-website';

export async function getMyWeddingWebsite(client: SupabaseClient) {
  const { data, error } = await client
    .from('wedding_websites')
    .select('*, wedding_website_sections(*)')
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createWeddingWebsite(
  client: SupabaseClient,
  opts: { slug: string; theme: WebsiteTheme; userId: string; coupleProfileId?: string },
) {
  const themeConfig = {
    garden: { primary_color: '#2D5E3A', accent_color: '#C4920A', font_family: 'cormorant' },
    classic: { primary_color: '#1A1A2E', accent_color: '#C4920A', font_family: 'playfair' },
    modern: { primary_color: '#5B2D8E', accent_color: '#FF6B6B', font_family: 'montserrat' },
  }[opts.theme];

  // Create website
  const { data: website, error: wsError } = await client
    .from('wedding_websites')
    .insert({
      user_id: opts.userId,
      couple_profile_id: opts.coupleProfileId ?? null,
      slug: opts.slug,
      theme: opts.theme,
      ...themeConfig,
    })
    .select()
    .single();

  if (wsError) throw wsError;

  // Seed all default sections
  const sections = WEDDING_SECTIONS.map((s) => ({
    website_id: website.id,
    section_key: s.key,
    content: s.defaultContent,
    is_published: s.defaultPublished,
    sort_order: s.defaultSortOrder,
  }));

  const { error: secError } = await client
    .from('wedding_website_sections')
    .insert(sections);

  if (secError) throw secError;

  return website;
}

export async function updateWeddingWebsite(
  client: SupabaseClient,
  websiteId: string,
  updates: Record<string, any>,
) {
  const { data, error } = await client
    .from('wedding_websites')
    .update(updates)
    .eq('id', websiteId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSection(
  client: SupabaseClient,
  sectionId: string,
  updates: { content?: Record<string, any>; is_published?: boolean; sort_order?: number },
) {
  const { data, error } = await client
    .from('wedding_website_sections')
    .update(updates)
    .eq('id', sectionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function reorderSections(
  client: SupabaseClient,
  websiteId: string,
  orderedKeys: string[],
) {
  const updates = orderedKeys.map((key, i) => ({
    website_id: websiteId,
    section_key: key,
    sort_order: i,
  }));

  for (const u of updates) {
    await client
      .from('wedding_website_sections')
      .update({ sort_order: u.sort_order })
      .eq('website_id', u.website_id)
      .eq('section_key', u.section_key);
  }
}

export async function getRsvps(client: SupabaseClient, websiteId: string) {
  const { data, error } = await client
    .from('wedding_rsvps')
    .select('*')
    .eq('website_id', websiteId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getGuestbook(client: SupabaseClient, websiteId: string) {
  const { data, error } = await client
    .from('wedding_guestbook_entries')
    .select('*')
    .eq('website_id', websiteId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function approveGuestbookEntry(
  client: SupabaseClient,
  entryId: string,
  approved: boolean,
) {
  const { error } = await client
    .from('wedding_guestbook_entries')
    .update({ is_approved: approved })
    .eq('id', entryId);

  if (error) throw error;
}

export function generateSlug(partner1: string, partner2?: string): string {
  const parts = [partner1, partner2].filter(Boolean).join('-and-');
  return parts
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
