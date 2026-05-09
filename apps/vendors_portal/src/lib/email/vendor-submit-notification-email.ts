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
}

export function buildVendorSubmitNotificationEmail(
  input: VendorSubmitNotificationInput,
): { subject: string; text: string; html: string } {
  const business = input.businessName.trim() || 'New vendor'
  const subject = `New vendor application: ${business}`
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

  const preheader = `${business} just submitted an application — open admin to review.`

  const text = plaintextLines([
    `${business} submitted a vendor application for review.`,
    '',
    `Category: ${category}`,
    `Location: ${location}`,
    `Vendor contact: ${contact}`,
    `Submitted: ${submittedDate}`,
    '',
    `Review in admin: ${input.reviewLink}`,
  ])

  const html = renderEmail({
    preheader,
    eyebrow: 'Vendors · New application',
    heading: 'A new vendor needs review',
    sections: [
      {
        kind: 'paragraph',
        text: `<strong>${escapeHtml(business)}</strong> just submitted a vendor application and is awaiting verification — open the admin app to review their profile, documents, and approve or request corrections.`,
      },
      { kind: 'titleCard', title: business, meta: category },
      {
        kind: 'detailRows',
        label: 'Submission details',
        rows: [
          { label: 'Category', value: category },
          { label: 'Location', value: location },
          { label: 'Vendor contact', value: contact },
          { label: 'Submitted', value: submittedDate },
        ],
      },
      { kind: 'cta', href: input.reviewLink, label: 'Open vendor review' },
    ],
  })

  return { subject, text, html }
}
