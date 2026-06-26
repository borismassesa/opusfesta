import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

export type InvitationsFeatureVisual = 'invitations' | 'phone' | 'envelope'

export type InvitationsFeatureCard = {
  id: string
  title: string
  body: string
  cta_label: string
  cta_href: string
  /** Uploaded image — overrides the visual when set. */
  image_url?: string
  visual: InvitationsFeatureVisual
}

export type InvitationsFeaturesContent = {
  heading: string
  subheading?: string
  cards: InvitationsFeatureCard[]
}

export const INVITATIONS_FEATURES_FALLBACK: InvitationsFeaturesContent = {
  heading: 'Wedding stationery made easy, from invite to seat',
  subheading: 'From invite to seating, beautifully organized. Track confirmations, plus-ones, and special-guest notes in one live dashboard.',
  cards: [
    { id: 'guest-list', title: 'Free guest list, free RSVPs', body: 'Track every yes, every plus-one, every dietary need. Free with every OpusFesta wedding.', cta_label: 'Open my guest list', cta_href: '/my/guests', visual: 'invitations' },
    { id: 'matching-website', title: 'Free matching website', body: 'Pick an invitation, get a wedding website to match — bilingual RSVP form built in, ready to share.', cta_label: 'Find your match', cta_href: '/my/planning', visual: 'phone' },
    { id: 'guest-addressing', title: 'Easy guest addressing', body: 'Save addresses against names. We pull them onto envelopes when you order — handwritten or printed.', cta_label: 'Get started', cta_href: '/my/guests', visual: 'envelope' },
  ],
}

// Stored shape: translatable fields (heading, and each card's title/body/
// cta_label) may be a localized { en, sw } object or a legacy plain string;
// non-text fields (cta_href, image_url, visual) are scalar. The loader resolves
// each translatable field for `locale` and returns the flat
// InvitationsFeaturesContent the render components already expect.
type StoredFeatureCard = {
  id?: string
  title?: MaybeLocalized
  body?: MaybeLocalized
  cta_label?: MaybeLocalized
  cta_href?: string
  image_url?: string
  visual?: InvitationsFeatureVisual
}

type StoredFeaturesContent = {
  heading?: MaybeLocalized
  subheading?: MaybeLocalized
  cards?: StoredFeatureCard[]
}

export async function loadInvitationsFeaturesContent(
  locale: Locale = DEFAULT_LOCALE
): Promise<InvitationsFeaturesContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return INVITATIONS_FEATURES_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-invitations')
      .eq('section_key', 'features')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | StoredFeaturesContent
      | undefined
    if (stored) {
      const F = INVITATIONS_FEATURES_FALLBACK
      return {
        heading: resolveLocalized(stored.heading ?? F.heading, locale),
        subheading: stored.subheading
          ? resolveLocalized(stored.subheading, locale)
          : F.subheading,
        cards:
          stored.cards && Array.isArray(stored.cards) && stored.cards.length > 0
            ? stored.cards.map((c, i) => ({
                id: c.id ?? `card-${i}`,
                title: resolveLocalized(c.title, locale),
                body: resolveLocalized(c.body, locale),
                cta_label: resolveLocalized(c.cta_label, locale),
                cta_href: c.cta_href ?? '',
                image_url: c.image_url,
                visual: c.visual ?? 'invitations',
              }))
            : F.cards,
      }
    }
    return INVITATIONS_FEATURES_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] invitations-features load failed', err)
    return INVITATIONS_FEATURES_FALLBACK
  }
}
