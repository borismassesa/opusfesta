import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type WebsitesSellingPointItem = {
  id: string
  headline: string
  body: string
  cta_label: string
  cta_href: string
  image: string
}

export type WebsitesSellingPointsContent = {
  heading: string
  description: string
  items: WebsitesSellingPointItem[]
}

export const WEBSITES_SELLING_POINTS_FALLBACK: WebsitesSellingPointsContent = {
  heading: 'Built to fit your wedding',
  description:
    'Everything you need for a seamless wedding experience, from beautifully designed websites, invitations, RSVPs, guest updates, registries, and every meaningful moment leading up to your big day.',
  items: [
    {
      id: 'designer-templates',
      headline: 'Designer templates, no tech skills needed',
      body: 'A wide range of designs, ready for you to customize and share.',
      cta_label: 'Explore designs',
      cta_href: '#designs',
      image: '/assets/images/coupleswithpiano.jpg',
    },
    {
      id: 'guests-love',
      headline: 'Websites loved by couples and guests',
      body: "It's the easiest way to keep guests updated and for them to RSVP and shop your registry.",
      cta_label: 'Start website',
      cta_href: '/website-builder',
      image: '/assets/images/mauzo_crew.jpg',
    },
    {
      id: 'match-invitations',
      headline: 'Match your wedding invitations and save the dates',
      body: 'Whatever your style, our websites are made to match your invites and more.',
      cta_label: 'Explore invitations',
      cta_href: '/invitations',
      image: '/assets/images/flowers_pinky.jpg',
    },
  ],
}

export async function loadWebsitesSellingPointsContent(): Promise<WebsitesSellingPointsContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return WEBSITES_SELLING_POINTS_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-websites')
      .eq('section_key', 'selling-points')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<WebsitesSellingPointsContent>
      | undefined
    if (stored) {
      const items =
        stored.items && Array.isArray(stored.items) && stored.items.length > 0
          ? stored.items
          : WEBSITES_SELLING_POINTS_FALLBACK.items
      return {
        heading: stored.heading ?? WEBSITES_SELLING_POINTS_FALLBACK.heading,
        description: stored.description ?? WEBSITES_SELLING_POINTS_FALLBACK.description,
        // Route any legacy "start your website" CTA to the builder, even if a
        // stale CMS row still points it at /sign-up.
        items: items.map((it) =>
          it.cta_href === '/sign-up' ? { ...it, cta_href: '/website-builder' } : it,
        ),
      }
    }
    return WEBSITES_SELLING_POINTS_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] websites-selling-points load failed', err)
    return WEBSITES_SELLING_POINTS_FALLBACK
  }
}
