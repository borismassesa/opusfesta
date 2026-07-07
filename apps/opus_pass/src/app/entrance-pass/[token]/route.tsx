import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { getEntrancePassData } from '@/lib/dashboard/queries'
import { generateEntryPassQrDataUrl } from '@/lib/checkin/qr'

// Fetched live by Meta at WhatsApp send time (same mechanism as the invite
// card header) and opened directly by guests — never cached per-guest data
// behind a shared CDN key.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const WIDTH = 1600
const HEIGHT = 465

/**
 * Ticket background templates (public/entrance-pass/*.png) — the couple's
 * real designer assets, one per package tier. Coordinates below were
 * measured directly off these exact PNGs (all three share the same grid;
 * only colors/QR box size differ) and mask + redraw the couple's real data
 * over the sample placeholder content ("Claudia & Daniel", 02 Oct 2024...).
 *
 * "elegant" has no dedicated ticket yet — falls back to "classic" until one
 * is provided.
 */
const TICKET_SPECS: Record<
  string,
  { file: string; bg: string; titleColor: string; bodyColor: string; qr: { left: number; top: number; size: number } }
> = {
  lite: {
    file: 'lite.png',
    bg: '#E1E8F0',
    titleColor: '#475569',
    bodyColor: '#000000',
    qr: { left: 1294, top: 119, size: 227 },
  },
  classic: {
    file: 'classic.png',
    bg: '#B4DBA1',
    titleColor: '#5C2D8C',
    bodyColor: '#5C2D8C',
    qr: { left: 1268, top: 100, size: 266 },
  },
  signature: {
    file: 'signature.png',
    bg: '#FFEBD2',
    titleColor: '#3D1D22',
    bodyColor: '#000000',
    qr: { left: 1294, top: 119, size: 227 },
  },
}
// "elegant" is a real, separately-priced package tier (see lib/cms/packages.ts)
// with no dedicated ticket design yet — aliased to "classic" as a visible,
// trackable stopgap (see the console.warn below) rather than silently
// duplicating the object, so a future dedicated design is a one-line change.
TICKET_SPECS.elegant = TICKET_SPECS.classic
const DEFAULT_TIER = 'lite'

// Shared layout — identical grid position across every template.
const COUPLE_NAME_BOX = { left: 193, top: 105, width: 938, height: 130 }
const DATE_TIME_BOX = { left: 200, top: 242, width: 478, height: 90 }
const VENUE_BOX = { left: 705, top: 242, width: 459, height: 90 }

// Template PNGs and the font never change at runtime — memoize the read
// (module-scoped, lives for the container's lifetime) instead of re-reading
// disk and re-encoding base64 on every single guest/Meta request.
const fileCache = new Map<string, Promise<Buffer>>()
function readPublicFile(...segments: string[]): Promise<Buffer> {
  const key = segments.join('/')
  let cached = fileCache.get(key)
  if (!cached) {
    // Never cache a rejection — a transient read failure shouldn't poison
    // every subsequent request for the rest of the container's lifetime.
    cached = readFile(path.join(process.cwd(), 'public', ...segments)).catch((err) => {
      fileCache.delete(key)
      throw err
    })
    fileCache.set(key, cached)
  }
  return cached
}

function toDataUri(buf: Buffer, mime: string): string {
  return `data:${mime};base64,${buf.toString('base64')}`
}

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const eventId = new URL(req.url).searchParams.get('event')
  if (!eventId) return new Response('Missing event', { status: 400 })

  const pass = await getEntrancePassData(token, eventId)
  if (!pass) return new Response('Not found', { status: 404 })

  if (!pass.cardTierId || !(pass.cardTierId in TICKET_SPECS)) {
    console.warn('[entrance-pass] unrecognized or missing tier — falling back to default template', {
      guestContactId: pass.guestContactId,
      cardTierId: pass.cardTierId,
    })
  }
  const spec = TICKET_SPECS[pass.cardTierId ?? ''] ?? TICKET_SPECS[DEFAULT_TIER]

  let templateBuf: Buffer, fontBuf: Buffer, qrDataUrl: string
  try {
    ;[templateBuf, fontBuf, qrDataUrl] = await Promise.all([
      readPublicFile('entrance-pass', spec.file),
      readPublicFile('fonts', 'PlayfairDisplay-Bold.woff'),
      generateEntryPassQrDataUrl(pass.guestContactId, pass.invitationId),
    ])
  } catch (err) {
    console.error('[entrance-pass] failed to load ticket assets', err)
    return new Response('Ticket temporarily unavailable', { status: 500 })
  }
  const templateDataUri = toDataUri(templateBuf, 'image/png')

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={templateDataUri} width={WIDTH} height={HEIGHT} style={{ position: 'absolute', inset: 0 }} alt="" />

        {/* Mask the template's sample data, then draw the couple's real data
            in the same spot — the template itself (colors, dividers, QR
            frame, branding) is untouched. */}
        <div
          style={{
            position: 'absolute',
            left: COUPLE_NAME_BOX.left,
            top: COUPLE_NAME_BOX.top,
            width: COUPLE_NAME_BOX.width,
            height: COUPLE_NAME_BOX.height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: spec.bg,
          }}
        >
          <span
            style={{
              fontFamily: 'Playfair Display',
              fontSize: pass.coupleName.length > 34 ? 44 : pass.coupleName.length > 22 ? 56 : 72,
              color: spec.titleColor,
              textAlign: 'center',
            }}
          >
            {pass.coupleName}
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            left: DATE_TIME_BOX.left,
            top: DATE_TIME_BOX.top,
            width: DATE_TIME_BOX.width,
            height: DATE_TIME_BOX.height,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflow: 'hidden',
            background: spec.bg,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 700, color: spec.bodyColor }}>
            {pass.dateLabel ? `DATE: ${pass.dateLabel.toUpperCase()}` : 'DATE TBC'}
          </span>
          {pass.timeLabel ? (
            <span style={{ fontSize: 22, fontWeight: 700, color: spec.bodyColor }}>
              TIME: {pass.timeLabel.toUpperCase()}
            </span>
          ) : null}
        </div>

        <div
          style={{
            position: 'absolute',
            left: VENUE_BOX.left,
            top: VENUE_BOX.top,
            width: VENUE_BOX.width,
            height: VENUE_BOX.height,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflow: 'hidden',
            background: spec.bg,
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, color: spec.bodyColor, lineHeight: 1.25 }}>
            {pass.venue ? `VENUE: ${pass.venue.toUpperCase()}` : 'VENUE TBC'}
          </span>
        </div>

        {/* The real check-in QR, masked in over the template's sample one. */}
        <div
          style={{
            position: 'absolute',
            left: spec.qr.left,
            top: spec.qr.top,
            width: spec.qr.size,
            height: spec.qr.size,
            display: 'flex',
            background: spec.bg,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} width={spec.qr.size} height={spec.qr.size} alt="" />
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: 'Playfair Display', data: fontBuf, style: 'normal', weight: 700 }],
      headers: { 'cache-control': 'private, no-store' },
    },
  )
}
