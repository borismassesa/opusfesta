import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type InvitationsFeaturedSuiteContent = {
  image_url: string
  headline_line_1: string
  headline_line_2: string
  body: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  trust_strip: string[]
}

export const INVITATIONS_FEATURED_SUITE_FALLBACK: InvitationsFeaturedSuiteContent = {
  image_url: '/assets/images/couples_together.jpg',
  headline_line_1: 'From Save the Date',
  headline_line_2: 'to Thank You',
  body:
    'Customise the designs with your names, date, and colours. Send to every guest in seconds by WhatsApp or SMS, and watch RSVPs land in real time. Optional paper prints for elders & VIPs.',
  primary_cta_label: 'Start designing',
  primary_cta_href: '/invitations/catalog',
  secondary_cta_label: 'See how it works',
  secondary_cta_href: '/invitations/catalog',
  trust_strip: ['Share via WhatsApp & SMS', 'Live RSVP tracking', 'Pay with M-Pesa or Airtel'],
}

export async function loadInvitationsFeaturedSuiteContent(): Promise<InvitationsFeaturedSuiteContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return INVITATIONS_FEATURED_SUITE_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-invitations')
      .eq('section_key', 'featured-suite')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<InvitationsFeaturedSuiteContent>
      | undefined
    if (stored) {
      return {
        ...INVITATIONS_FEATURED_SUITE_FALLBACK,
        ...stored,
        trust_strip:
          stored.trust_strip && Array.isArray(stored.trust_strip) && stored.trust_strip.length > 0
            ? stored.trust_strip
            : INVITATIONS_FEATURED_SUITE_FALLBACK.trust_strip,
      }
    }
    return INVITATIONS_FEATURED_SUITE_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] invitations-featured-suite load failed', err)
    return INVITATIONS_FEATURED_SUITE_FALLBACK
  }
}
