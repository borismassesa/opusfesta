// Emails fired when a vendor's verification documents land in the admin review
// queue, i.e. when maybeTransitionToAdminReview flips the vendor to
// `admin_review`. Two recipients:
//   - admins: "ready for review" (or "corrections re-submitted")
//   - the vendor: a confirmation that we received the documents
// `resubmission` is true when the vendor came back from `needs_corrections`.

import { renderEmail, plaintextLines, escapeHtml } from './email-shell'

type AdminInput = {
  businessName: string
  vendorCode: string | null
  reviewUrl: string
  resubmission: boolean
}

export function buildVerificationAdminEmail(input: AdminInput): {
  subject: string
  text: string
  html: string
} {
  const business = input.businessName.trim() || 'A vendor'
  const reference = input.vendorCode?.trim() || null
  const core = input.resubmission
    ? `${business} re-submitted the documents you flagged`
    : `${business} completed verification and is ready for review`
  const subject = reference ? `[${reference}] ${core}` : core

  const lead = input.resubmission
    ? `${business} has re-uploaded the documents flagged during your last review. Their account is back in the review queue.`
    : `${business} has uploaded their identity documents and signed the vendor agreement. Their account is ready for final review.`

  const text = plaintextLines([
    lead,
    '',
    reference ? `Reference: ${reference}` : null,
    '',
    `Open the vendor review: ${input.reviewUrl}`,
  ])

  const html = renderEmail({
    preheader: input.resubmission
      ? 'A vendor re-submitted flagged documents.'
      : 'A vendor is ready for final review.',
    eyebrow: 'Vendors · Review',
    heading: input.resubmission
      ? 'Corrections re-submitted'
      : 'Ready for review',
    referenceCode: reference,
    sections: [
      { kind: 'paragraph', text: escapeHtml(lead) },
      { kind: 'cta', href: input.reviewUrl, label: 'Open the vendor review' },
    ],
  })

  return { subject, text, html }
}

type VendorInput = {
  businessName: string
  vendorCode: string | null
  verifyUrl: string
  resubmission: boolean
}

export function buildVerificationVendorEmail(input: VendorInput): {
  subject: string
  text: string
  html: string
} {
  const business = input.businessName.trim() || 'OpusFesta vendor'
  const reference = input.vendorCode?.trim() || null
  const core = input.resubmission
    ? 'We received your updated documents'
    : 'We received your documents'
  const subject = reference ? `[${reference}] ${core}` : core

  const lead = input.resubmission
    ? 'Thanks for re-uploading the documents we flagged. Your account is back with our review team, and re-reviews are typically completed within 1 business day.'
    : 'Thanks for completing verification. Your documents are now with our review team. Most vendors are approved within 2 to 3 business days, and we will email you the moment your dashboard unlocks.'

  const text = plaintextLines([
    `Hi ${business},`,
    '',
    lead,
    '',
    reference ? `Reference: ${reference}` : null,
    '',
    `Track your status: ${input.verifyUrl}`,
    '',
    'The OpusFesta team',
  ])

  const html = renderEmail({
    preheader: input.resubmission
      ? 'Your updated documents are back in review.'
      : 'Your documents are in review.',
    eyebrow: 'Vendors · Update',
    heading: input.resubmission
      ? 'Your updated documents are in review'
      : 'Your documents are in review',
    referenceCode: reference,
    sections: [
      {
        kind: 'paragraph',
        text: `Hi <strong>${escapeHtml(business)}</strong>,`,
      },
      { kind: 'paragraph', text: escapeHtml(lead) },
      { kind: 'cta', href: input.verifyUrl, label: 'Track your status' },
    ],
    closing:
      'Questions? Reply to this email or reach us at <a href="mailto:vendors@opusfesta.com">vendors@opusfesta.com</a>.',
  })

  return { subject, text, html }
}
