import 'server-only'

/**
 * OpusPass entrance-pass ticket for manually-admitted guests, drawn on the
 * same portrait purple artwork as the WhatsApp-sent pass
 * (apps/opus_pass/src/app/entrance-pass/[token]/ticket.tsx). The static art
 * (background, ornaments, logo, perforation) ships as a pre-rasterized
 * template PNG in public/entrance-pass/ — the designer's SVG with every
 * per-event slot (couple names, the category intro line + its flanking
 * dashes, date, venue, ticket-type pill, QR) stripped out — and this module
 * lays that per-event data back over it as SVG text: the localized category
 * intro ("The sendoff of" / "Sendoff ya"), couple names, date, venue + city,
 * the SINGLE/DOUBLE pill and the real check-in QR.
 *
 * Deliberately identical content to the guest-facing pass: no guest name,
 * group tag, or time on the artwork — the ticket carries only what the
 * design carries, and identification happens by scanning the QR. The intro,
 * date and Date/Venue labels honor the event's ticket language so a manual
 * admission reads exactly like the guest's own pass. All geometry below is
 * the opus_pass layout's 1300x1881 coordinate space; keep the two in sync.
 */

export type TicketLanguage = 'en' | 'sw'

export interface TicketFields {
  /** Localized category intro line, e.g. "The sendoff of" / "Sendoff ya"
   *  — from ticketIntroLabel(), same source as the guest pass. */
  introLabel: string
  /** e.g. "Claudia & Daniel" — host-name override already applied. */
  coupleName: string
  /** Pre-formatted long date via formatTicketDate(), e.g. "December 12, 2026";
   *  '' when the event has no date. */
  dateLabel: string
  /** Venue name only (the editable "Venue" field), e.g. "Holy Family Basilica";
   *  '' when unset. Excludes the event's free-form address. */
  venue: string
  /** City on its own — drawn on the ticket's second venue row; '' when unset. */
  city: string
  partySize: number
  /** Picks the Date/Venue label copy so the ticket matches its language. */
  ticketLanguage: TicketLanguage
  /** data: URL PNG from generateEntryPassQrDataUrl(). */
  qrDataUrl: string
}

const TICKET_WIDTH = 1300
const TICKET_HEIGHT = 1881
const TEMPLATE_URL = '/entrance-pass/ticket-template.png'

const YELLOW = '#FFF24D'
const WHITE = '#FFFFFF'
const PURPLE = '#5C2D8D'

const INTRO_ROW = { top: 410, height: 76, dashWidth: 75, fontSize: 58, gap: 26 }
const NAME_BAND = { top: 486, height: 292, sidePad: 60 }
const DATE_ROW = { top: 770, height: 110 }
const VENUE_ROW = { top: 916, height: 190, sidePad: 60 }
const PILL = { top: 1227, height: 87 }
const QR_BOX = { top: 1386, size: 423, pad: 14 }

/** Static Date/Venue label copy per ticket language — mirrors the LABELS map
 *  in apps/opus_pass's ticket.tsx. The intro line itself arrives pre-localized
 *  in fields.introLabel. */
const LABELS = {
  en: { date: 'Date:', venue: 'Venue:', dateTbc: 'Date TBC', venueTbc: 'Venue TBC' },
  sw: { date: 'Tarehe:', venue: 'Mahali:', dateTbc: 'Tarehe itatangazwa', venueTbc: 'Mahali patatangazwa' },
} as const

// ─────────────────────────── Shared with the server action ───────────────────────────
// Duplicated from apps/opus_pass (dashboard/types.ts + share.ts) on purpose —
// no shared package is wired up yet (same note as checkin-tokens.ts). Keep the
// phrasing and date format in sync with opus_pass so the two tickets match.

const EAT_TIME_ZONE = 'Africa/Dar_es_Salaam'
const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const SW_MONTHS = [
  'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni',
  'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba',
]

const INTRO_EN: Record<string, string> = {
  wedding: 'The wedding of',
  muslim_wedding: 'The wedding of',
  send_off: 'The sendoff of',
  kitchen_party: 'The kitchen party of',
  anniversary: 'The anniversary of',
  birthday: 'The birthday of',
  gala_dinner: 'The gala dinner of',
}
const INTRO_SW: Record<string, string> = {
  wedding: 'Harusi ya',
  muslim_wedding: 'Harusi ya',
  send_off: 'Sendoff ya',
  kitchen_party: 'Kitchen party ya',
  anniversary: 'Kumbukumbu ya',
  birthday: 'Sherehe ya kuzaliwa ya',
  gala_dinner: 'Gala dinner ya',
  communio: 'Komunyo ya',
}

