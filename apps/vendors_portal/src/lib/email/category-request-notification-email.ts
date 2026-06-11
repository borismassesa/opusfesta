// Admin-facing email fired when a vendor submits with a custom "other" category.
// Gives the review team a clear signal that a new category has been requested
// so they can promote it via the admin CMS without digging through snapshots.

import { renderEmail, plaintextLines, escapeHtml } from './email-shell'

export type CategoryRequestNotificationInput = {
  businessName: string
  vendorCode: string | null
  requestedLabel: string
  reviewLink: string
  submittedAt: string
}

export function buildCategoryRequestNotificationEmail(
  input: CategoryRequestNotificationInput,
): { subject: string; text: string; html: string } {
  const business = input.businessName.trim() || 'A vendor'
  const reference = input.vendorCode?.trim() || null
  const label = input.requestedLabel.trim()

  const subject = reference
    ? `[${reference}] New category requested: "${label}"`
    : `New category requested: "${label}"`

  const submittedDate = new Date(input.submittedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const preheader = `${business} submitted with a custom category: "${label}" — review and add it to the CMS.`

  const text = plaintextLines([
    `${business} submitted a vendor application with a custom category.`,
    '',
    reference ? `Application reference: ${reference}` : null,
    `Requested category: ${label}`,
    `Submitted: ${submittedDate}`,
    '',
    `Review the request and add it to the vendor categories CMS:`,
    `${input.reviewLink}`,
  ])

  const html = renderEmail({
    preheader,
    eyebrow: 'Vendors · New category request',
    heading: `New category: "${escapeHtml(label)}"`,
    referenceCode: reference,
    sections: [
      {
        kind: 'paragraph',
        text: `<strong>${escapeHtml(business)}</strong> submitted their vendor application but their vendor type doesn't match an existing category. They've requested a new one — review it and add it to the <strong>Vendor Categories</strong> CMS if approved.`,
      },
      {
        kind: 'detailRows',
        label: 'Request details',
        rows: [
          ...(reference ? [{ label: 'Application reference', value: reference }] : []),
          { label: 'Requested category', value: label },
          { label: 'Business name', value: business },
          { label: 'Submitted', value: submittedDate },
        ],
      },
      { kind: 'cta', href: input.reviewLink, label: 'Review category request' },
    ],
  })

  return { subject, text, html }
}
