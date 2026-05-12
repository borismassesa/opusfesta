import { isEmailConfigured, sendEmail } from './email'

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

export async function notifyBookingEventEmail(input: BookingEmailInput): Promise<void> {
  if (!isEmailConfigured()) return

  const to = safe(input.recipientEmail)
  if (!to) return

  const name = safe(input.recipientName) || 'there'
  const eventDate = formatDateLabel(input.eventDate)

  const subject = `${input.vendorName}: ${input.eventLabel}`
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
      <p>Hi ${name},</p>
      <p>Your booking with <strong>${input.vendorName}</strong> has been updated.</p>
      <p><strong>Update:</strong> ${input.eventLabel}<br/>
      <strong>Event date:</strong> ${eventDate}<br/>
      <strong>Reference:</strong> ${input.bookingId}</p>
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
  if (!to) return

  const name = safe(input.recipientName) || 'there'
  const eventDate = formatDateLabel(input.eventDate)
  const amount = formatMoney(input.amountTzs)

  const subject = `${input.vendorName}: ${input.statusLabel}`
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
      <p>Hi ${name},</p>
      <p>There is an update to your lead with <strong>${input.vendorName}</strong>.</p>
      <p><strong>Status:</strong> ${input.statusLabel}<br/>
      <strong>Event date:</strong> ${eventDate}<br/>
      <strong>Amount:</strong> ${amount}<br/>
      <strong>Reference:</strong> ${input.inquiryId}</p>
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