/** Localized category intro line for the ticket — mirrors opus_pass's
 *  ticketIntroLabel(). A custom/unknown type gets the generic phrasing. */
export function ticketIntroLabel(eventType: string, lang: TicketLanguage): string {
  if (lang === 'sw') return INTRO_SW[eventType] ?? 'Sherehe ya'
  return INTRO_EN[eventType] ?? 'The celebration of'
}

/** Long ticket date read in East Africa Time (so a midnight-boundary event
 *  never prints a day early on a UTC server): "December 12, 2026" (en) /
 *  "12 Desemba 2026" (sw). Matches opus_pass's formatTicketDate/formatLongDateSw. */
export function formatTicketDate(d: Date, lang: TicketLanguage): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: EAT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const val = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const day = Number(val('day'))
  const month = Number(val('month'))
  const year = val('year')
  if (lang === 'sw') return `${String(day).padStart(2, '0')} ${SW_MONTHS[month - 1]} ${year}`
  return `${EN_MONTHS[month - 1]} ${day}, ${year}`
}

/** Tickets are only ever sold as Single or Double — those two words are
 *  the entire pill vocabulary. Anything above one is a Double; "Party of
 *  N" never appears on a ticket. */
function partySizeLabel(partySize: number): string {
  return partySize === 1 ? 'SINGLE' : 'DOUBLE'
}

/** Shrink a line to fit its slot — `em` is the font's rough average glyph
 *  width in em for the script it renders. */
