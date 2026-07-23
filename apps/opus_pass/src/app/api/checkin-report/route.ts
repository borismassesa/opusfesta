import { NextResponse, type NextRequest } from 'next/server'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { CheckinReportPdf, type CheckinReportData } from '@/lib/checkin-report-pdf'
import { createSupabaseServerClient } from '@/lib/supabase'
import { clientIp, withinRateLimit, RATE_LIMITED_RESPONSE } from '@/lib/checkin/rate-limit'

export const runtime = 'nodejs'

// Generous but bounded — a full guest list for a very large wedding still fits
// well under this; guards against an abusive/malformed body.
const MAX_BODY_BYTES = 500 * 1024
// A wedding guest list never approaches this; the cap stops a body that is
// small in bytes but pathological in row count from driving a long,
// event-loop-blocking render on this unauthenticated route.
const MAX_ROWS = 5000

function isValidPayload(body: unknown): body is CheckinReportData {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.eventName === 'string' &&
    typeof b.generatedAt === 'string' &&
    typeof b.totalAttending === 'number' &&
    typeof b.totalArrived === 'number' &&
    Array.isArray(b.rows) &&
    b.rows.length <= MAX_ROWS
  )
}

export async function POST(req: NextRequest) {
  // The route reads no DB, but it is unauthenticated and renders a PDF (CPU),
  // so cap how often one caller can trigger a render.
  const supabase = createSupabaseServerClient()
  if (!(await withinRateLimit(supabase, `checkin-report:${clientIp(req)}`, 20, 60))) {
    return NextResponse.json(RATE_LIMITED_RESPONSE, { status: 429 })
  }

  // Enforce the size cap on the bytes actually received, not the client-supplied
  // Content-Length header, which a non-browser caller can understate.
  let raw: string
  try {
    raw = await req.text()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!isValidPayload(body)) {
    return NextResponse.json({ error: 'Invalid check-in report payload' }, { status: 400 })
  }

  try {
    const pdf = await renderToBuffer(
      createElement(CheckinReportPdf, { data: body }) as ReactElement<DocumentProps>,
    )
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="OpusPass-Checkin-Report.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[api/checkin-report] PDF render failed', err)
    return NextResponse.json({ error: 'Could not generate the check-in report' }, { status: 500 })
  }
}
