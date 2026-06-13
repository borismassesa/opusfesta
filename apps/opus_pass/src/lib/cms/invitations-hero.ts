import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

/** One circular "wedding moment" chip in the morph-hero suite strip. */
export type InvitationsHeroSuiteCategory = {
  id: string
  label: string
  /** Screen-reader alt text for the chip image. */
  alt: string
  /** Image URL — an uploaded asset URL or a local `/assets/...` path. */
  image: string
}

export type InvitationsHeroContent = {
  /** Lead line shown over the morphing card ring before it hands off. */
  intro_headline: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  /** Heading for the suite strip revealed once the cards settle. */
  suite_heading: string
  suite_body: string
  suite_categories: InvitationsHeroSuiteCategory[]
}

export const INVITATIONS_HERO_FALLBACK: InvitationsHeroContent = {
  intro_headline: 'Invitations for every celebration.',
  primary_cta_label: 'Browse designs',
  primary_cta_href: '/invitations/catalog',
  secondary_cta_label: 'Get started free',
  secondary_cta_href: '/sign-up',
  suite_heading: 'Invitations for Every Moment',
  suite_body:
    'Pick one design once, and every card across your day matches your suite. No mixing fonts, no clashing palettes, no last-minute hunt for matching paper.',
  suite_categories: [
    { id: 'wedding', label: 'Wedding', alt: 'Wedding ceremony', image: '/assets/images/churchcouples.jpg' },
    { id: 'send-off', label: 'Send-Off', alt: 'Send-Off', image: '/assets/images/brideincar.jpg' },
    { id: 'kitchen-party', label: 'Kitchen Party', alt: 'Kitchen Party — bridal shower florals', image: '/assets/images/flowers_pinky.jpg' },
    { id: 'save-the-date', label: 'Save the Date', alt: 'Save the Date', image: '/assets/images/bridering.jpg' },
    { id: 'michango', label: 'Kadi za Michango', alt: 'Kadi za Michango', image: '/assets/images/mauzo_crew.jpg' },
    { id: 'anniversary', label: 'Anniversary', alt: 'Anniversary celebration', image: '/assets/images/ring_piano.jpg' },
    { id: 'communion', label: 'Communion', alt: 'Communion celebration', image: '/assets/images/couples_together.jpg' },
    { id: 'birthday', label: 'Birthday', alt: 'Birthday celebration', image: '/assets/images/cutesy_couple.jpg' },
    { id: 'gala-dinner', label: 'Gala Dinner', alt: 'Gala dinner', image: '/assets/images/coupleswithpiano.jpg' },
    { id: 'muslim-wedding', label: 'Muslim Wedding', alt: 'Muslim wedding', image: '/assets/images/bridewithumbrella.jpg' },
  ],
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
      return {
        ...INVITATIONS_HERO_FALLBACK,
        ...stored,
        // Keep a usable strip even if a saved draft omitted/emptied the array.
        suite_categories:
          stored.suite_categories && stored.suite_categories.length > 0
            ? stored.suite_categories
            : INVITATIONS_HERO_FALLBACK.suite_categories,
      }
    }
    return INVITATIONS_HERO_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] invitations-hero load failed', err)
    return INVITATIONS_HERO_FALLBACK
  }
}
