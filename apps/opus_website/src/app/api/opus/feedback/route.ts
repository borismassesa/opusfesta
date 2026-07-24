import { rateLimitOk, recordFeedback } from '@/lib/opus/support'

// Thumbs up/down on Opus's last answer, for quality monitoring.

export const runtime = 'nodejs'

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  return fwd ? fwd.split(',')[0].trim() : 'unknown'
}

export async function POST(request: Request) {
  if (!(await rateLimitOk(`opus-feedback:${clientIp(request)}`, 30, 60))) {
    return Response.json({ error: 'Too many requests.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }
  const b = (body ?? {}) as Record<string, unknown>
  const conversationId = typeof b.conversationId === 'string' ? b.conversationId : ''
  const rating = b.rating === 'up' || b.rating === 'down' ? b.rating : null
  const reason = typeof b.reason === 'string' ? b.reason : null
  if (!conversationId || !rating) {
    return Response.json({ error: 'Missing conversationId or rating.' }, { status: 400 })
  }

  const ok = await recordFeedback(conversationId, rating, reason)
  return Response.json({ ok })
}
