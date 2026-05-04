import { createSupabaseServerClient } from '@/lib/supabase-server'

export type CtaContent = {
  background_image_url: string
  eyebrow: string
  headline_line_1: string
  headline_line_2: string
  headline_line_3: string
  subheadline: string
  cta_label: string
  cta_href: string
  footnote: string
}

export const CTA_FALLBACK: CtaContent = {
  background_image_url: '/assets/images/mauzo_crew.jpg',
  eyebrow: 'Free to start. Always.',
  headline_line_1: 'Grow your',
  headline_line_2: 'business',
  headline_line_3: 'on OpusFesta.',
  subheadline:
    'Join hundreds of wedding pros across East Africa winning more bookings on OpusFesta.',
  cta_label: 'Sign up free',
  cta_href: '/sign-up',
  footnote: 'No credit card · Set up in minutes',
}

export async function loadCtaContent(): Promise<CtaContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return CTA_FALLBACK
  }
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content')
      .eq('page_key', 'vendors_home')
      .eq('section_key', 'cta')
      .maybeSingle()
    const stored = data?.content as Partial<CtaContent> | undefined
    if (stored) {
      return { ...CTA_FALLBACK, ...stored }
    }
    return CTA_FALLBACK
  } catch {
    return CTA_FALLBACK
  }
}
