export type OpusPassHomepageManifestoContent = {
  segment_1: string
  pill_label: string
  segment_2: string
  invite_image_url: string
  segment_3: string
  guest_image_url: string
  segment_4: string
  place_image_url: string
  segment_5: string
}

export type OpusPassHomepageManifestoRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassHomepageManifestoContent
  draft_content: OpusPassHomepageManifestoContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_HOMEPAGE_MANIFESTO_FALLBACK: OpusPassHomepageManifestoContent = {
  segment_1: 'OpusPass brings your invites,',
  pill_label: 'RSVP',
  segment_2: 'guest list and wedding website into one beautifully simple place. Send a',
  invite_image_url: '/assets/invitation-svgs/classic-serif.svg',
  segment_3: 'design by WhatsApp or SMS, let guests',
  guest_image_url: '/assets/images/cutesy_couple.jpg',
  segment_4: 'tap to confirm — designed for couples in',
  place_image_url: '/assets/images/flowers_pinky.jpg',
  segment_5: 'Tanzania.',
}
