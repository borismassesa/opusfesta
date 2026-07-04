// Shared WhatsApp types — provider-agnostic so the rest of the app never
// depends on Meta's wire format directly.

/** Quick-reply button payload prefixes (carried in the template button payload
 *  so an inbound tap maps back to the exact guest, independent of phone). */
export const BTN = {
  RSVP_YES: 'rsvp_yes',
  RSVP_NO: 'rsvp_no',
  VIEW_LOCATION: 'view_location',
} as const

export type ButtonKind = (typeof BTN)[keyof typeof BTN]

/**
 * Canonical WhatsApp invitation template spec — the single source of truth for
 * what must be submitted to Meta for approval. Quick-reply button TEXT is fixed
 * in the approved template (not sent per-message); the dynamic payload carries
 * the guest token for webhook mapping. Order matters: button index 0/1/2.
 */
export const INVITE_TEMPLATE = {
  /** Header is an IMAGE: the card the couple paid for. */
  header: 'IMAGE' as const,
  /** Body placeholders, in order: {{1}} guest first name, {{2}} couple name,
   *  {{3}} event category (Swahili noun, e.g. "harusi"). This is the EXACT
   *  approved body of `opuspass_send_invites` (fetched from Meta 2026-07-04) —
   *  the in-app preview renders it verbatim, so keep it in sync with Meta. */
  body: 'Habari *{{1}}*,\nUmealikwa kwa furaha kuhudhuria *{{3}}* ya *{{2}}*. Tunatarajia uwepo wako katika siku hii maalum.\nTafadhali thibitisha ujio wako hapa chini 👇',
  /** Footer text fixed in the approved template. */
  footer: 'Sent by OpusPass',
  /** Quick-reply buttons, in index order, with the exact approved labels. */
  buttons: [
    { index: 0, payload: BTN.RSVP_YES, label: 'Asante, Nitafika' },
    { index: 1, payload: BTN.RSVP_NO, label: 'Sitafika, Ninaudhuru' },
    { index: 2, payload: BTN.VIEW_LOCATION, label: 'View Location' },
  ],
} as const

/**
 * Contact Collector template spec — invites a saved contact to fill in their
 * own details via the couple's public collector form. The button is a
 * DYNAMIC WEBSITE URL (not a quick reply): Meta requires the template's URL
 * to be configured as `https://opuspass.opusfesta.com/collect/{{1}}` and the
 * send-time parameter supplies just the token, which Meta appends in place
 * of that placeholder.
 */
export const COLLECTOR_TEMPLATE = {
  header: 'IMAGE' as const,
  /** Body placeholders: {{1}} contact first name, {{2}} couple name. */
  body: 'Habari *{{1}}* 💚\nTunatengeneza orodha ya wageni kwa *{{2}}* na tungependa kupata mawasiliano yako.\nBonyeza hapa chini kujaza fomu fupi 👇',
  cta: { type: 'URL', label: 'Jaza Fomu' },
} as const

/**
 * Pledge template spec — invites a saved contact to make a contribution via
 * the couple's public pledge page. Same dynamic-URL button shape as
 * COLLECTOR_TEMPLATE, pointed at `/pledge/{{1}}`.
 */
export const PLEDGE_TEMPLATE = {
  header: 'IMAGE' as const,
  /** Body placeholders: {{1}} contact first name, {{2}} couple name. */
  body: 'Habari *{{1}}* 💚\n*{{2}}* wanaandaa harusi yao na wangependa mchango wako.\nBonyeza hapa chini kuweka kiasi utakachochangia 👇',
  cta: { type: 'URL', label: 'Changia Sasa' },
} as const

/** Which link-request template to send. */
export type LinkRequestKind = 'collector' | 'pledge'

/** A business-initiated "here's a link, please fill it in" send. */
export interface LinkSend {
  /** Recipient in E.164-ish digits (e.g. 255712345678). */
  to: string
  /** First name interpolated into the template body ({{1}}). */
  contactFirstName: string
  /** Couple/honoree name interpolated into the template body ({{2}}). */
  coupleName: string
  /** Absolute URL of a generic OpusPass banner image (template image header). */
  headerImageUrl: string
  /** The collector/pledge token — supplied as the dynamic URL button suffix. */
  token: string
  /** Template language code, e.g. 'sw' or 'en'. */
  languageCode?: string
}

/** A business-initiated invitation send. */
export interface InviteSend {
  /** Recipient in E.164-ish digits (e.g. 255712345678). */
  to: string
  /** First name interpolated into the template body ({{1}}). */
  guestFirstName: string
  /** Couple/honoree name interpolated into the template body ({{2}}). */
  coupleName: string
  /** Event category (Swahili noun, e.g. "harusi") interpolated into the template body ({{3}}). */
  eventCategory: string
  /** Absolute URL of the card the couple PAID FOR (template image header). */
  headerImageUrl: string
  /** Guest public_token, embedded in each button payload for webhook mapping. */
  token: string
  /** Template language code, e.g. 'sw' or 'en'. */
  languageCode?: string
}

/** Result of a send attempt. */
export interface SendResult {
  ok: boolean
  /** WhatsApp message id (wamid) when sent. */
  wamid?: string
  error?: string
  /** True when handled by the dry-run stub (no live account yet). */
  dryRun?: boolean
}

/** A parsed inbound button tap from the webhook. */
export interface InboundButton {
  /** Sender msisdn. */
  from: string
  /** WhatsApp message id of the inbound event (idempotency key). */
  wamid: string
  kind: ButtonKind
  /** Guest token parsed from the button payload, when present. */
  token: string | null
}

export interface WhatsAppProvider {
  readonly name: string
  /** True when real credentials are configured (else dry-run stub). */
  readonly live: boolean
  sendInvite(send: InviteSend): Promise<SendResult>
  sendLinkRequest(kind: LinkRequestKind, send: LinkSend): Promise<SendResult>
  sendText(to: string, body: string): Promise<SendResult>
}
