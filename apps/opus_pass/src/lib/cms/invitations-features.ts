import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

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
  cards: InvitationsFeatureCard[]
}

export const INVITATIONS_FEATURES_FALLBACK: InvitationsFeaturesContent = {
  heading: 'Wedding stationery made easy, from invite to seat',
  cards: [
    { id: 'guest-list', title: 'Free guest list, free RSVPs', body: 'Track every yes, every plus-one, every dietary need. Free with every OpusFesta wedding.', cta_label: 'Open my guest list', cta_href: '/my/guests', visual: 'invitations' },
    { id: 'matching-website', title: 'Free matching website', body: 'Pick an invitation, get a wedding website to match — bilingual RSVP form built in, ready to share.', cta_label: 'Find your match', cta_href: '/my/planning', visual: 'phone' },
    { id: 'guest-addressing', title: 'Easy guest addressing', body: 'Save addresses against names. We pull them onto envelopes when you order — handwritten or printed.', cta_label: 'Get started', cta_href: '/my/guests', visual: 'envelope' },
  ],
}

export async function loadInvitationsFeaturesContent(): Promise<InvitationsFeaturesContent> {
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
      | Partial<InvitationsFeaturesContent>
      | undefined
    if (stored) {
      return {
        heading: stored.heading ?? INVITATIONS_FEATURES_FALLBACK.heading,
        cards:
          stored.cards && Array.isArray(stored.cards) && stored.cards.length > 0
            ? stored.cards
            : INVITATIONS_FEATURES_FALLBACK.cards,
      }
    }
    return INVITATIONS_FEATURES_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] invitations-features load failed', err)
    return INVITATIONS_FEATURES_FALLBACK
  }
}
