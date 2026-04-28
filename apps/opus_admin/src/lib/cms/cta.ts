export type CtaContent = {
  // Background
  background_image_url: string

  // Copy
  eyebrow: string
  headline_line_1: string
  headline_line_2: string
  headline_line_3: string // Note: line 3 takes the accent color
  subheadline: string

  // Button
  cta_label: string
  cta_href: string
  footnote: string
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
