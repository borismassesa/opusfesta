// Vendor lifecycle emails, sent from the admin app whenever an admin approves,
// suspends, reactivates, or requests corrections on a vendor. Uses the shared
// OpusFesta email shell so brand chrome (logo, accent, footer, dark-mode rules)
// matches the submit-confirmation/notification emails.
//
// Emails are BILINGUAL: each message renders the English copy first, then the
// same content in Swahili below a divider. We send both languages because the
// admin app has no stored per-vendor language preference, and many Tanzanian
// vendors read Swahili first. The admin's free-form `note` is shown once,
// verbatim, in whatever language the admin wrote it.

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
  // general clarification request. Optional; when absent, copy falls back to a
  // generic "see the portal for details" prompt. Not translated.
  note?: string | null
  // Vendors portal base URL, used to build the deep links the email buttons
  // point at (e.g. `${portalUrl}/verify`).
  portalUrl: string
  // Human-readable reference like "VND-10001", populated from the vendors row's
  // vendor_code column. Surfaced in the subject and header.
  vendorCode: string | null
}

type Variant = {
  // Inline chrome (subject, badge, button, note label) stays English; the
  // bilingual content lives in the body (English block, then Swahili block).
  subjectCore: string
  preheader: string
  badge: string
  badgeTone: 'positive' | 'negative' | 'warning'
  headline: string
  body: string[]
  body_sw: string[]
  ctaLabel: string
  ctaPath: string
  noteLabel: string | null
}

function variantFor(event: VendorStatusEvent, businessName: string): Variant {
  const name = escapeHtml(businessName)
  switch (event) {
    case 'approved':
      return {
        subjectCore: `You're approved: welcome to OpusFesta, ${businessName}`,
        preheader:
          'Your vendor account is live. Bookings, leads, and your storefront are now active.',
        badge: 'Approved',
        badgeTone: 'positive',
        headline: 'Your storefront is live',
        body: [
          `Great news: our team has reviewed and approved <strong>${name}</strong> on OpusFesta. Your dashboard is unlocked, your storefront is published, and couples can now find and book you.`,
          'Make the most of your first week: review your storefront once more, set your availability, and respond quickly to your first inquiries. Fast replies dramatically improve your booking rate.',
        ],
        body_sw: [
          `Habari njema: timu yetu imekagua na kuidhinisha <strong>${name}</strong> kwenye OpusFesta. Dashibodi yako imefunguliwa, duka lako limechapishwa, na wanandoa sasa wanaweza kukupata na kukuhifadhi.`,
          'Tumia vyema wiki yako ya kwanza: pitia duka lako tena, weka upatikanaji wako, na jibu maswali yako ya kwanza haraka. Majibu ya haraka huongeza sana nafasi yako ya kupata kazi.',
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
          `Our review team looked at <strong>${name}</strong>'s application and flagged something that needs to be corrected before we can approve you.`,
          'Open the verify page in your portal. Each flagged document shows the admin note explaining what to fix. Once you re-submit, we typically re-review within 1 business day.',
        ],
        body_sw: [
          `Timu yetu ya ukaguzi imepitia maombi ya <strong>${name}</strong> na imegundua jambo linalohitaji kurekebishwa kabla hatujakuidhinisha.`,
          'Fungua ukurasa wa uthibitishaji kwenye portal yako. Kila hati iliyotiwa alama inaonyesha maelezo ya msimamizi kuhusu cha kurekebisha. Ukiwasilisha tena, kwa kawaida tunakagua tena ndani ya siku 1 ya kazi.',
        ],
        ctaLabel: 'View what to fix',
        // Deep-link straight to the documents / re-upload section so the vendor
        // lands on the exact place they fix things, not the top of the page.
        ctaPath: '/verify#documents',
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
          `We've suspended <strong>${name}</strong>'s OpusFesta account. Bookings, leads, and storefront access are paused while the suspension is in effect.`,
          'If you believe this is a mistake or want to appeal, reply to this email or contact <a href="mailto:vendors@opusfesta.com">vendors@opusfesta.com</a>. We respond within one business day.',
        ],
        body_sw: [
          `Tumesimamisha akaunti ya <strong>${name}</strong> kwenye OpusFesta. Uhifadhi, miongozo, na ufikiaji wa duka vimesimamishwa wakati usimamishaji ukiendelea.`,
          'Ikiwa unaamini hili ni kosa au unataka kukata rufaa, jibu barua pepe hii au wasiliana na <a href="mailto:vendors@opusfesta.com">vendors@opusfesta.com</a>. Tunajibu ndani ya siku moja ya kazi.',
        ],
        ctaLabel: 'Open the portal',
        ctaPath: '/verify',
        noteLabel: 'Reason for suspension',
      }
    case 'reactivated':
      return {
        subjectCore: 'Welcome back: your OpusFesta account is reactivated',
        preheader:
          'Your vendor account is active again. Bookings, leads, and your storefront are restored.',
        badge: 'Reactivated',
        badgeTone: 'positive',
        headline: "You're back on OpusFesta",
        body: [
          `We've reactivated <strong>${name}</strong>'s OpusFesta account. Your dashboard, leads, and storefront are restored and couples can book you again.`,
          'If you have questions about what changed or how to keep your storefront in good standing, reach out to <a href="mailto:vendors@opusfesta.com">vendors@opusfesta.com</a>.',
        ],
        body_sw: [
          `Tumerejesha akaunti ya <strong>${name}</strong> kwenye OpusFesta. Dashibodi yako, miongozo, na duka vimerejeshwa na wanandoa wanaweza kukuhifadhi tena.`,
          'Ikiwa una maswali kuhusu kilichobadilika au jinsi ya kudumisha duka lako, wasiliana na <a href="mailto:vendors@opusfesta.com">vendors@opusfesta.com</a>.',
        ],
        ctaLabel: 'Open your dashboard',
        ctaPath: '/',
        noteLabel: null,
      }
  }
}

