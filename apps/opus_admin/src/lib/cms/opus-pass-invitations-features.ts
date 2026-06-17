export type OpusPassInvitationsFeatureVisual = 'invitations' | 'phone' | 'envelope'

export type OpusPassInvitationsFeatureCard = {
  id: string
  title: string
  body: string
  cta_label: string
  cta_href: string
  /** When set, renders this image instead of the built-in `visual` component. */
  image_url?: string
  visual: OpusPassInvitationsFeatureVisual
}

export type OpusPassInvitationsFeaturesContent = {
  heading: string
  cards: OpusPassInvitationsFeatureCard[]
}

export type OpusPassInvitationsFeaturesRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassInvitationsFeaturesContent
  draft_content: OpusPassInvitationsFeaturesContent | null
  is_published: boolean
  updated_at: string
}

export const INVITATIONS_FEATURE_VISUALS: OpusPassInvitationsFeatureVisual[] = [
  'invitations',
  'phone',
  'envelope',
]

export const OPUS_PASS_INVITATIONS_FEATURES_FALLBACK: OpusPassInvitationsFeaturesContent = {
  heading: 'Wedding stationery made easy, from invite to seat',
  cards: [
    {
      id: 'guest-list',
      title: 'Free guest list, free RSVPs',
      body: 'Track every yes, every plus-one, every dietary need. Free with every OpusFesta wedding.',
      cta_label: 'Open my guest list',
      cta_href: '/my/guests',
      visual: 'invitations',
    },
    {
      id: 'matching-website',
      title: 'Free matching website',
      body: 'Pick an invitation, get a wedding website to match — bilingual RSVP form built in, ready to share.',
      cta_label: 'Find your match',
      cta_href: '/my/planning',
      visual: 'phone',
    },
    {
      id: 'guest-addressing',
      title: 'Easy guest addressing',
      body: 'Save addresses against names. We pull them onto envelopes when you order — handwritten or printed.',
      cta_label: 'Get started',
      cta_href: '/my/guests',
      visual: 'envelope',
    },
  ],
}
