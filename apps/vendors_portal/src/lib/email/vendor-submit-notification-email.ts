// Admin-facing email when a vendor submits a new application for review.
// Purpose: get the review team's eyes on the queue without polling the admin
// dashboard. Mirrors the editorial-notification chrome so admins recognize it
// as an OpusFesta system message.

import { renderEmail, plaintextLines, escapeHtml } from './email-shell'

export type VendorSubmitNotificationInput = {
  businessName: string
  category: string | null
  region: string | null
  city: string | null
  vendorContactEmail: string | null
  vendorContactPhone: string | null
  submittedAt: string
  reviewLink: string
  vendorCode: string | null
}

export function buildVendorSubmitNotificationEmail(
  input: VendorSubmitNotificationInput,
): { subject: string; text: string; html: string } {
  const business = input.businessName.trim() || 'New vendor'
  const reference = input.vendorCode?.trim() || null
  const subject = reference
    ? `[${reference}] New vendor application: ${business}`
    : `New vendor application: ${business}`
  const submittedDate = new Date(input.submittedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const location =
    [input.city?.trim(), input.region?.trim()].filter(Boolean).join(', ') || 'Not specified'
  const category = input.category?.trim() || 'Uncategorised'
  const contact =
    input.vendorContactEmail?.trim() ||
    input.vendorContactPhone?.trim() ||
    'No direct contact provided'

  const preheader = reference
    ? `${business} (${reference}) just submitted an application — open admin to review.`
    : `${business} just submitted an application — open admin to review.`

  const text = plaintextLines([
    `${business} submitted a vendor application for review.`,
    '',
    reference ? `Application reference: ${reference}` : null,
    `Category: ${category}`,
    `Location: ${location}`,
    `Vendor contact: ${contact}`,
    `Submitted: ${submittedDate}`,
    '',
    `Review in admin: ${input.reviewLink}`,
  ])

  const detailRows: Array<{ label: string; value: string }> = []
  if (reference) detailRows.push({ label: 'Application reference', value: reference })
  detailRows.push({ label: 'Category', value: category })
  detailRows.push({ label: 'Location', value: location })
  detailRows.push({ label: 'Vendor contact', value: contact })
  detailRows.push({ label: 'Submitted', value: submittedDate })

  const html = renderEmail({
    preheader,
    eyebrow: 'Vendors · New application',
    heading: 'A new vendor needs review',
    referenceCode: reference,
    sections: [
      {
        kind: 'paragraph',
        text: `<strong>${escapeHtml(business)}</strong> just submitted a vendor application and is awaiting verification — open the admin app to review their profile, documents, and approve or request corrections.`,
      },
      { kind: 'titleCard', title: business, meta: category },
      {
        kind: 'detailRows',
        label: 'Submission details',
        rows: detailRows,
      },
      { kind: 'cta', href: input.reviewLink, label: 'Open vendor review' },
    ],
  })

  return { subject, text, html }
}
