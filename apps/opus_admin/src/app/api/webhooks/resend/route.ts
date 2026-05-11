// Resend webhook receiver. Tracks delivery / bounce / open / click events for
// transactional email sent from the admin app.
//
// To enable:
//   1. Add a webhook in Resend (https://resend.com/webhooks) pointing at:
//        https://<admin-host>/api/webhooks/resend
//   2. Copy the signing secret (whsec_…) into RESEND_WEBHOOK_SECRET in env.
//
// When the secret is unset we log a warning but still 200 the request, so
// dev/local environments don't pile up retries from Resend.

import { createHmac, timingSafeEqual } from 'crypto'
import { NextResponse, type NextRequest } from 'next/server'

type ResendEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked'
  | 'email.failed'

type ResendEvent = {
  type: ResendEventType
  created_at: string
  data: {
    email_id?: string
    from?: string
    to?: string[]
    subject?: string
    bounce?: { type?: string; subType?: string; message?: string }
    [key: string]: unknown
  }
}

// Svix signature scheme: header `svix-signature` contains one or more
// space-separated tokens like "v1,<base64>". We compute HMAC-SHA256 over
// `${id}.${timestamp}.${rawBody}` with the secret bytes (decoded from the
// whsec_ base64 prefix) and verify any token matches in constant time.
function verifySvixSignature(args: {
  rawBody: string
  svixId: string
  svixTimestamp: string
  svixSignature: string
  secret: string
}): boolean {
  const { rawBody, svixId, svixTimestamp, svixSignature, secret } = args
  if (!secret.startsWith('whsec_')) {
    // Distinct from a forged-signature failure: this is operator misconfig.
    console.error(
      '[resend webhook] RESEND_WEBHOOK_SECRET is set but missing the "whsec_" prefix — every event will be rejected. Re-copy the signing secret from the Resend dashboard.'
    )
    return false
  }
  const secretBytes = Buffer.from(secret.slice('whsec_'.length), 'base64')
  const signedPayload = `${svixId}.${svixTimestamp}.${rawBody}`
  const expected = createHmac('sha256', secretBytes).update(signedPayload).digest('base64')
  const expectedBuf = Buffer.from(expected)
  for (const token of svixSignature.split(' ')) {
    const [, sig] = token.split(',')
    if (!sig) continue
    const sigBuf = Buffer.from(sig)
    if (sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf)) {
      return true
    }
  }
  return false
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim()
  const rawBody = await request.text()

  if (secret) {
    const svixId = request.headers.get('svix-id')
    const svixTimestamp = request.headers.get('svix-timestamp')
    const svixSignature = request.headers.get('svix-signature')
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.warn('[resend webhook] missing svix-* headers; rejecting')
      return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 })
    }
    if (
      !verifySvixSignature({ rawBody, svixId, svixTimestamp, svixSignature, secret })
    ) {
      console.warn('[resend webhook] signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } else if (process.env.NODE_ENV === 'production') {
    // Fail closed in production: an unsigned endpoint accepts forgeable events
    // and turns into a free log-injection / metric-distortion vector.
    console.error(
      '[resend webhook] refusing request: RESEND_WEBHOOK_SECRET is required in production'
    )
    return NextResponse.json(
      { error: 'Webhook signing secret not configured' },
      { status: 503 }
    )
  } else {
    console.warn(
      '[resend webhook] RESEND_WEBHOOK_SECRET not set — accepting unverified events (dev only)'
    )
  }

  let event: ResendEvent
  try {
    event = JSON.parse(rawBody) as ResendEvent
  } catch (err) {
    console.error('[resend webhook] invalid JSON body', {
      err: err instanceof Error ? err.message : String(err),
      bodyPreview: rawBody.slice(0, 200),
    })
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Structured log: surface delivery state in the server logs so you can
  // debug "did the email arrive?" questions without leaving the terminal.
  // Persisting these to a `notifications_events` Supabase table is the next
  // step — keeping it log-only for now since that needs a migration.
  const data = event.data ?? {}
  const summary = {
    type: event.type,
    emailId: data.email_id ?? null,
    to: Array.isArray(data.to) ? data.to.join(',') : null,
    subject: data.subject ?? null,
    at: event.created_at ?? null,
    bounce: data.bounce ?? null,
  }
  if (event.type === 'email.bounced' || event.type === 'email.failed') {
    console.error('[resend webhook]', summary)
  } else {
    console.info('[resend webhook]', summary)
  }

  return NextResponse.json({ ok: true })
}
