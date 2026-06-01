import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

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

export async function loadGuestsFeaturesContent(): Promise<GuestsFeaturesContent> {
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
      | Partial<GuestsFeaturesContent>
      | undefined
    if (stored) {
      return {
        heading: stored.heading ?? GUESTS_FEATURES_FALLBACK.heading,
        description: stored.description ?? GUESTS_FEATURES_FALLBACK.description,
        cards:
          stored.cards && Array.isArray(stored.cards) && stored.cards.length > 0
            ? stored.cards
            : GUESTS_FEATURES_FALLBACK.cards,
      }
    }
    return GUESTS_FEATURES_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] guests-features load failed', err)
    return GUESTS_FEATURES_FALLBACK
  }
}
