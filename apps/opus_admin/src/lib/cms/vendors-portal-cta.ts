import type { MaybeLocalized } from './localized'

export type CtaContent = {
  // Background
  background_image_url: string

  // Copy
  eyebrow: MaybeLocalized
  headline_line_1: MaybeLocalized
  headline_line_2: MaybeLocalized
  headline_line_3: MaybeLocalized // Note: line 3 takes the accent color
  subheadline: MaybeLocalized

  // Button
  cta_label: MaybeLocalized
  cta_href: string
  footnote: MaybeLocalized
}

export type CtaRow = {
  id: string
  page_key: string
  section_key: string
  content: CtaContent
  draft_content: CtaContent | null
  is_published: boolean
  updated_at: string
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
