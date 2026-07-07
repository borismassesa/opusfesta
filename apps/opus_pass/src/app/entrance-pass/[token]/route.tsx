import { ImageResponse } from 'next/og'
import { getEntrancePassData } from '@/lib/dashboard/queries'
import { generateEntryPassQrDataUrl } from '@/lib/checkin/qr'

// Fetched live by Meta at WhatsApp send time (same mechanism as the invite
// card header) and opened directly by guests — never cached per-guest data
// behind a shared CDN key.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const WIDTH = 1200
const HEIGHT = 520

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const eventId = new URL(req.url).searchParams.get('event')
  if (!eventId) return new Response('Missing event', { status: 400 })

  const pass = await getEntrancePassData(token, eventId)
  if (!pass) return new Response('Not found', { status: 404 })

  const qrDataUrl = await generateEntryPassQrDataUrl(pass.guestContactId, pass.invitationId)

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          fontFamily: 'sans-serif',
          background: '#1A1A1A',
        }}
      >
        {/* Left panel — the couple's own paid card design as backdrop, or a
            plain brand-dark fallback when no design is on file yet. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            padding: '48px 56px',
            position: 'relative',
            backgroundImage: pass.cardImageUrl
              ? `linear-gradient(135deg, rgba(26,26,26,0.55), rgba(26,26,26,0.85)), url(${pass.cardImageUrl})`
              : 'linear-gradient(135deg, #2A1F33, #1A1A1A)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: 4, opacity: 0.7, textTransform: 'uppercase' }}>
              {pass.eventTypeLabel} · Entrance Pass
            </span>
            <span style={{ fontSize: 46, fontWeight: 700, marginTop: 12 }}>{pass.coupleName}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 600 }}>{pass.guestName}</span>
            {pass.dateLabel ? <span style={{ fontSize: 16, opacity: 0.85 }}>{pass.dateLabel}</span> : null}
            {pass.venue ? <span style={{ fontSize: 16, opacity: 0.85 }}>{pass.venue}</span> : null}
          </div>
        </div>

        {/* Perforated divider */}
        <div
          style={{
            display: 'flex',
            width: 2,
            backgroundImage: 'repeating-linear-gradient(to bottom, #FFFFFF55 0, #FFFFFF55 10px, transparent 10px, transparent 22px)',
          }}
        />

        {/* Right stub — brand + QR */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: 340,
            padding: '40px 32px',
            background: '#F0DFF6',
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, color: '#5d3a78', letterSpacing: 1 }}>OpusPass</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} width={220} height={220} alt="Entrance QR" />
          <span style={{ fontSize: 12, color: '#5d3a78', opacity: 0.75, textAlign: 'center' }}>
            Show this at the door
          </span>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: { 'cache-control': 'private, no-store' },
    },
  )
}
