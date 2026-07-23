import { NextResponse, type NextRequest } from 'next/server'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { CheckinReportPdf, type CheckinReportData } from '@/lib/checkin-report-pdf'

export const runtime = 'nodejs'

// Generous but bounded — a full guest list for a very large wedding still fits
// well under this; guards against an abusive/malformed body.
const MAX_BODY_BYTES = 500 * 1024

function isValidPayload(body: unknown): body is CheckinReportData {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.eventName === 'string' &&
    typeof b.generatedAt === 'string' &&
    typeof b.totalAttending === 'number' &&
    typeof b.totalArrived === 'number' &&
    Array.isArray(b.rows)
  )
}

export async function POST(req: NextRequest) {
  const length = Number(req.headers.get('content-length') ?? 0)
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  let body: unknown
  try {
    body = await req.json()
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
