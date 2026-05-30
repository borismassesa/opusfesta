import { isEmailConfigured, sendEmail } from './email'
import { escapeHtml } from './email-shell'

type BookingEmailInput = {
  recipientEmail: string | null
  recipientName: string | null
  vendorName: string
  bookingId: string
  eventDate: string | null
  eventLabel: string
}

type LeadEmailInput = {
  recipientEmail: string | null
  recipientName: string | null
  vendorName: string
  inquiryId: string
  statusLabel: string
  eventDate: string | null
  amountTzs?: number | null
}

function safe(value: string | null | undefined): string {
  return (value ?? '').trim()
}

// RFC-5322 light: keeps things permissive but rejects obviously-broken input
// before we hand it to Resend (saves a confusing remote error in the logs).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function isLikelyEmail(value: string): boolean {
  return value.length > 0 && value.length <= 320 && EMAIL_RE.test(value)
}

function formatDateLabel(value: string | null): string {
  if (!value) return 'TBD'
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatMoney(amount: number | null | undefined): string {
  if (!amount || amount <= 0) return 'TBD'
  return `TZS ${amount.toLocaleString('en-GB')}`
}

// ─── in-memory rate-limit ───────────────────────────────────────────────
// Coalesces repeat sends keyed on (bookingId|inquiryId, eventLabel). Prevents
// a vendor (or compromised session) from spamming a recipient's inbox by
// PATCHing the same status twice in a row. Process-local — for cross-instance
// dedup, swap in Upstash later.
const NOTIFY_TTL_MS = 5 * 60_000
const recentNotifies = new Map<string, number>()

function shouldCoalesce(key: string): boolean {
  const now = Date.now()
  const last = recentNotifies.get(key)
  if (last && now - last < NOTIFY_TTL_MS) return true
  recentNotifies.set(key, now)
  // Opportunistic cleanup — keeps the map bounded without a timer.
  if (recentNotifies.size > 1000) {
    for (const [k, t] of recentNotifies) {
      if (now - t > NOTIFY_TTL_MS) recentNotifies.delete(k)
    }
  }
  return false
}

export async function notifyBookingEventEmail(input: BookingEmailInput): Promise<void> {
  if (!isEmailConfigured()) return

  const to = safe(input.recipientEmail)
  if (!isLikelyEmail(to)) return

  const key = `b:${input.bookingId}:${input.eventLabel}`
  if (shouldCoalesce(key)) return

  const name = safe(input.recipientName) || 'there'
  const eventDate = formatDateLabel(input.eventDate)

  const safeName = escapeHtml(name)
  const safeVendor = escapeHtml(input.vendorName)
  const safeLabel = escapeHtml(input.eventLabel)
  const safeDate = escapeHtml(eventDate)
  const safeRef = escapeHtml(input.bookingId)

  const subject = `${input.vendorName}: ${input.eventLabel}`
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
      <p>Hi ${safeName},</p>
      <p>Your booking with <strong>${safeVendor}</strong> has been updated.</p>
      <p><strong>Update:</strong> ${safeLabel}<br/>
      <strong>Event date:</strong> ${safeDate}<br/>
      <strong>Reference:</strong> ${safeRef}</p>
      <p>If you have questions, reply directly to this email.</p>
    </div>
  `

  const result = await sendEmail({
    to,
    subject,
    html,
  })

  if (!result.sent) {
    console.warn(
      `[email] booking event notify failed (booking=${input.bookingId}): ${result.reason}${result.error ? ` — ${result.error}` : ''}`,
    )
  }
}

export async function notifyLeadEventEmail(input: LeadEmailInput): Promise<void> {
  if (!isEmailConfigured()) return

  const to = safe(input.recipientEmail)
  if (!isLikelyEmail(to)) return

  const key = `l:${input.inquiryId}:${input.statusLabel}`
  if (shouldCoalesce(key)) return

  const name = safe(input.recipientName) || 'there'
  const eventDate = formatDateLabel(input.eventDate)
  const amount = formatMoney(input.amountTzs)

  const safeName = escapeHtml(name)
  const safeVendor = escapeHtml(input.vendorName)
  const safeStatus = escapeHtml(input.statusLabel)
  const safeDate = escapeHtml(eventDate)
  const safeAmount = escapeHtml(amount)
  const safeRef = escapeHtml(input.inquiryId)

  const subject = `${input.vendorName}: ${input.statusLabel}`
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
      <p>Hi ${safeName},</p>
      <p>There is an update to your lead with <strong>${safeVendor}</strong>.</p>
      <p><strong>Status:</strong> ${safeStatus}<br/>
      <strong>Event date:</strong> ${safeDate}<br/>
      <strong>Amount:</strong> ${safeAmount}<br/>
      <strong>Reference:</strong> ${safeRef}</p>
      <p>If you have questions, reply directly to this email.</p>
    </div>
  `

  const result = await sendEmail({
    to,
    subject,
    html,
  })

  if (!result.sent) {
    console.warn(
      `[email] lead event notify failed (inquiry=${input.inquiryId}): ${result.reason}${result.error ? ` — ${result.error}` : ''}`,
    )
  }
}
