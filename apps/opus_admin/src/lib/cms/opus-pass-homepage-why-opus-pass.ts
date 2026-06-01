export type OpusPassHomepageWhyOpusPassContent = {
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

export type OpusPassHomepageWhyOpusPassRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassHomepageWhyOpusPassContent
  draft_content: OpusPassHomepageWhyOpusPassContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_HOMEPAGE_WHY_OPUS_PASS_FALLBACK: OpusPassHomepageWhyOpusPassContent = {
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
