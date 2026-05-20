export type OpusPassInvitationsPromoBannerContent = {
  /** Bold uppercase label on the left, e.g. "40% off". */
  eyebrow: string
  /** Body copy after the eyebrow, e.g. "wedding paper with code". */
  body: string
  /** Highlighted promo code at the end. Set to "" to hide. */
  promo_code: string
  /** Banner background colour (hex). */
  background_color: string
}

export type OpusPassInvitationsPromoBannerRow = {
  id: string
  page_key: string
  section_key: string
  content: OpusPassInvitationsPromoBannerContent
  draft_content: OpusPassInvitationsPromoBannerContent | null
  is_published: boolean
  updated_at: string
}

export const OPUS_PASS_INVITATIONS_PROMO_BANNER_FALLBACK: OpusPassInvitationsPromoBannerContent = {
  eyebrow: '40% off',
  body: 'wedding paper with code',
  promo_code: 'KARIBU40',
  background_color: '#FCE9C2',
}
