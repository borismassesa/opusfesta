// Client-facing confirmation email sent immediately after a successful
// inquiry submission on the opus_website. Lets the couple know their request
// landed and gives them a direct link to track the thread.

import { renderEmail, plaintextLines, escapeHtml } from './email-shell'

export type InquiryConfirmationInput = {
  clientName: string
  clientEmail: string
  vendorName: string
  inquiryId: string
  submittedAt: string
  websiteUrl?: string
}

export function buildInquiryConfirmationEmail(
  input: InquiryConfirmationInput,
): { subject: string; text: string; html: string } {
  const normalizedEmail = input.clientEmail.trim().toLowerCase()
  const firstName = input.clientName.trim().split(' ')[0] || null
  const greeting = firstName ? `Hi ${firstName},` : 'Hello,'
  const htmlGreeting = firstName
    ? `Hi <strong>${escapeHtml(firstName)}</strong> —`
    : 'Hello —'
  const subject = `Your inquiry to ${input.vendorName} was received — OpusFesta`

  const websiteBase = (
    input.websiteUrl?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    'https://opusfesta.com'
  ).replace(/\/$/, '')

  const trackUrl = `${websiteBase}/my/inquiries/${input.inquiryId}?email=${encodeURIComponent(normalizedEmail)}`
  const inquiriesUrl = `${websiteBase}/my/inquiries?email=${encodeURIComponent(normalizedEmail)}`

  const submittedDate = new Date(input.submittedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const preheader = `${input.vendorName} will get back to you soon. Track your request in your OpusFesta inbox.`

  const text = plaintextLines([
    greeting,
    '',
    `Your inquiry to ${input.vendorName} was received — we've forwarded it to them and they'll be in touch soon.`,
    '',
    `Vendor: ${input.vendorName}`,
    `Submitted: ${submittedDate}`,
    `Reference: ${input.inquiryId}`,
    '',
    `Track your request: ${trackUrl}`,
    '',
    'What happens next:',
    `1. ${input.vendorName} reviews your request and responds in the thread.`,
    '2. You\'ll get an email notification when they reply (if you opted in).',
    '3. Negotiate, accept a proposal, or close the request — all from your inbox.',
    '',
    `View all your inquiries: ${inquiriesUrl}`,
    '',
    '— The OpusFesta team',
  ])

  const html = renderEmail({
    preheader,
    eyebrow: 'Inquiry · Sent',
    heading: 'Your request was sent!',
    sections: [
      {
        kind: 'paragraph',
        text: `${htmlGreeting} your inquiry to <strong>${escapeHtml(input.vendorName)}</strong> has been received. They'll get back to you soon.`,
      },
      {
        kind: 'detailRows',
        label: 'Inquiry details',
        rows: [
          { label: 'Vendor', value: input.vendorName },
          { label: 'Submitted', value: submittedDate },
          { label: 'Reference', value: input.inquiryId },
        ],
      },
      {
        kind: 'paragraph',
        text: 'When the vendor replies you can continue the conversation, review their proposal, and accept a quote — all from your OpusFesta inbox.',
      },
      { kind: 'cta', href: trackUrl, label: 'Track your request' },
      { kind: 'secondaryLink', href: inquiriesUrl, label: 'View all inquiries' },
    ],
    closing:
      'Questions? Reply to this email or reach us at <a href="mailto:hello@opusfesta.com">hello@opusfesta.com</a>.',
  })

  return { subject, text, html }
}
