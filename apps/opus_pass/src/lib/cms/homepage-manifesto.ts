import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

// The manifesto is one typographic sentence with brand media interleaved at
// fixed points. The OpusFesta logo mark stays fixed in the component; the text
// segments, the inline "RSVP" pill label, and the three inline images are CMS.
export type HomepageManifestoContent = {
  segment_1: string
  pill_label: string
  segment_2: string
  invite_image_url: string
  segment_3: string
  guest_image_url: string
  segment_4: string
  place_image_url: string
  segment_5: string
}

export const HOMEPAGE_MANIFESTO_FALLBACK: HomepageManifestoContent = {
  segment_1: 'OpusPass brings your invites,',
  pill_label: 'RSVP',
  segment_2: 'guest list and wedding website into one beautifully simple place. Send a',
  // Inline images intentionally left empty — the manifesto reads as clean text.
  // The admin can re-add them per-slot via the CMS editor (InlineThumb hides any
  // empty slot).
  invite_image_url: '',
  segment_3: 'design by WhatsApp or SMS, let guests',
  guest_image_url: '',
  segment_4: 'tap to confirm — designed for couples in',
  place_image_url: '',
  segment_5: 'Tanzania.',
}

// Stored shape: translatable fields may be a localized { en, sw } object or a
// legacy plain string; image URLs are scalar. The loader resolves each
// translatable field for `locale` and returns the flat HomepageManifestoContent
// the render component already expects — so no public component changes.
type StoredHomepageManifesto = {
  segment_1?: MaybeLocalized
  pill_label?: MaybeLocalized
  segment_2?: MaybeLocalized
  segment_3?: MaybeLocalized
  segment_4?: MaybeLocalized
  segment_5?: MaybeLocalized
  invite_image_url?: string
  guest_image_url?: string
  place_image_url?: string
}

export async function loadHomepageManifestoContent(
  locale: Locale = DEFAULT_LOCALE
): Promise<HomepageManifestoContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return HOMEPAGE_MANIFESTO_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-homepage')
      .eq('section_key', 'manifesto')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | StoredHomepageManifesto
      | undefined
    if (stored) {
      const F = HOMEPAGE_MANIFESTO_FALLBACK
      return {
        segment_1: resolveLocalized(stored.segment_1 ?? F.segment_1, locale),
        pill_label: resolveLocalized(stored.pill_label ?? F.pill_label, locale),
        segment_2: resolveLocalized(stored.segment_2 ?? F.segment_2, locale),
        invite_image_url: stored.invite_image_url ?? F.invite_image_url,
        segment_3: resolveLocalized(stored.segment_3 ?? F.segment_3, locale),
        guest_image_url: stored.guest_image_url ?? F.guest_image_url,
        segment_4: resolveLocalized(stored.segment_4 ?? F.segment_4, locale),
        place_image_url: stored.place_image_url ?? F.place_image_url,
        segment_5: resolveLocalized(stored.segment_5 ?? F.segment_5, locale),
      }
    }
    return HOMEPAGE_MANIFESTO_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] homepage-manifesto load failed', err)
    return HOMEPAGE_MANIFESTO_FALLBACK
  }
}
