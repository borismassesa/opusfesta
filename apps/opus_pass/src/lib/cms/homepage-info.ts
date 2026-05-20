import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type HomepageInfoParagraph = {
  id: string
  heading: string
  body: string
}

export type HomepageInfoContent = {
  title: string
  lead: string
  paragraphs: HomepageInfoParagraph[]
  closing_heading: string
  cta_label: string
  cta_href: string
}

export const HOMEPAGE_INFO_FALLBACK: HomepageInfoContent = {
  title: 'About OpusPass',
  lead: 'Invites, guests and your wedding website — all in one beautifully simple place, designed for couples in Tanzania.',
  paragraphs: [
    {
      id: 'what',
      heading: 'What OpusPass is',
      body: 'OpusPass replaces the printed invitation and the spreadsheet RSVP tracker. Pick a design, send it to your guests by WhatsApp or SMS, and let them tap to confirm — no apps to install, no awkward calls.',
    },
    {
      id: 'how',
      heading: 'How it fits together',
      body: "Your invitation, guest list, RSVPs, and wedding website all sync automatically. Update a date or venue once and every guest sees it instantly. Want paper invites too? Add a premium print run any time — it's optional, not the default.",
    },
    {
      id: 'why',
      heading: 'Why couples choose OpusPass',
      body: 'Designed for East African weddings: Swahili and English templates, local mobile money for premium add-ons, and templates for kitchen parties, send-offs, and kadi za michango — moments other tools forget.',
    },
  ],
  closing_heading: 'Ready when you are.',
  cta_label: 'Get started',
  cta_href: '/sign-up',
}

export async function loadHomepageInfoContent(): Promise<HomepageInfoContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return HOMEPAGE_INFO_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-homepage')
      .eq('section_key', 'info')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<HomepageInfoContent>
      | undefined
    if (stored) {
      return {
        title: stored.title ?? HOMEPAGE_INFO_FALLBACK.title,
        lead: stored.lead ?? HOMEPAGE_INFO_FALLBACK.lead,
        paragraphs:
          stored.paragraphs && Array.isArray(stored.paragraphs) && stored.paragraphs.length > 0
            ? stored.paragraphs
            : HOMEPAGE_INFO_FALLBACK.paragraphs,
        closing_heading: stored.closing_heading ?? HOMEPAGE_INFO_FALLBACK.closing_heading,
        cta_label: stored.cta_label ?? HOMEPAGE_INFO_FALLBACK.cta_label,
        cta_href: stored.cta_href ?? HOMEPAGE_INFO_FALLBACK.cta_href,
      }
    }
    return HOMEPAGE_INFO_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] homepage-info load failed', err)
    return HOMEPAGE_INFO_FALLBACK
  }
}
