import { NextResponse, type NextRequest } from 'next/server'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { SeatingPlanPdf, type SeatingPlanPdfData } from '@/lib/seating-plan-pdf'

export const runtime = 'nodejs'

// Generous but bounded — a seating plan for a very large wedding (50+ tables)
// still fits comfortably under this; guards against an abusive/malformed body.
const MAX_BODY_BYTES = 300 * 1024

function isValidPayload(body: unknown): body is SeatingPlanPdfData {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.eventName === 'string' &&
    typeof b.generatedAt === 'string' &&
    typeof b.totalCapacity === 'number' &&
    typeof b.seatedTotal === 'number' &&
    typeof b.unassignedTotal === 'number' &&
    Array.isArray(b.tables) &&
    Array.isArray(b.unassigned)
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
    return NextResponse.json({ error: 'Invalid seating plan payload' }, { status: 400 })
  }

  try {
    const pdf = await renderToBuffer(createElement(SeatingPlanPdf, { data: body }) as ReactElement<DocumentProps>)
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="OpusPass-Seating-Plan.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[api/seating-plan] PDF render failed', err)
    return NextResponse.json({ error: 'Could not generate the seating plan' }, { status: 500 })
  }
}