// A muted horizontal rule + "Kiswahili" eyebrow that separates the English
// block from the Swahili block.
const SW_DIVIDER =
  '<span style="display:block;margin-top:24px;padding-top:18px;border-top:1px solid #ece6f2;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9b8aa8;">Kiswahili</span>'

function stripTags(paragraph: string): string {
  return paragraph
    .replace(/<strong>/g, '')
    .replace(/<\/strong>/g, '')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g, '$2 ($1)')
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
    ...variant.body.map(stripTags),
    '',
    'Kiswahili',
    '',
    `Habari ${input.businessName},`,
    '',
    ...variant.body_sw.map(stripTags),
    showNote ? '' : null,
    showNote ? `${variant.noteLabel}: ${trimmedNote}` : null,
    '',
    `${variant.ctaLabel}: ${ctaUrl}`,
    '',
    'The OpusFesta team',
  ])

  const sections: EmailSection[] = [
    {
      kind: 'statusBadge',
      label: variant.badge,
      tone: variant.badgeTone,
    },
    {
      kind: 'paragraph',
      text: `Hi <strong>${escapeHtml(input.businessName)}</strong>,`,
    },
    ...variant.body.map((paragraph) => ({ kind: 'paragraph' as const, text: paragraph })),
    { kind: 'paragraph', text: SW_DIVIDER },
    {
      kind: 'paragraph',
      text: `Habari <strong>${escapeHtml(input.businessName)}</strong>,`,
    },
    ...variant.body_sw.map((paragraph) => ({ kind: 'paragraph' as const, text: paragraph })),
  ]
  if (showNote) {
    sections.push({
      kind: 'notesCard',
      label: variant.noteLabel as string,
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
    footerNote:
      'You received this because you have an OpusFesta vendor account. This is an automated message; for help, contact vendors@opusfesta.com.',
  })

  return { subject, text, html }
}
