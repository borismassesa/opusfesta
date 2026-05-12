// Resend transactional email wrapper for opus_website. Pattern mirrors
// apps/vendors_portal/src/lib/email/email.ts so behavior stays consistent
// across apps. When RESEND_API_KEY is unset we no-op rather than throw, so
// user-facing actions (inquiry submit, etc.) never fail due to email-config
// issues.

import { Resend } from 'resend'

export class ResendConfigError extends Error {
  constructor() {
    super('Missing RESEND_API_KEY')
    this.name = 'ResendConfigError'
  }
}

export function hasResendConfig(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

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
  cc?: string | string[]
  bcc?: string | string[]
}

export type EmailResult =
  | { sent: true; id: string | null }
  | { sent: false; reason: 'not_configured' | 'send_failed'; error?: string }

export function isEmailConfigured(): boolean {
  return hasResendConfig()
}

function defaultFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || 'OpusFesta <hello@opusfesta.com>'
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  if (!resend) {
    return { sent: false, reason: 'not_configured', error: new ResendConfigError().message }
  }
  try {
    const result = await resend.emails.send({
      from: payload.from || defaultFromAddress(),
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo,
      ...(payload.cc ? { cc: payload.cc } : {}),
      ...(payload.bcc ? { bcc: payload.bcc } : {}),
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
