import { EVENTLESS_COVER_KEY } from './pledge-page'

/** Sending a thank-you message is available to every package tier — only the
 *  card TEMPLATE picker (the WhatsApp header image) is paygated, mirroring
 *  the Pledges card-template picker exactly: free for these tiers, everyone
 *  else can request a one-time unlock (see THANK_YOU_CARD_UNLOCK_FEE). */
export const THANK_YOU_FREE_TIER_IDS = ['elegant', 'signature']

/** Flat one-time fee (TZS) offered to Classic/Essential couples to unlock the
 *  thank-you card picker. Mirrors PLEDGE_TEMPLATE_UNLOCK_FEE. */
export const THANK_YOU_CARD_UNLOCK_FEE = 15000

/** The couple_profiles.thank_you_config JSONB shape — a card design (from the
 *  invitation catalog) applied as the WhatsApp message's header image,
 *  scoped per event. Mirrors PledgePageConfig.eventCovers. */
export interface ThankYouCardConfig {
  eventCovers?: Record<string, { coverImageUrl: string | null; coverIsFullTemplate: boolean }>
}

/** Resolve the card cover for a specific event from the couple's raw stored
 *  thank_you_config. Mirrors resolveEventCover() in pledge-page.ts. */
export function resolveThankYouCover(
  stored: ThankYouCardConfig | null | undefined,
  eventId: string | null,
): { coverImageUrl: string | null; coverIsFullTemplate: boolean } {
  const key = eventId ?? EVENTLESS_COVER_KEY
  const cover = stored?.eventCovers?.[key]
  return { coverImageUrl: cover?.coverImageUrl ?? null, coverIsFullTemplate: cover?.coverIsFullTemplate ?? false }
}
