import { isEmailConfigured, sendEmail } from './email'
import { resolveAdminRecipients } from './admin-recipients'
import { renderEmail, plaintextLines, escapeHtml } from './email-shell'

// Notify the admin team when a vendor uploads a file in response to a document
// request. Best-effort: never throws, no-ops if email isn't configured.

function adminReviewUrl(vendorId: string): string {
  const raw =
    process.env.NEXT_PUBLIC_ADMIN_URL?.trim() ||
    process.env.NEXT_PUBLIC_OPUS_ADMIN_URL?.trim() ||
    'https://admin.opusfesta.com'
  return `${raw.replace(/\/$/, '')}/operations/vendors/${vendorId}`
}

export async function notifyAdminOfDocumentUpload(input: {
  vendorId: string
  businessName: string
  title: string
  filename: string
}): Promise<void> {
  if (!isEmailConfigured()) return
  try {
    const { recipients } = await resolveAdminRecipients()
    if (recipients.length === 0) return

    const name = escapeHtml(input.businessName)
    const title = escapeHtml(input.title)
    const reviewUrl = adminReviewUrl(input.vendorId)

    const html = renderEmail({
      preheader: `${input.businessName} uploaded a requested document.`,
      eyebrow: 'Vendors · Document upload',
      heading: 'A requested document was uploaded',
      sections: [
        { kind: 'paragraph', text: `<strong>${name}</strong> just uploaded a file for the document request "${title}".` },
        { kind: 'notesCard', label: 'Uploaded file', body: escapeHtml(input.filename) },
        { kind: 'paragraph', text: 'Open the vendor in the admin panel to preview it and mark the request complete.' },
        { kind: 'cta', href: reviewUrl, label: 'Review in admin panel' },
      ],
    })

    const text = plaintextLines([
      `${input.businessName} uploaded a file for the document request "${input.title}".`,
      '',
      `Uploaded file: ${input.filename}`,
      '',
      `Review in admin panel: ${reviewUrl}`,
    ])

    const result = await sendEmail({
      to: recipients,
      subject: `Document uploaded: ${input.businessName}`,
      html,
      text,
    })
    if (!result.sent) {
      console.warn(
        `[email] document upload notify failed (vendor=${input.vendorId}): ${result.reason}`,
      )
    }
  } catch (err) {
    console.warn('[email] document upload notify threw', err)
  }
}
