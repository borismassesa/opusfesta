import { escapeHtml, plaintextLines, renderEmail, type EmailSection } from './email-shell'

// Email a vendor when an admin requests a specific document via a tokenized
// upload link. Bilingual (English + Kiswahili), mirroring vendor-status-email.ts.
// The CTA points at the public, no-login upload page on the vendors portal.

export type DocumentRequestEmailInput = {
  businessName: string
  recipientEmail: string
  // What the admin asked for (free text) + optional longer instructions.
  title: string
  details?: string | null
  // Public upload URL: `${vendorsPortalUrl}/upload/${token}`.
  uploadUrl: string
  // Human-readable vendor reference (e.g. "VND-10001"), shown in the header.
  vendorCode?: string | null
}

const SW_DIVIDER =
  '<span style="display:block;margin-top:24px;padding-top:18px;border-top:1px solid #ece6f2;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9b8aa8;">Kiswahili</span>'

export function buildDocumentRequestEmail(input: DocumentRequestEmailInput): {
  subject: string
  text: string
  html: string
} {
  const name = escapeHtml(input.businessName)
  const reference = input.vendorCode?.trim() || null
  const title = input.title.trim()
  const details = input.details?.trim() || ''

  const subjectCore = 'A document is requested for your OpusFesta account'
  const subject = reference ? `[${reference}] ${subjectCore}` : subjectCore

  const bodyEn = [
    `Our team needs a document from <strong>${name}</strong> to keep your OpusFesta account in good standing.`,
    'Tap the button below to upload it securely. You do not need to log in, and the link is private to you.',
  ]
  const bodySw = [
    `Timu yetu inahitaji hati kutoka kwa <strong>${name}</strong> ili kuendeleza akaunti yako ya OpusFesta vizuri.`,
    'Gusa kitufe hapa chini kupakia hati kwa usalama. Huhitaji kuingia, na kiungo hiki ni chako binafsi.',
  ]

  // The "what we need" card uses the admin's request title + optional details.
  const requestBody = details ? `${title}. ${details}` : title

  const text = plaintextLines([
    `Hi ${input.businessName},`,
    '',
    reference ? `Account reference: ${reference}` : null,
    reference ? '' : null,
    ...bodyEn.map(stripTags),
    '',
    `What we need: ${requestBody}`,
    '',
    'Kiswahili',
    '',
    `Habari ${input.businessName},`,
    '',
    ...bodySw.map(stripTags),
    '',
    `Tunachohitaji: ${requestBody}`,
    '',
    `Upload your document: ${input.uploadUrl}`,
    '',
    'The OpusFesta team',
  ])

  const sections: EmailSection[] = [
    { kind: 'statusBadge', label: 'Action requested', tone: 'warning' },
    { kind: 'paragraph', text: `Hi <strong>${name}</strong>,` },
    ...bodyEn.map((p) => ({ kind: 'paragraph' as const, text: p })),
    { kind: 'notesCard', label: 'What we need', body: requestBody },
    { kind: 'paragraph', text: SW_DIVIDER },
    { kind: 'paragraph', text: `Habari <strong>${name}</strong>,` },
    ...bodySw.map((p) => ({ kind: 'paragraph' as const, text: p })),
    { kind: 'cta', href: input.uploadUrl, label: 'Upload your document' },
  ]

  const html = renderEmail({
    preheader: 'Upload a document for your OpusFesta vendor account. No login needed.',
    eyebrow: 'Vendors · Document request',
    heading: 'A document is requested',
    referenceCode: reference,
    sections,
    footerNote:
      'You received this because you have an OpusFesta vendor account. This is an automated message; for help, contact vendors@opusfesta.com.',
  })

  return { subject, text, html }
}

function stripTags(paragraph: string): string {
  return paragraph
    .replace(/<strong>/g, '')
    .replace(/<\/strong>/g, '')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g, '$2 ($1)')
}
