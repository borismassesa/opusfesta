// Best-effort email orchestration fired after a successful inquiry submission
// on the opus_website:
//
//   1. Client confirmation — receipts the couple so they know their request
//      landed and gives them a direct tracking link.
//
// Best-effort: if Resend isn't configured or a send fails, we log a warning
// and return without throwing. Email failure must NEVER fail the underlying
// inquiry insert — the row is already persisted by the caller.

import { isEmailConfigured, sendEmail } from './email'
import { buildInquiryConfirmationEmail } from './inquiry-confirmation-email'

export type NotifyOnInquiryInput = {
  inquiryId: string
  clientName: string
  clientEmail: string
  vendorName: string
  emailNotificationsOptIn: boolean
  submittedAt: string
}

export async function notifyOnInquirySubmit(input: NotifyOnInquiryInput): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(
      `[email] RESEND_API_KEY not set — skipping inquiry confirmation for inquiry=${input.inquiryId}`,
    )
    return
  }

  // Only send the client confirmation if they opted in to email notifications.
  if (!input.emailNotificationsOptIn) {
    return
  }

  const message = buildInquiryConfirmationEmail({
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    vendorName: input.vendorName,
    inquiryId: input.inquiryId,
    submittedAt: input.submittedAt,
  })

  const result = await sendEmail({
    to: input.clientEmail,
    subject: message.subject,
    html: message.html,
    text: message.text,
  })

  if (!result.sent) {
    console.warn(
      `[email] inquiry confirmation failed (inquiry=${input.inquiryId}): ${result.reason}${result.error ? ` — ${result.error}` : ''}`,
    )
  }
}
