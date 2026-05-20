import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type InvitationsFreeWebsitePromoContent = {
  eyebrow: string
  heading: string
  body: string
  cta_label: string
  cta_href: string
  image_url: string
  image_alt: string
  background_color: string
}

export const INVITATIONS_FREE_WEBSITE_PROMO_FALLBACK: InvitationsFreeWebsitePromoContent = {
  eyebrow: 'Included with every order',
  heading: 'Get a free wedding website',
  body:
    'Pick any invitation and we’ll match it to a bilingual wedding website with a built-in RSVP form, address book, and guest list.',
  cta_label: 'Find your match',
  cta_href: '/my/planning',
  image_url: '',
  image_alt: '',
  background_color: '#F5EFE3',
}

export async function loadInvitationsFreeWebsitePromoContent(): Promise<InvitationsFreeWebsitePromoContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return INVITATIONS_FREE_WEBSITE_PROMO_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-invitations')
      .eq('section_key', 'free-website-promo')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<InvitationsFreeWebsitePromoContent>
      | undefined
    if (stored) {
      return { ...INVITATIONS_FREE_WEBSITE_PROMO_FALLBACK, ...stored }
    }
    return INVITATIONS_FREE_WEBSITE_PROMO_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] invitations-free-website-promo load failed', err)
    return INVITATIONS_FREE_WEBSITE_PROMO_FALLBACK
  }
}
