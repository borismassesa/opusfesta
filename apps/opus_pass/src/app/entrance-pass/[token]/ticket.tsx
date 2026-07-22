import type { ReactElement } from 'react'
import type { EntrancePassData } from '@/lib/dashboard/queries'

/**
 * The OpusPass entrance-pass ticket, drawn from the designer's portrait
 * artwork (src/assets/svg/opuspass_entrance_tickets.svg). The static art
 * (background, ornaments, logo, "The wedding of", perforation) ships as a
 * pre-rasterized template PNG (scripts/build-entrance-pass-template.mjs);
 * this module draws the per-guest data in the slots the sample content
 * occupied: couple names, date, venue, SINGLE/DOUBLE party pill and the
 * real check-in QR.
 *
 * Kept free of server-only imports so a plain script can render it with
 * sample data outside a request (fonts, template and QR come in as args).
 */

export const TICKET_WIDTH = 1300
export const TICKET_HEIGHT = 1881

// The designer's SVG is a 3251.85 x 4704.4 viewBox; every coordinate below
// is that geometry scaled by 1300 / 3251.85 ≈ 0.3998 — the same scale the
// template PNG is rasterized at, so the slots line up with the artwork.
const YELLOW = '#FFF24D'
const WHITE = '#FFFFFF'
const PURPLE = '#5C2D8D'

const NAME_BAND = { top: 486, height: 292, sidePad: 60 }
const DATE_ROW = { top: 770, height: 110 }
const VENUE_ROW = { top: 916, height: 190, sidePad: 60 }
const PILL = { top: 1227, height: 87 }
const QR_BOX = { top: 1386, size: 423, pad: 14 }

/** Tickets are only ever sold as Single or Double — those two words are
 *  the entire pill vocabulary. Anything above one is a Double; "Party of
 *  N" never appears on a ticket. */
export function partySizeLabel(partySize: number): string {
  return partySize === 1 ? 'SINGLE' : 'DOUBLE'
}

/** Shrink a line to fit its slot — `em` is the font's rough average glyph
 *  width in em for the script it renders. */
function fitFontSize(text: string, maxWidth: number, base: number, em: number, floor: number): number {
  const fitted = Math.floor(maxWidth / (em * Math.max(1, text.length)))
  return Math.max(floor, Math.min(base, fitted))
}

export interface TicketInput {
  pass: Pick<EntrancePassData, 'coupleName' | 'dateLabel' | 'venue' | 'partySize'>
  /** data: URI of public/entrance-pass/ticket-template.png */
  templateDataUri: string
  /** data: URL PNG of the guest's real check-in QR */
  qrDataUrl: string
}

export function buildTicketElement({ pass, templateDataUri, qrDataUrl }: TicketInput): ReactElement {
  const nameWidth = TICKET_WIDTH - NAME_BAND.sidePad * 2
  const nameSize = fitFontSize(pass.coupleName, nameWidth, 160, 0.46, 64)

  // Date only — the ticket never shows a time.
  const dateValue = pass.dateLabel || 'Date TBC'
  const dateSize = dateValue.length > 26 ? 46 : 56

  const venueValue = pass.venue || 'Venue TBC'
  const venueSize = venueValue.length > 56 ? 46 : 56

  const qrInner = QR_BOX.size - QR_BOX.pad * 2

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={templateDataUri} width={TICKET_WIDTH} height={TICKET_HEIGHT} style={{ position: 'absolute', inset: 0 }} alt="" />

      <div
        style={{
          position: 'absolute',
          left: NAME_BAND.sidePad,
          top: NAME_BAND.top,
          width: nameWidth,
          height: NAME_BAND.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <span style={{ fontFamily: 'Dancing Script', fontSize: nameSize, color: YELLOW, textAlign: 'center' }}>
          {pass.coupleName}
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: NAME_BAND.sidePad,
          top: DATE_ROW.top,
          width: nameWidth,
          height: DATE_ROW.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          overflow: 'hidden',
          fontFamily: 'Playfair Display',
          fontWeight: 700,
          fontSize: dateSize,
        }}
      >
        <span style={{ color: YELLOW }}>Date:</span>
        <span style={{ color: WHITE }}>{dateValue}</span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: VENUE_ROW.sidePad,
          top: VENUE_ROW.top,
          width: TICKET_WIDTH - VENUE_ROW.sidePad * 2,
          height: VENUE_ROW.height,
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          overflow: 'hidden',
          fontFamily: 'Playfair Display',
          fontWeight: 700,
          fontSize: venueSize,
        }}
      >
        <span style={{ color: YELLOW }}>Venue:</span>
        <div style={{ maxWidth: 840, color: WHITE, lineHeight: 1.35 }}>{venueValue}</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: PILL.top,
          width: TICKET_WIDTH,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: PILL.height,
            padding: '0 52px',
            background: WHITE,
            borderRadius: PILL.height / 2,
            fontFamily: 'Playfair Display',
            fontWeight: 700,
            fontSize: 52,
            letterSpacing: 3,
            color: PURPLE,
          }}
        >
          {partySizeLabel(pass.partySize)}
        </div>
      </div>

      {/* The artwork's sample QR was white-on-purple; the real one sits on a
          white card instead — inverted (light-on-dark) QRs fail on common
          scanner stacks, and the card doubles as the quiet zone. */}
      <div
        style={{
          position: 'absolute',
          left: (TICKET_WIDTH - QR_BOX.size) / 2,
          top: QR_BOX.top,
          width: QR_BOX.size,
          height: QR_BOX.size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: WHITE,
          borderRadius: 24,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} width={qrInner} height={qrInner} alt="" />
      </div>
    </div>
  )
}
