// Best-effort orchestration for the two emails fired the moment a vendor
// submits an application:
//
//   1. Admin notification — pings the review team so they know the queue grew.
//   2. Vendor confirmation — receipts the vendor so they're not in the dark
//      while the admins look over the application.
//
// Both sends are best-effort: if Resend isn't configured, recipients can't be
// resolved, or a send fails, we log a warning and return. Email failure must
// NEVER fail the underlying submit — the vendor row + payout method are
// already persisted by the caller.

import { isEmailConfigured, sendEmail } from './email'
import { resolveAdminRecipients } from './admin-recipients'
import { buildVendorSubmitNotificationEmail } from './vendor-submit-notification-email'
import { buildVendorSubmitConfirmationEmail } from './vendor-submit-confirmation-email'
import { buildCategoryRequestNotificationEmail } from './category-request-notification-email'

export type NotifyOnSubmitInput = {
  vendorId: string
  vendorCode: string | null
  businessName: string
  category: string | null
  /** Set when the vendor chose "other" and typed a custom label. */
  customCategoryLabel: string | null
  region: string | null
  city: string | null
  vendorContactEmail: string | null
  vendorContactPhone: string | null
  submittedAt: string
}

function adminReviewUrl(vendorId: string): string {
  const raw =
    process.env.NEXT_PUBLIC_ADMIN_URL?.trim() ||
    process.env.NEXT_PUBLIC_OPUS_ADMIN_URL?.trim() ||
    'https://admin.opusfesta.com'
  return `${raw.replace(/\/$/, '')}/operations/vendors/${vendorId}`
}

function vendorPortalUrl(): string {
  // Live vendors portal. Override via NEXT_PUBLIC_VENDORS_PORTAL_URL (e.g.
  // http://localhost:3003 in local dev).
  return (
    process.env.NEXT_PUBLIC_VENDORS_PORTAL_URL?.trim() ||
    'https://vendorsportal.opusfesta.com'
  )
}

async function notifyAdmins(input: NotifyOnSubmitInput): Promise<void> {
  const { recipients, source } = await resolveAdminRecipients()
  if (recipients.length === 0) {
    console.warn(
      `[email] no admin recipients resolved for vendor=${input.vendorId} (source=${source}); skipping admin notify`,
    )
    return
  }

  const reviewLink = adminReviewUrl(input.vendorId)

  const message = buildVendorSubmitNotificationEmail({
    businessName: input.businessName,
    vendorCode: input.vendorCode,
    category: input.category,
    region: input.region,
    city: input.city,
    vendorContactEmail: input.vendorContactEmail,
    vendorContactPhone: input.vendorContactPhone,
    submittedAt: input.submittedAt,
    reviewLink,
  })

  const sends: Promise<void>[] = [
    sendEmail({ to: recipients, subject: message.subject, html: message.html, text: message.text })
      .then((result) => {
        if (!result.sent) {
          console.warn(
            `[email] admin submit notify failed (vendor=${input.vendorId}): ${result.reason}${result.error ? ` — ${result.error}` : ''}`,
          )
        }
      }),
  ]

  if (input.customCategoryLabel) {
    const catMessage = buildCategoryRequestNotificationEmail({
      businessName: input.businessName,
      vendorCode: input.vendorCode,
      requestedLabel: input.customCategoryLabel,
      reviewLink: `${adminReviewUrl(input.vendorId).replace('/operations/vendors/', '/operations/category-requests')}`,
      submittedAt: input.submittedAt,
    })
    sends.push(
      sendEmail({ to: recipients, subject: catMessage.subject, html: catMessage.html, text: catMessage.text })
        .then((result) => {
          if (!result.sent) {
            console.warn(
              `[email] category request notify failed (vendor=${input.vendorId}): ${result.reason}${result.error ? ` — ${result.error}` : ''}`,
            )
          }
        }),
    )
  }

  await Promise.allSettled(sends)
}

async function notifyVendor(input: NotifyOnSubmitInput): Promise<void> {
  const recipient = input.vendorContactEmail?.trim()
  if (!recipient) {
    console.warn(
      `[email] no vendor contact email for vendor=${input.vendorId}; skipping vendor receipt`,
    )
    return
  }

  const message = buildVendorSubmitConfirmationEmail({
    businessName: input.businessName,
    vendorCode: input.vendorCode,
    recipientEmail: recipient,
    submittedAt: input.submittedAt,
    portalUrl: vendorPortalUrl(),
  })

  const result = await sendEmail({
    to: recipient,
    subject: message.subject,
    html: message.html,
    text: message.text,
  })
  if (!result.sent) {
    console.warn(
      `[email] vendor submit receipt failed (vendor=${input.vendorId}): ${result.reason}${result.error ? ` — ${result.error}` : ''}`,
    )
  }
}

export async function notifyOnVendorSubmit(input: NotifyOnSubmitInput): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(
      `[email] RESEND_API_KEY not set — skipping submit notifications for vendor=${input.vendorId}`,
    )
    return
  }
  // Run both sends in parallel; each handles its own failure path so one
  // recipient bailing out does not block the other.
  await Promise.allSettled([notifyAdmins(input), notifyVendor(input)])
}
