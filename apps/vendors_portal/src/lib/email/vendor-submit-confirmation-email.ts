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
  // Human-readable reference like "VND-10001" — populated from the vendors
  // row's vendor_code column. Surfaced in the subject and header so the
  // vendor (and our support team) can quote it when following up.
  vendorCode: string | null
}

export function buildVendorSubmitConfirmationEmail(
  input: VendorSubmitConfirmationInput,
): { subject: string; text: string; html: string } {
  const business = input.businessName.trim() || 'OpusFesta vendor'
  const reference = input.vendorCode?.trim() || null
  const subject = reference
    ? `[${reference}] We received your application — ${business}`
    : `We received your application — ${business}`
  const submittedDate = new Date(input.submittedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const portalBase = input.portalUrl.replace(/\/$/, '')
  const verifyUrl = `${portalBase}/verify`

  const preheader = reference
    ? `Application ${reference} is in our review queue. You'll hear from us within 1–2 business days.`
    : "Your application is in our review queue. You'll hear from us within 1–2 business days."

  const text = plaintextLines([
    `Hi ${business},`,
    '',
    'We just received your OpusFesta vendor application — thank you.',
    '',
    reference ? `Application reference: ${reference}` : null,
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

  const detailRows: Array<{ label: string; value: string }> = []
  if (reference) detailRows.push({ label: 'Application reference', value: reference })
  detailRows.push({ label: 'Business', value: business })
  detailRows.push({ label: 'Status', value: 'Verification pending' })
  detailRows.push({ label: 'Submitted', value: submittedDate })

  const html = renderEmail({
    preheader,
    eyebrow: 'Vendors · Application received',
    heading: 'We received your application',
    referenceCode: reference,
    sections: [
      {
        kind: 'paragraph',
        text: `Hi <strong>${escapeHtml(business)}</strong> — thanks for joining OpusFesta. Your application is in our review queue and we'll get back to you within 1–2 business days.`,
      },
      {
        kind: 'detailRows',
        label: 'Submission details',
        rows: detailRows,
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
