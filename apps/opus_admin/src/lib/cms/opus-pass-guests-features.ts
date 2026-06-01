export type OpusPassGuestsFeatureCard = {
  id: string
  title: string
  description: string
  cta_label: string
  cta_href: string
}

export type OpusPassGuestsFeaturesContent = {
  heading: string
  description: string
  cards: OpusPassGuestsFeatureCard[]
}

export type OpusPassGuestsFeaturesRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassGuestsFeaturesContent
  draft_content: OpusPassGuestsFeaturesContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_GUESTS_FEATURES_FALLBACK: OpusPassGuestsFeaturesContent = {
  heading: 'Everything your guests need, in one place',
  description:
    'From digital invites and live RSVPs to events, seating and pledges. Every guest detail of your big day, managed in one beautiful dashboard.',
  cards: [
    {
      id: 'rsvps',
      title: 'RSVPs',
      description:
        'See how your guests are replying: attending, maybe and declined, and who still needs a gentle reminder, all at a glance.',
      cta_label: 'Track RSVPs',
      cta_href: '/my/dashboard/rsvps',
    },
    {
      id: 'events',
      title: 'Events',
      description:
        'Create every event on your big day: ceremony, reception, send-off and more, each with its own details and guests.',
      cta_label: 'Manage events',
      cta_href: '/my/dashboard/events',
    },
    {
      id: 'pledges',
      title: 'Pledges',
      description:
        'See who’s pledged, how much and when. One clear ledger of every contribution promised toward your big day.',
      cta_label: 'View pledges',
      cta_href: '/my/dashboard/guests',
    },
  ],
}
