import { escapeHtml, plaintextLines, renderEmail } from './email-shell'

type Input = {
  vendorName: string
  clientName: string
  clientEmail: string
  phone: string | null
  weddingDate: string | null
  guestCount: string | null
  location: string | null
  message: string | null
  portalUrl: string
}

export function buildInquiryVendorNotificationEmail(input: Input) {
  const subject = `New inquiry from ${input.clientName}`
  const intro = `<strong>${escapeHtml(input.clientName)}</strong> has sent a new inquiry to <strong>${escapeHtml(input.vendorName)}</strong> through OpusFesta.`

  const rows = [
    { label: 'Client', value: input.clientName },
    { label: 'Email', value: input.clientEmail },
    { label: 'Phone', value: input.phone ?? 'Not provided' },
    { label: 'Wedding date', value: input.weddingDate ?? 'Flexible / not specified' },
    { label: 'Guest count', value: input.guestCount ?? 'Not specified' },
    { label: 'Location', value: input.location ?? 'Not specified' },
  ]

  const text = plaintextLines([
    `New inquiry from ${input.clientName}.`,
    `Email: ${input.clientEmail}`,
    input.phone ? `Phone: ${input.phone}` : 'Phone: Not provided',
    input.weddingDate ? `Wedding date: ${input.weddingDate}` : 'Wedding date: Flexible / not specified',
    input.guestCount ? `Guest count: ${input.guestCount}` : 'Guest count: Not specified',
    input.location ? `Location: ${input.location}` : 'Location: Not specified',
    input.message ? `Message: ${input.message}` : null,
    '',
    `Open portal: ${input.portalUrl}`,
  ])

  const html = renderEmail({
    heading: 'You have a new inquiry',
    preheader: `New inquiry from ${input.clientName}.`,
    intro,
    rows,
    cta: { href: input.portalUrl, label: 'Open vendor portal' },
    closing: input.message
      ? `<strong>Client message:</strong><br/>${escapeHtml(input.message).replace(/\n/g, '<br/>')}`
      : undefined,
  })

  return { subject, text, html }
}
