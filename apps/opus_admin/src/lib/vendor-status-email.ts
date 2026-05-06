// Email templates for vendor application lifecycle notifications. Sent from
// the admin app whenever an admin approves, suspends, reactivates, or requests
// corrections on a vendor — so the vendor doesn't have to refresh the portal
// to learn about the decision.

export type VendorStatusEvent =
  | 'approved'
  | 'corrections_requested'
  | 'suspended'
  | 'reactivated'

export type VendorStatusEmailInput = {
  event: VendorStatusEvent
  businessName: string
  recipientEmail: string
  /** Admin's free-form message: rejection reason, suspension reason, or
   *  general clarification request. Optional — when absent, copy falls back
   *  to a generic "see the portal for details" prompt. */
  note?: string | null
  /** Vendors portal base URL — used to build the deep links the email
   *  buttons point at (e.g. `${portalUrl}/verify`). */
  portalUrl: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

type Variant = {
  subject: string
  preheader: string
  badge: string
  badgeColor: string
  headline: string
  body: string[]
  ctaLabel: string
  ctaPath: string
  noteLabel: string | null
}

function variantFor(event: VendorStatusEvent, businessName: string): Variant {
  switch (event) {
    case 'approved':
      return {
        subject: `You're approved — welcome to OpusFesta, ${businessName}`,
        preheader:
          'Your vendor account is live. Bookings, leads, and your storefront are now active.',
        badge: 'Approved',
        badgeColor: '#15803D',
        headline: 'Your storefront is live',
        body: [
          `Great news — our team has reviewed and approved <strong>${escapeHtml(businessName)}</strong> on OpusFesta. Your dashboard is unlocked, your storefront is published, and couples can now find and book you.`,
          'Make the most of your first week: review your storefront once more, set your availability, and respond quickly to your first inquiries — fast replies dramatically improve your booking rate.',
        ],
        ctaLabel: 'Open your dashboard',
        ctaPath: '/',
        noteLabel: null,
      }
    case 'corrections_requested':
      return {
        subject: `Action needed on your OpusFesta application`,
        preheader:
          'Our review team flagged a few items on your application. Open the portal to see the details.',
        badge: 'Action required',
        badgeColor: '#B91C1C',
        headline: 'A few items need your attention',
        body: [
          `Our review team looked at <strong>${escapeHtml(businessName)}</strong>'s application and flagged something that needs to be corrected before we can approve you.`,
          'Open the verify page in your portal — each flagged document shows the admin note explaining what to fix. Once you re-submit, we typically re-review within 1 business day.',
        ],
        ctaLabel: 'View what to fix',
        ctaPath: '/verify',
        noteLabel: 'Note from the review team',
      }
    case 'suspended':
      return {
        subject: `Your OpusFesta vendor account has been suspended`,
        preheader:
          'Bookings and storefront access are paused. Contact our team if you want to appeal.',
        badge: 'Suspended',
        badgeColor: '#B91C1C',
        headline: 'Your vendor account is currently suspended',
        body: [
          `We've suspended <strong>${escapeHtml(businessName)}</strong>'s OpusFesta account. Bookings, leads, and storefront access are paused while the suspension is in effect.`,
          'If you believe this is a mistake or want to appeal, reply to this email or contact <a href="mailto:vendors@opusfesta.com" style="color:#7E5896;">vendors@opusfesta.com</a> — we respond within one business day.',
        ],
        ctaLabel: 'Open the portal',
        ctaPath: '/pending',
        noteLabel: 'Reason for suspension',
      }
    case 'reactivated':
      return {
        subject: `Welcome back — your OpusFesta account is reactivated`,
        preheader:
          "Your vendor account is active again. Bookings, leads, and your storefront are restored.",
        badge: 'Reactivated',
        badgeColor: '#15803D',
        headline: "You're back on OpusFesta",
        body: [
          `We've reactivated <strong>${escapeHtml(businessName)}</strong>'s OpusFesta account. Your dashboard, leads, and storefront are restored and couples can book you again.`,
          'If you have questions about what changed or how to keep your storefront in good standing, reach out to <a href="mailto:vendors@opusfesta.com" style="color:#7E5896;">vendors@opusfesta.com</a>.',
        ],
        ctaLabel: 'Open your dashboard',
        ctaPath: '/',
        noteLabel: null,
      }
  }
}

export function buildVendorStatusEmail(input: VendorStatusEmailInput): {
  subject: string
  text: string
  html: string
} {
  const variant = variantFor(input.event, input.businessName)
  const portalBase = input.portalUrl.replace(/\/$/, '')
  const ctaUrl = `${portalBase}${variant.ctaPath}`
  const trimmedNote = input.note?.trim() || ''
  const showNote = !!variant.noteLabel && !!trimmedNote

  const textLines = [
    `Hi ${input.businessName},`,
    '',
    ...variant.body.map((paragraph) =>
      paragraph
        .replace(/<strong>/g, '')
        .replace(/<\/strong>/g, '')
        .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g, '$2 ($1)')
    ),
  ]
  if (showNote) {
    textLines.push('', `${variant.noteLabel}: ${trimmedNote}`)
  }
  textLines.push(
    '',
    `${variant.ctaLabel}: ${ctaUrl}`,
    '',
    '— The OpusFesta team'
  )

  const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(variant.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#FDFDFD;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111;">
    <span style="display:none;font-size:0;line-height:0;color:transparent;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(variant.preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFDFD;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border:1px solid #F1F1F1;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 8px;">
                <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;font-weight:700;color:#7E5896;">OpusFesta · Vendors</p>
                <p style="margin:14px 0 0;">
                  <span style="display:inline-block;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:${variant.badgeColor};background:${variant.badgeColor}14;border:1px solid ${variant.badgeColor}33;padding:4px 10px;border-radius:999px;">${escapeHtml(variant.badge)}</span>
                </p>
                <h1 style="margin:14px 0 0;font-size:22px;line-height:1.3;font-weight:600;color:#111;">${escapeHtml(variant.headline)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0;">
                <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#333;">Hi ${escapeHtml(input.businessName)},</p>
                ${variant.body
                  .map(
                    (paragraph) =>
                      `<p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#333;">${paragraph}</p>`
                  )
                  .join('\n                ')}
              </td>
            </tr>
            ${
              showNote
                ? `<tr>
              <td style="padding:18px 32px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border:1px solid #EDE6DA;border-radius:12px;">
                  <tr>
                    <td style="padding:14px 16px;">
                      <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:#6B5B45;">${escapeHtml(variant.noteLabel || '')}</p>
                      <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#3F3525;white-space:pre-wrap;">${escapeHtml(trimmedNote)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`
                : ''
            }
            <tr>
              <td align="center" style="padding:24px 32px 4px;">
                <a href="${escapeHtml(ctaUrl)}"
                   style="display:inline-block;background:#111;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:999px;">
                  ${escapeHtml(variant.ctaLabel)}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#666;word-break:break-all;">
                  Or open this link directly: <a href="${escapeHtml(ctaUrl)}" style="color:#7E5896;">${escapeHtml(ctaUrl)}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;">
                <p style="margin:18px 0 0;font-size:14px;line-height:1.6;color:#444;">— The OpusFesta team</p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;font-size:12px;color:#999;">
            You received this because you have an OpusFesta vendor account. Questions? Email <a href="mailto:vendors@opusfesta.com" style="color:#7E5896;">vendors@opusfesta.com</a>.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()

  return {
    subject: variant.subject,
    text: textLines.join('\n'),
    html,
  }
}
