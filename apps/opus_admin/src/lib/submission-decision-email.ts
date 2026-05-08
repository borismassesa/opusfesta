// Author-facing emails for editorial review decisions:
//   - changes_requested: editor sent notes back, draft is editable again
//   - rejected: editor declined the submission
//   - approved: editor approved (and optionally published) the article
// All three use the shared email shell with OpusFesta's lavender accent
// (matches apps/opus_website + apps/vendors_portal).

import { renderEmail, plaintextLines, escapeHtml } from '@/lib/email-shell'

export type SubmissionDecisionInput = {
  authorName: string | null
  authorEmail: string
  articleTitle: string
  notes: string | null
  draftLink: string
  reviewer: { name: string | null; email: string | null }
}

export type SubmissionApprovedInput = SubmissionDecisionInput & {
  published: boolean
  publicLink: string | null
  excerpt: string | null
  heroImageUrl: string | null
}

function greetingName(input: { authorName: string | null; authorEmail: string }): string {
  return input.authorName?.trim() || input.authorEmail
}

function reviewerLabel(reviewerName: string | null): string {
  return reviewerName?.trim() || 'The OpusFesta editorial team'
}

export function buildChangesRequestedEmail(input: SubmissionDecisionInput): {
  subject: string
  text: string
  html: string
} {
  const greeting = greetingName(input)
  const reviewer = reviewerLabel(input.reviewer.name)
  const title = input.articleTitle?.trim() || 'your draft'
  const notes = input.notes?.trim() || ''
  const subject = `Editorial notes on "${title}"`
  const preheader = `You've got editorial notes — your draft is unlocked again.`

  const text = plaintextLines([
    `Hi ${greeting},`,
    '',
    `${reviewer} reviewed "${title}" and left notes for you. Your draft is unlocked so you can edit and resubmit when you're ready.`,
    '',
    notes ? 'Editor notes:' : null,
    notes || null,
    notes ? '' : null,
    `Open your draft: ${input.draftLink}`,
    '',
    'Thanks for writing with us — looking forward to the next pass.',
    `— ${reviewer}`,
  ])

  const html = renderEmail({
    preheader,
    eyebrow: 'Editorial · Notes',
    heading: 'Notes on your draft',
    sections: [
      {
        kind: 'paragraph',
        text: `Hi ${escapeHtml(greeting)},`,
      },
      {
        kind: 'paragraph',
        text: `<strong>${escapeHtml(reviewer)}</strong> reviewed your draft and left notes for you. The draft is unlocked again — edit and resubmit whenever you're ready.`,
      },
      { kind: 'titleCard', title, meta: 'Your draft' },
      ...(notes
        ? [{ kind: 'notesCard' as const, label: 'Editor notes', body: notes }]
        : []),
      { kind: 'cta', href: input.draftLink, label: 'Open your draft' },
    ],
    closing: 'Thanks for writing with us — we&rsquo;re looking forward to the next pass.',
    reviewer: {
      name: input.reviewer.name,
      email: input.reviewer.email,
      role: 'Editor, OpusFesta',
    },
  })

  return { subject, text, html }
}

export function buildSubmissionRejectedEmail(input: SubmissionDecisionInput): {
  subject: string
  text: string
  html: string
} {
  const greeting = greetingName(input)
  const reviewer = reviewerLabel(input.reviewer.name)
  const title = input.articleTitle?.trim() || 'your submission'
  const notes = input.notes?.trim() || ''
  const subject = `Editorial decision on "${title}"`
  const preheader = `We're not moving forward with this submission${notes ? ' — full reasoning inside.' : '.'}`

  const text = plaintextLines([
    `Hi ${greeting},`,
    '',
    `${reviewer} reviewed "${title}" and we've decided not to move forward with it this time.`,
    '',
    notes ? 'Editor reasoning:' : null,
    notes || null,
    notes ? '' : null,
    `View the submission: ${input.draftLink}`,
    '',
    "Thank you for taking the time to write — we'd love to see your next pitch.",
    `— ${reviewer}`,
  ])

  const html = renderEmail({
    preheader,
    eyebrow: 'Editorial · Decision',
    heading: 'Editorial decision on your submission',
    sections: [
      { kind: 'paragraph', text: `Hi ${escapeHtml(greeting)},` },
      {
        kind: 'paragraph',
        text: `<strong>${escapeHtml(reviewer)}</strong> reviewed your submission and we've decided not to move forward with it this time. We know that's not the news you were hoping for.`,
      },
      { kind: 'titleCard', title, meta: 'Your submission' },
      ...(notes
        ? [{ kind: 'notesCard' as const, label: 'Editor reasoning', body: notes }]
        : []),
      { kind: 'cta', href: input.draftLink, label: 'View submission' },
    ],
    closing:
      'Thank you for taking the time to write — we&rsquo;d genuinely love to see your next pitch.',
    reviewer: {
      name: input.reviewer.name,
      email: input.reviewer.email,
      role: 'Editor, OpusFesta',
    },
  })

  return { subject, text, html }
}

