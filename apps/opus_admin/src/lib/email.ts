// Resend transactional email wrapper for opus_admin.
// Pattern mirrors apps/studio/lib/resend.ts so behavior stays consistent
// across apps. When RESEND_API_KEY is unset we no-op rather than throw, so
// the contributor-invite UI can fall back to a mailto: link.

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export type EmailPayload = {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export type EmailResult =
  | { sent: true; id: string | null }
  | { sent: false; reason: 'not_configured' | 'send_failed'; error?: string }

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

function defaultFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || 'OpusFesta <admin@opusfesta.com>'
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  if (!resend) {
    return { sent: false, reason: 'not_configured' }
  }
  try {
    const result = await resend.emails.send({
      from: payload.from || defaultFromAddress(),
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo,
    })
    if (result.error) {
      console.error('[email] resend error:', result.error)
      return {
        sent: false,
        reason: 'send_failed',
        error: result.error.message ?? 'Unknown Resend error',
      }
    }
    return { sent: true, id: result.data?.id ?? null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error'
    console.error('[email] exception:', message)
    return { sent: false, reason: 'send_failed', error: message }
  }
}
