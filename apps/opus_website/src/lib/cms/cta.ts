import { createSupabaseServerClient } from '@/lib/supabase'

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
  background_image_url: '/assets/images/brideincar.jpg',
  eyebrow: 'Free to start. Always.',
  headline_line_1: 'Your perfect',
  headline_line_2: 'day starts',
  headline_line_3: 'right here.',
  subheadline:
    'Join thousands of couples across East Africa planning their dream wedding, stress-free.',
  cta_label: 'Start planning for free',
  cta_href: '#',
  footnote: 'No credit card required · Set up in minutes',
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
      .eq('page_key', 'home')
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
