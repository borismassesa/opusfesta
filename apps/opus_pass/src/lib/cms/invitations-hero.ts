import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type InvitationsHeroContent = {
  headline_line_1: string
  headline_line_2: string
  description: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  background_color: string
  /** When set, replaces the built-in flat-lay arrangement on the right. */
  right_image_url: string
  right_image_alt: string
}

export const INVITATIONS_HERO_FALLBACK: InvitationsHeroContent = {
  headline_line_1: 'Invites worth saving.',
  headline_line_2: 'RSVPs worth tracking.',
  description:
    "Designer-worthy digital invitations that won't break your budget. Premium, personalised designs for every wedding moment, customisable in Swahili and English. FREE matching website with bilingual RSVP page included.",
  primary_cta_label: 'Browse all designs',
  primary_cta_href: '/invitations/catalog',
  secondary_cta_label: 'See pricing',
  secondary_cta_href: '/invitations/catalog',
  background_color: '#FAE6E9',
  right_image_url: '',
  right_image_alt: '',
}

export async function loadInvitationsHeroContent(): Promise<InvitationsHeroContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return INVITATIONS_HERO_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-invitations')
      .eq('section_key', 'hero')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<InvitationsHeroContent>
      | undefined
    if (stored) {
      return { ...INVITATIONS_HERO_FALLBACK, ...stored }
    }
    return INVITATIONS_HERO_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] invitations-hero load failed', err)
    return INVITATIONS_HERO_FALLBACK
  }
}
