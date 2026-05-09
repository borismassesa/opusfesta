// Vendor-facing receipt sent immediately after a successful application
// submission. The status-change emails (approved / corrections / suspended /
// reactivated) live in opus_admin's vendor-status-email; this fills the gap
// before any admin has touched the record so the vendor knows we received it.

import { renderEmail, plaintextLines, escapeHtml } from './email-shell'

export type VendorSubmitConfirmationInput = {
  businessName: string
  recipientEmail: string
  submittedAt: string
  portalUrl: string
}

export function buildVendorSubmitConfirmationEmail(
  input: VendorSubmitConfirmationInput,
): { subject: string; text: string; html: string } {
  const business = input.businessName.trim() || 'OpusFesta vendor'
  const subject = `We received your application — ${business}`
  const submittedDate = new Date(input.submittedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const portalBase = input.portalUrl.replace(/\/$/, '')
  const verifyUrl = `${portalBase}/verify`

  const preheader =
    'Your application is in our review queue. You\'ll hear from us within 1–2 business days.'

  const text = plaintextLines([
    `Hi ${business},`,
    '',
    'We just received your OpusFesta vendor application — thank you.',
    '',
    `Submitted: ${submittedDate}`,
    'Status: Verification pending',
    '',
    'What happens next:',
    '1. Our team reviews your profile and documents (typically 1–2 business days).',
    '2. We may reach out if anything needs to be clarified or corrected.',
    '3. Once approved, your storefront goes live and couples can book you.',
    '',
    `Track status / upload documents: ${verifyUrl}`,
    '',
    '— The OpusFesta team',
  ])

  const html = renderEmail({
    preheader,
    eyebrow: 'Vendors · Application received',
    heading: 'We received your application',
    sections: [
      {
        kind: 'paragraph',
        text: `Hi <strong>${escapeHtml(business)}</strong> — thanks for joining OpusFesta. Your application is in our review queue and we'll get back to you within 1–2 business days.`,
      },
      {
        kind: 'detailRows',
        label: 'Submission details',
        rows: [
          { label: 'Business', value: business },
          { label: 'Status', value: 'Verification pending' },
          { label: 'Submitted', value: submittedDate },
        ],
      },
      {
        kind: 'paragraph',
        text:
          'While you wait, you can finish uploading any verification documents in the portal. We\'ll email you again the moment your application moves forward.',
      },
      { kind: 'cta', href: verifyUrl, label: 'Open the portal' },
    ],
    closing:
      'Questions? Just reply to this email or reach us at <a href="mailto:vendors@opusfesta.com">vendors@opusfesta.com</a>.',
  })

  return { subject, text, html }
}