export function buildSubmissionApprovedEmail(input: SubmissionApprovedInput): {
  subject: string
  text: string
  html: string
} {
  const greeting = greetingName(input)
  const reviewer = reviewerLabel(input.reviewer.name)
  const title = input.articleTitle?.trim() || 'your article'
  const isLive = input.published

  const subject = isLive
    ? `Your article is live: "${title}"`
    : `Approved & queued: "${title}"`

  const preheader = isLive
    ? "Your article is live on OpusFesta — share the link with anyone who'd love it."
    : 'Your article was approved and is queued to publish soon.'

  const ctaHref = (isLive && input.publicLink) || input.draftLink
  const ctaLabel = isLive && input.publicLink ? 'Read your article' : 'View submission'

  const secondaryHref =
    isLive && input.publicLink && input.draftLink !== input.publicLink ? input.draftLink : null

  const sections: Parameters<typeof renderEmail>[0]['sections'] = [
    { kind: 'paragraph', text: `Hi ${escapeHtml(greeting)},` },
    {
      kind: 'paragraph',
      text: isLive
        ? `Great news — <strong>${escapeHtml(reviewer)}</strong> approved your article and it&rsquo;s now <strong>live on OpusFesta</strong>.`
        : `Great news — <strong>${escapeHtml(reviewer)}</strong> approved your article. It&rsquo;s queued and will be published shortly.`,
    },
    { kind: 'titleCard', title, meta: isLive ? 'Now published' : 'Approved · Queued' },
  ]

  if (input.heroImageUrl) {
    sections.push({ kind: 'heroImage', src: input.heroImageUrl, alt: title })
  }
  if (input.excerpt?.trim()) {
    sections.push({ kind: 'excerpt', text: input.excerpt.trim() })
  }
  sections.push({ kind: 'cta', href: ctaHref, label: ctaLabel })
  if (secondaryHref) {
    sections.push({ kind: 'secondaryLink', href: secondaryHref, label: 'Open submission in admin' })
  }

  const text = plaintextLines([
    `Hi ${greeting},`,
    '',
    isLive
      ? `Great news — ${reviewer} approved your article and it's now live on OpusFesta.`
      : `Great news — ${reviewer} approved your article. It's queued and will be published shortly.`,
    '',
    input.excerpt?.trim() ? `"${input.excerpt.trim()}"` : null,
    input.excerpt?.trim() ? '' : null,
    isLive && input.publicLink ? `Read it: ${input.publicLink}` : `View submission: ${input.draftLink}`,
    '',
    "Thank you for writing with us — we'd love to publish more from you.",
    `— ${reviewer}`,
  ])

  const html = renderEmail({
    preheader,
    eyebrow: 'Ideas & Advice · Published',
    heading: isLive ? 'Your article is live' : 'Your article was approved',
    sections,
    closing:
      'Thank you for writing with us — we&rsquo;d love to publish more of your work. If you have another piece in mind, just reply to this email.',
    reviewer: {
      name: input.reviewer.name,
      email: input.reviewer.email,
      role: 'Editor, OpusFesta',
    },
  })

  return { subject, text, html }
}
