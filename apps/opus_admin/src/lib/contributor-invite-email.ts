// Email template for contributor invitations. Kept separate from the
// server action so we can reuse the same content for the mailto: fallback.

import { renderEmail, plaintextLines, escapeHtml } from '@/lib/email-shell'

export type ContributorInviteEmailInput = {
  recipientEmail: string
  recipientName: string | null
  articleTitle: string | null
  inviteLink: string
  expiresAt: string
}

export function buildContributorInviteEmail(input: ContributorInviteEmailInput): {
  subject: string
  text: string
  html: string
} {
  const greetingName = input.recipientName?.trim() || input.recipientEmail
  const articleTitle = input.articleTitle?.trim() || null
  const subject = articleTitle
    ? `Invitation to write for OpusFesta — ${articleTitle}`
    : 'Invitation to write for OpusFesta'

  const preheader = articleTitle
    ? `We'd love your voice on "${articleTitle}". Open the contributor workspace to start drafting.`
    : `We'd love your voice in OpusFesta's Ideas & Advice section.`

  const expiry = new Date(input.expiresAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const text = plaintextLines([
    `Hi ${greetingName},`,
    '',
    `We'd love for you to write for OpusFesta's Ideas & Advice section${
      articleTitle ? ` on "${articleTitle}"` : ''
    }.`,
    '',
    `Use this link to start drafting (it's scoped to ${input.recipientEmail}):`,
    input.inviteLink,
    '',
    `This invitation expires on ${expiry}.`,
    '',
    'You can save drafts and submit your article for review without admin access. The editorial team will review and either publish your piece or send back notes.',
    '',
    'Looking forward to your story.',
    '— The OpusFesta editorial team',
  ])

  const html = renderEmail({
    preheader,
    eyebrow: 'Ideas & Advice · Invitation',
    heading: articleTitle ? `Write with us: ${articleTitle}` : 'Write for OpusFesta',
    sections: [
      { kind: 'paragraph', text: `Hi ${escapeHtml(greetingName)},` },
      {
        kind: 'paragraph',
        text: articleTitle
          ? `We&rsquo;d love your voice on <strong>${escapeHtml(articleTitle)}</strong> for OpusFesta&rsquo;s Ideas &amp; Advice section.`
          : `We&rsquo;d love for you to write for OpusFesta&rsquo;s Ideas &amp; Advice section.`,
      },
      {
        kind: 'paragraph',
        text: `The link below is scoped to <strong>${escapeHtml(input.recipientEmail)}</strong> — sign in with that email when prompted. This invite expires on <strong>${escapeHtml(expiry)}</strong>.`,
      },
      { kind: 'cta', href: input.inviteLink, label: 'Open contributor workspace' },
      {
        kind: 'paragraph',
        text: `You&rsquo;ll be able to save drafts and submit your article for review — no admin access needed. The editorial team will read your piece and either publish it or send notes for another pass.`,
      },
    ],
    closing: 'Looking forward to your story.',
  })

  return { subject, text, html }
}