function fitFontSize(text: string, maxWidth: number, base: number, em: number, floor: number): number {
  const fitted = Math.floor(maxWidth / (em * Math.max(1, text.length)))
  return Math.max(floor, Math.min(base, fitted))
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const SERIF = `font-family="Playfair Display" font-weight="700"`

/**
 * Stamp the entrance-pass artwork with real event + guest data. Returns
 * SVG markup ready to render inline (dangerouslySetInnerHTML) or print;
 * the template PNG is referenced by URL rather than inlined so a
 * 500-guest import doesn't ship 500 copies of the same background.
 */
export function renderGuestTicketSvg(fields: TicketFields): string {
  // The only field NOT run through escapeXml below — it's interpolated
  // into an attribute, not text content, so it needs its own guard. It's
  // always machine-generated by generateEntryPassQrDataUrl() (our own
  // qrcode package output), never user input, but this catches any future
  // caller that accidentally passes something else through before it ever
  // reaches dangerouslySetInnerHTML on the client.
  if (!/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(fields.qrDataUrl)) {
    throw new Error('qrDataUrl is not a well-formed PNG data URL')
  }

  const labels = LABELS[fields.ticketLanguage] ?? LABELS.en
  const contentWidth = TICKET_WIDTH - NAME_BAND.sidePad * 2
  const centerX = TICKET_WIDTH / 2

  // Category intro line ("The sendoff of" / "Sendoff ya") — Playfair white,
  // flanked by the artwork's two dashes, redrawn so the dashes hug whatever
  // length the localized phrase has (no text measurement in string-land, so
  // width is estimated from glyph count).
  const introMidY = INTRO_ROW.top + INTRO_ROW.height / 2
  const introBaseline = Math.round(introMidY + INTRO_ROW.fontSize * 0.35)
  const introHalfWidth = (fields.introLabel.length * INTRO_ROW.fontSize * 0.5) / 2
  const dashY = Math.round(introMidY - 1.5)
  const dashLeftX = Math.round(centerX - introHalfWidth - INTRO_ROW.gap - INTRO_ROW.dashWidth)
  const dashRightX = Math.round(centerX + introHalfWidth + INTRO_ROW.gap)

  // Couple names — Dancing Script yellow, centered in the band under the intro.
  const nameSize = fitFontSize(fields.coupleName, contentWidth, 160, 0.46, 64)
  const nameBaseline = Math.round(NAME_BAND.top + NAME_BAND.height / 2 + nameSize * 0.32)

  // Date only — the ticket never shows a time.
  const dateValue = fields.dateLabel || labels.dateTbc
  const dateSize = dateValue.length > 26 ? 46 : 56
  const dateBaseline = Math.round(DATE_ROW.top + DATE_ROW.height / 2 + dateSize * 0.35)

  // Venue — "Venue:" label + name on the first row, the city on its own row
  // beneath. With a city the label+venue is force-fit to one line (matching
  // opus_pass) so the block never runs three lines and overflows; without a
  // city the venue may hand-wrap onto a second line. The whole block is
  // vertically centered in the slot.
  const venueValue = fields.venue || labels.venueTbc
  const cityValue = fields.city || ''
  const venueLead = `${labels.venue} ${venueValue}`
  let venueSize: number
  let venueLines: string[]
  if (cityValue) {
    venueSize = fitFontSize(venueLead, contentWidth, 56, 0.54, 40)
    venueLines = [venueLead, cityValue]
  } else {
    venueSize = venueValue.length > 40 ? 46 : 56
    for (;;) {
      const charsPerLine = Math.floor(contentWidth / (venueSize * 0.52))
      const words = venueLead.split(/\s+/)
      venueLines = ['']
      for (const word of words) {
        const line = venueLines[venueLines.length - 1]
        if (line && `${line} ${word}`.length > charsPerLine) venueLines.push(word)
        else venueLines[venueLines.length - 1] = line ? `${line} ${word}` : word
      }
      if (venueLines.length <= 2 || venueSize <= 34) break
      venueSize -= 6
    }
  }
  const venueLineHeight = venueSize * 1.3
  const venueMidY = VENUE_ROW.top + VENUE_ROW.height / 2

  // Party pill — white capsule, purple Playfair text, width approximated
  // from glyph count (no text measurement in string-land; Playfair bold
  // uppercase averages ~0.66em/glyph, verified against the designer's
  // SINGLE pill).
  const pillLabel = partySizeLabel(fields.partySize)
  const pillTextWidth = pillLabel.length * (52 * 0.66 + 3)
  const pillWidth = Math.round(pillTextWidth + 104)
  const pillBaseline = Math.round(PILL.top + PILL.height / 2 + 52 * 0.35)

  // The artwork's sample QR was white-on-purple; the real one sits on a
  // white card instead — inverted (light-on-dark) QRs fail on common
  // scanner stacks, and the card doubles as the quiet zone.
  const qrCardX = (TICKET_WIDTH - QR_BOX.size) / 2
  const qrInner = QR_BOX.size - QR_BOX.pad * 2

  return `<svg viewBox="0 0 ${TICKET_WIDTH} ${TICKET_HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img">
  <image href="${TEMPLATE_URL}" x="0" y="0" width="${TICKET_WIDTH}" height="${TICKET_HEIGHT}"/>
  <rect x="${dashLeftX}" y="${dashY}" width="${INTRO_ROW.dashWidth}" height="3" fill="${WHITE}" opacity="0.85"/>
  <text x="${centerX}" y="${introBaseline}" text-anchor="middle" ${SERIF} font-size="${INTRO_ROW.fontSize}" fill="${WHITE}">${escapeXml(fields.introLabel)}</text>
  <rect x="${dashRightX}" y="${dashY}" width="${INTRO_ROW.dashWidth}" height="3" fill="${WHITE}" opacity="0.85"/>
  <text x="${centerX}" y="${nameBaseline}" text-anchor="middle" font-family="Dancing Script" font-size="${nameSize}" fill="${YELLOW}">${escapeXml(fields.coupleName)}</text>
  <text x="${centerX}" y="${dateBaseline}" text-anchor="middle" ${SERIF} font-size="${dateSize}"><tspan fill="${YELLOW}">${escapeXml(labels.date)} </tspan><tspan fill="${WHITE}">${escapeXml(dateValue)}</tspan></text>
  ${venueLines
    .map((line, i) => {
      const isLabel = i === 0
      const body = isLabel ? line.slice(labels.venue.length + 1) : line
      const y = Math.round(venueMidY + (i - (venueLines.length - 1) / 2) * venueLineHeight + venueSize * 0.35)
      const prefix = isLabel ? `<tspan fill="${YELLOW}">${escapeXml(labels.venue)} </tspan>` : ''
      return `<text x="${centerX}" y="${y}" text-anchor="middle" ${SERIF} font-size="${venueSize}">${prefix}<tspan fill="${WHITE}">${escapeXml(body)}</tspan></text>`
    })
    .join('\n  ')}
  <rect x="${centerX - pillWidth / 2}" y="${PILL.top}" width="${pillWidth}" height="${PILL.height}" rx="${PILL.height / 2}" fill="${WHITE}"/>
  <text x="${centerX}" y="${pillBaseline}" text-anchor="middle" ${SERIF} font-size="52" letter-spacing="3" fill="${PURPLE}">${escapeXml(pillLabel)}</text>
  <rect x="${qrCardX}" y="${QR_BOX.top}" width="${QR_BOX.size}" height="${QR_BOX.size}" rx="24" fill="${WHITE}"/>
  <image href="${fields.qrDataUrl}" x="${qrCardX + QR_BOX.pad}" y="${QR_BOX.top + QR_BOX.pad}" width="${qrInner}" height="${qrInner}"/>
</svg>`
}
