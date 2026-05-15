import { escapeHtml, plaintextLines, renderEmail } from './email-shell'

type Input = {
  clientName: string
  vendorName: string
  inquiryId: string
  inquiryUrl: string
  weddingDate: string | null
  guestCount: string | null
  location: string | null
}

export function buildInquiryClientConfirmationEmail(input: Input) {
  const subject = `We received your inquiry for ${input.vendorName}`
  const intro = `Hi <strong>${escapeHtml(input.clientName)}</strong>, we have delivered your inquiry to <strong>${escapeHtml(input.vendorName)}</strong>. You can track all updates in your request thread.`

  const rows = [
    { label: 'Vendor', value: input.vendorName },
    { label: 'Inquiry ID', value: input.inquiryId },
    { label: 'Wedding date', value: input.weddingDate ?? 'Flexible / not specified' },
    { label: 'Guest count', value: input.guestCount ?? 'Not specified' },
    { label: 'Location', value: input.location ?? 'Not specified' },
  ]

  const text = plaintextLines([
    `Hi ${input.clientName},`,
    '',
    `We received your inquiry for ${input.vendorName}.`,
    `Inquiry ID: ${input.inquiryId}`,
    input.weddingDate ? `Wedding date: ${input.weddingDate}` : 'Wedding date: Flexible / not specified',
    input.guestCount ? `Guest count: ${input.guestCount}` : 'Guest count: Not specified',
    input.location ? `Location: ${input.location}` : 'Location: Not specified',
    '',
    `Track your request: ${input.inquiryUrl}`,
  ])

  const html = renderEmail({
    heading: 'Your inquiry is on its way',
    preheader: `Your request to ${input.vendorName} was sent successfully.`,
    intro,
    rows,
    cta: { href: input.inquiryUrl, label: 'Track your request' },
    closing:
      'You will get updates in your dashboard as vendors respond. If you have questions, just reply to this email.',
  })

  return { subject, text, html }
}
