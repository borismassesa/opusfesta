import type { SupabaseClient } from '@supabase/supabase-js';
import {
  WEBSITE_DEFAULT_PAGES,
  WEBSITE_PLACEHOLDER_SECTIONS,
  WEBSITE_PRESETS,
  type BuilderMeta,
  type SiteDoc,
  type WebsitePresetId,
} from '@/types/site-doc';
import type { GuestbookEntry } from '@/types/wedding-website';
import { coupleSlugBase, reserveUniqueSlug } from '@/lib/wedding-website/slug';
import { getMyUserId } from '@/lib/api/currentUser';

export type WebsiteRow = {
  website_doc: SiteDoc | null;
  website_published_at: string | null;
  public_slug: string | null;
  public_sharing_enabled: boolean | null;
};

export async function getMyWebsiteDoc(client: SupabaseClient): Promise<WebsiteRow | null> {
  const { data, error } = await client
    .from('couple_profiles')
    .select('website_doc, website_published_at, public_slug, public_sharing_enabled')
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Builds the initial SiteDoc for "create website". No DB round-trip needed
 *  to create — the couple's couple_profiles row already exists from
 *  onboarding, so this is always followed by an UPDATE, never an insert. */
export function buildDefaultSiteDoc(
  partnerA: string,
  partnerB: string,
  presetId: WebsitePresetId,
  welcome = "We're getting married!",
): SiteDoc {
  const preset = WEBSITE_PRESETS[presetId];
  const meta: BuilderMeta = {
    partnerA,
    partnerB,
    date: '',
    location: '',
    welcome,
    presetId,
    layoutId: preset.defaultLayoutId,
    photos: [],
    animationStyle: 'none',
    transition: 'rise',
    fontEffect: 'none',
    pages: WEBSITE_DEFAULT_PAGES.map((p) => ({ ...p })),
    slug: '',
    visibility: 'published',
    announcement: false,
    password: false,
    searchVisible: true,
  };

  return {
    title: [partnerA, partnerB].filter(Boolean).join(' & '),
    nav: [],
    theme: {
      palette: preset.palette,
      headingFont: preset.headingFont,
      bodyFont: preset.bodyFont,
      decor: preset.decor,
    },
    sections: WEBSITE_PLACEHOLDER_SECTIONS,
    meta,
  };
}

export async function saveWebsiteMeta(
  client: SupabaseClient,
  doc: SiteDoc,
  metaPatch: Partial<BuilderMeta>,
): Promise<SiteDoc> {
  const nextDoc: SiteDoc = { ...doc, meta: { ...doc.meta, ...metaPatch } };
  const userId = await getMyUserId(client);
  const { error } = await client
    .from('couple_profiles')
    .update({ website_doc: nextDoc, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) throw error;
  return nextDoc;
}

/** Publishes the site: reserves/reuses public_slug, flips public_sharing_enabled
 *  and stamps website_published_at — all four fields in one atomic UPDATE,
 *  since getPublishedWebsite() on the read side requires them all truthy at
 *  once. Mirrors apps/opus_pass/src/lib/dashboard/actions.ts's
 *  enablePublicSharing() + apps/opus_pass/src/app/website-builder/actions.ts's
 *  publishWebsite(), but additionally retries on a 23505 slug collision
 *  rather than trusting the probe loop alone. */
export async function publishWebsite(client: SupabaseClient, doc: SiteDoc): Promise<{ slug: string; doc: SiteDoc }> {
  const userId = await getMyUserId(client);
  const { data: profile, error: profileError } = await client
    .from('couple_profiles')
    .select('partner1_name, partner2_name, public_slug')
    .maybeSingle();
  if (profileError) throw profileError;

  const base = coupleSlugBase(profile?.partner1_name ?? null, profile?.partner2_name ?? null);
  let slug = profile?.public_slug ?? (await reserveUniqueSlug(client, base));
  const now = new Date().toISOString();

  for (let attempt = 0; attempt < 5; attempt++) {
    const nextDoc: SiteDoc = { ...doc, meta: { ...doc.meta, slug } };
    const { error } = await client
      .from('couple_profiles')
      .update({
        website_doc: nextDoc,
        public_slug: slug,
        public_sharing_enabled: true,
        website_published_at: now,
        updated_at: now,
      })
      .eq('user_id', userId);
    if (!error) return { slug, doc: nextDoc };
    if (error.code !== '23505') throw error;
    slug = await reserveUniqueSlug(client, base);
  }

  throw new Error('Could not reserve a unique website slug after multiple attempts.');
}

/** Soft-unpublish (host-revocable kill switch) — keeps website_doc intact,
 *  matching apps/opus_pass/src/app/website-builder/actions.ts's unpublishWebsite(). */
export async function unpublishWebsite(client: SupabaseClient): Promise<void> {
  const userId = await getMyUserId(client);
  const { error } = await client
    .from('couple_profiles')
    .update({ website_published_at: null, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) throw error;
}

// ── Guestbook (mock/hardcoded — no live backend exists on either app yet) ──

let mockGuestbookEntries: GuestbookEntry[] = [
  {
    id: 'mock-1',
    website_id: 'mock',
    guest_name: 'Amina H.',
    message: "So happy for you two! Can't wait to celebrate with you.",
    is_approved: true,
    created_at: '2026-06-01T09:00:00.000Z',
  },
  {
    id: 'mock-2',
    website_id: 'mock',
    guest_name: 'Juma K.',
    message: 'Wishing you a lifetime of love and laughter!',
    is_approved: false,
    created_at: '2026-06-03T14:30:00.000Z',
  },
];

export async function getGuestbook(): Promise<GuestbookEntry[]> {
  return mockGuestbookEntries;
}

export async function approveGuestbookEntry(entryId: string, approved: boolean): Promise<void> {
  mockGuestbookEntries = mockGuestbookEntries.map((entry) =>
    entry.id === entryId ? { ...entry, is_approved: approved } : entry,
  );
}
