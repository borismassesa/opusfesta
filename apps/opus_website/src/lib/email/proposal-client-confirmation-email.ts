import { escapeHtml, plaintextLines, renderEmail } from './email-shell'

type Input = {
  clientName: string
  vendorName: string
  action: 'accept' | 'counter'
  inquiryUrl: string
}

export function buildProposalClientConfirmationEmail(input: Input) {
  const actionLabel = input.action === 'accept' ? 'accepted' : 'countered'
  const subject = `You ${actionLabel} a proposal from ${input.vendorName}`

  const text = plaintextLines([
    `Hi ${input.clientName},`,
    '',
    input.action === 'accept'
      ? `You accepted the proposal from ${input.vendorName}.`
      : `You sent a counter proposal to ${input.vendorName}.`,
    '',
    `View inquiry: ${input.inquiryUrl}`,
  ])

  const html = renderEmail({
    heading: input.action === 'accept' ? 'Proposal accepted' : 'Counter sent',
    preheader:
      input.action === 'accept'
        ? `You accepted ${input.vendorName}'s proposal.`
        : `You sent a counter proposal to ${input.vendorName}.`,
    intro:
      input.action === 'accept'
        ? `Hi <strong>${escapeHtml(input.clientName)}</strong>, you accepted <strong>${escapeHtml(input.vendorName)}</strong>'s proposal.`
        : `Hi <strong>${escapeHtml(input.clientName)}</strong>, you sent a counter proposal to <strong>${escapeHtml(input.vendorName)}</strong>.`,
    rows: [
      { label: 'Vendor', value: input.vendorName },
      { label: 'Action', value: input.action === 'accept' ? 'Proposal accepted' : 'Counter proposal sent' },
    ],
    cta: { href: input.inquiryUrl, label: 'Open inquiry thread' },
  })

  return { subject, text, html }
}
