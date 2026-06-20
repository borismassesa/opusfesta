import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

// The Guests "features" section is the animated bento grid. Its data-viz widgets
// (RSVP bars, pledge marquee, charts) are fixed illustration; only the section
// header and the three text feature cards (RSVPs / Events / Pledges) are CMS copy.
export type GuestsFeatureCard = {
  id: string
  title: string
  description: string
  cta_label: string
  cta_href: string
}

export type GuestsFeaturesContent = {
  heading: string
  description: string
  cards: GuestsFeatureCard[]
}

export const GUESTS_FEATURES_FALLBACK: GuestsFeaturesContent = {
  heading: 'Everything your guests need, in one place',
  description:
    'From digital invites and live RSVPs to events, seating and pledges. Every guest detail of your big day, managed in one beautiful dashboard.',
  cards: [
    {
      id: 'rsvps',
      title: 'RSVPs',
      description:
        'See how your guests are replying: attending, maybe and declined, and who still needs a gentle reminder, all at a glance.',
      cta_label: 'Track RSVPs',
      cta_href: '/my/dashboard/rsvps',
    },
    {
      id: 'events',
      title: 'Events',
      description:
        'Create every event on your big day: ceremony, reception, send-off and more, each with its own details and guests.',
      cta_label: 'Manage events',
      cta_href: '/my/dashboard/events',
    },
    {
      id: 'pledges',
      title: 'Pledges',
      description:
        'See who’s pledged, how much and when. One clear ledger of every contribution promised toward your big day.',
      cta_label: 'View pledges',
      cta_href: '/my/dashboard/guests',
    },
  ],
}

// Stored shape: translatable fields may be a localized { en, sw } object or a
// legacy plain string; `id` and `cta_href` stay scalar. The loader resolves each
// translatable field for `locale` and returns the flat GuestsFeaturesContent the
// render components already expect — so no public component changes.
type StoredGuestsFeatureCard = {
  id?: string
  title?: MaybeLocalized
  description?: MaybeLocalized
  cta_label?: MaybeLocalized
  cta_href?: string
}

type StoredGuestsFeatures = {
  heading?: MaybeLocalized
  description?: MaybeLocalized
  cards?: StoredGuestsFeatureCard[]
}

export async function loadGuestsFeaturesContent(
  locale: Locale = DEFAULT_LOCALE
): Promise<GuestsFeaturesContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return GUESTS_FEATURES_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-guests')
      .eq('section_key', 'features')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | StoredGuestsFeatures
      | undefined
    if (stored) {
      const F = GUESTS_FEATURES_FALLBACK
      return {
        heading: resolveLocalized(stored.heading ?? F.heading, locale),
        description: resolveLocalized(stored.description ?? F.description, locale),
        cards:
          stored.cards && Array.isArray(stored.cards) && stored.cards.length > 0
            ? stored.cards.map((card, i) => ({
                id: card.id ?? F.cards[i]?.id ?? `card-${i}`,
                title: resolveLocalized(card.title, locale),
                description: resolveLocalized(card.description, locale),
                cta_label: resolveLocalized(card.cta_label, locale),
                cta_href: card.cta_href ?? '',
              }))
            : F.cards,
      }
    }
    return GUESTS_FEATURES_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] guests-features load failed', err)
    return GUESTS_FEATURES_FALLBACK
  }
}
