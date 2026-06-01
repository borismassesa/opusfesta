import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type HomepageWhyOpusPassContent = {
  headline: string
  main_image_url: string
  main_image_alt: string
  chip_image_url: string
  chip_title: string
  chip_subtitle: string
  floating_cta_label: string
  floating_cta_href: string
  subheadline: string
  body: string
  primary_button_label: string
  primary_button_href: string
  secondary_button_label: string
  secondary_button_href: string
}

export const HOMEPAGE_WHY_OPUS_PASS_FALLBACK: HomepageWhyOpusPassContent = {
  headline:
    'The #1 reason couples choose OpusPass is to plan their whole wedding in one place',
  main_image_url: '/assets/images/cutesy_couple.jpg',
  main_image_alt: 'A couple planning their wedding',
  chip_image_url: '/assets/images/flowers_pinky.jpg',
  chip_title: 'Save the Date',
  chip_subtitle: 'Wedding invite',
  floating_cta_label: 'Get started',
  floating_cta_href: '/sign-up',
  subheadline: 'Planning that actually feels effortless',
  body:
    'Couples tell us everything just flows — invitations, live RSVPs, your guest list and a free wedding website all talk to each other, so nothing slips through the cracks. Spend less time on admin, and more time celebrating.',
  primary_button_label: 'How it works',
  primary_button_href: '/guests-and-rsvp',
  secondary_button_label: 'Browse designs',
  secondary_button_href: '/invitations',
}

export async function loadHomepageWhyOpusPassContent(): Promise<HomepageWhyOpusPassContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return HOMEPAGE_WHY_OPUS_PASS_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-homepage')
      .eq('section_key', 'why-opus-pass')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<HomepageWhyOpusPassContent>
      | undefined
    if (stored) {
      return { ...HOMEPAGE_WHY_OPUS_PASS_FALLBACK, ...stored }
    }
    return HOMEPAGE_WHY_OPUS_PASS_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] homepage-why-opus-pass load failed', err)
    return HOMEPAGE_WHY_OPUS_PASS_FALLBACK
  }
}
