import type { MaybeLocalized } from '@/lib/cms/localized'

export type OpusPassHomepageManifestoContent = {
  // Translatable copy — stored as { en, sw } (or a legacy plain string).
  segment_1: MaybeLocalized
  pill_label: MaybeLocalized
  segment_2: MaybeLocalized
  segment_3: MaybeLocalized
  segment_4: MaybeLocalized
  segment_5: MaybeLocalized
  // Non-translatable config (image URLs).
  invite_image_url: string
  guest_image_url: string
  place_image_url: string
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
