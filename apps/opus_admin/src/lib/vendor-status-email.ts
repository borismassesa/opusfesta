// Vendor lifecycle emails — sent from the admin app whenever an admin
// approves, suspends, reactivates, or requests corrections on a vendor. Uses
// the shared OpusFesta email shell so brand chrome (logo, accent, footer,
// dark-mode rules) matches the submit-confirmation/notification emails.

import { renderEmail, plaintextLines, escapeHtml, type EmailSection } from '@/lib/email-shell'

export type VendorStatusEvent =
  | 'approved'
  | 'corrections_requested'
  | 'suspended'
  | 'reactivated'

export type VendorStatusEmailInput = {
  event: VendorStatusEvent
  businessName: string
  recipientEmail: string
  // Admin's free-form message: rejection reason, suspension reason, or
  // general clarification request. Optional — when absent, copy falls back
  // to a generic "see the portal for details" prompt.
  note?: string | null
  // Vendors portal base URL — used to build the deep links the email
  // buttons point at (e.g. `${portalUrl}/verify`).
  portalUrl: string
  // Human-readable reference like "VND-10001" — populated from the vendors
  // row's vendor_code column. Surfaced in the subject and header.
  vendorCode: string | null
}

type Variant = {
  subjectCore: string
  preheader: string
  badge: string
  badgeTone: 'positive' | 'negative' | 'warning'
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
        subjectCore: `You're approved — welcome to OpusFesta, ${businessName}`,
        preheader:
          'Your vendor account is live. Bookings, leads, and your storefront are now active.',
        badge: 'Approved',
        badgeTone: 'positive',
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
        subjectCore: 'Action needed on your OpusFesta application',
        preheader:
          'Our review team flagged a few items on your application. Open the portal to see the details.',
        badge: 'Action required',
        badgeTone: 'warning',
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
        subjectCore: 'Your OpusFesta vendor account has been suspended',
        preheader:
          'Bookings and storefront access are paused. Contact our team if you want to appeal.',
        badge: 'Suspended',
        badgeTone: 'negative',
        headline: 'Your vendor account is currently suspended',
        body: [
          `We've suspended <strong>${escapeHtml(businessName)}</strong>'s OpusFesta account. Bookings, leads, and storefront access are paused while the suspension is in effect.`,
          'If you believe this is a mistake or want to appeal, reply to this email or contact <a href="mailto:vendors@opusfesta.com">vendors@opusfesta.com</a> — we respond within one business day.',
        ],
        ctaLabel: 'Open the portal',
        ctaPath: '/pending',
        noteLabel: 'Reason for suspension',
      }
    case 'reactivated':
      return {
        subjectCore: 'Welcome back — your OpusFesta account is reactivated',
        preheader:
          'Your vendor account is active again. Bookings, leads, and your storefront are restored.',
        badge: 'Reactivated',
        badgeTone: 'positive',
        headline: "You're back on OpusFesta",
        body: [
          `We've reactivated <strong>${escapeHtml(businessName)}</strong>'s OpusFesta account. Your dashboard, leads, and storefront are restored and couples can book you again.`,
          'If you have questions about what changed or how to keep your storefront in good standing, reach out to <a href="mailto:vendors@opusfesta.com">vendors@opusfesta.com</a>.',
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
  const reference = input.vendorCode?.trim() || null
  const trimmedNote = input.note?.trim() || ''
  const showNote = !!variant.noteLabel && !!trimmedNote

  const subject = reference
    ? `[${reference}] ${variant.subjectCore}`
    : variant.subjectCore

  const text = plaintextLines([
    `Hi ${input.businessName},`,
    '',
    reference ? `Application reference: ${reference}` : null,
    reference ? '' : null,
    ...variant.body.map((paragraph) =>
      paragraph
        .replace(/<strong>/g, '')
        .replace(/<\/strong>/g, '')
        .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g, '$2 ($1)')
    ),
    showNote ? '' : null,
    showNote ? `${variant.noteLabel}: ${trimmedNote}` : null,
    '',
    `${variant.ctaLabel}: ${ctaUrl}`,
    '',
    '— The OpusFesta team',
  ])

  const sections: EmailSection[] = [
    { kind: 'statusBadge', label: variant.badge, tone: variant.badgeTone },
    {
      kind: 'paragraph',
      text: `Hi <strong>${escapeHtml(input.businessName)}</strong>,`,
    },
    ...variant.body.map((paragraph) => ({ kind: 'paragraph' as const, text: paragraph })),
  ]
  if (showNote) {
    sections.push({
      kind: 'notesCard',
      label: variant.noteLabel || 'Note',
      body: trimmedNote,
    })
  }
  sections.push({ kind: 'cta', href: ctaUrl, label: variant.ctaLabel })

  const html = renderEmail({
    preheader: variant.preheader,
    eyebrow: 'Vendors · Update',
    heading: variant.headline,
    referenceCode: reference,
    sections,
  })

  return { subject, text, html }
}
