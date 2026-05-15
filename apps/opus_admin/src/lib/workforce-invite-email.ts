// Email template for workforce dashboard invitations. Sent when an admin
// grants a new employee access to the admin dashboard. The link drops
// the recipient on Clerk's hosted sign-up flow scoped to the invited
// email; once they pick a password they're redirected to /accept-invite
// which marks the invitation accepted.

import { renderEmail, plaintextLines, escapeHtml } from '@/lib/email-shell'

export type WorkforceInviteEmailInput = {
  recipientEmail: string
  recipientName: string
  roleName: string
  inviteLink: string
  expiresAt: string
}

export function buildWorkforceInviteEmail(input: WorkforceInviteEmailInput): {
  subject: string
  text: string
  html: string
} {
  const { recipientEmail, recipientName, roleName, inviteLink, expiresAt } = input

  const subject = `You're invited to the OpusFesta admin dashboard`
  const preheader = `${roleName} access · finish setting up your account.`

  const expiry = new Date(expiresAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const text = plaintextLines([
    `Hi ${recipientName},`,
    '',
    `You've been added to the OpusFesta admin team as ${roleName}.`,
    '',
    `Use the link below to finish setting up your account. You'll choose your own password — OpusFesta never sees it.`,
    '',
    inviteLink,
    '',
    `The link is scoped to ${recipientEmail} and expires on ${expiry}.`,
    '',
    'If you weren\'t expecting this invite, just ignore this email — no account will be created.',
    '',
    '— The OpusFesta team',
  ])

  const html = renderEmail({
    preheader,
    eyebrow: 'OpusFesta · Admin invitation',
    heading: `Welcome to OpusFesta, ${escapeHtml(recipientName)}`,
    sections: [
      { kind: 'paragraph', text: `Hi ${escapeHtml(recipientName)},` },
      {
        kind: 'paragraph',
        text: `You&rsquo;ve been added to the OpusFesta admin team as <strong>${escapeHtml(roleName)}</strong>. Use the button below to finish setting up your account — you&rsquo;ll pick your own password, so it&rsquo;s never shared with anyone.`,
      },
      { kind: 'cta', href: inviteLink, label: 'Set up my account' },
      {
        kind: 'paragraph',
        text: `This invite is scoped to <strong>${escapeHtml(recipientEmail)}</strong> and expires on <strong>${escapeHtml(expiry)}</strong>. If you weren&rsquo;t expecting it, you can safely ignore this email.`,
      },
    ],
    closing: 'See you on the dashboard.',
  })

  return { subject, text, html }
}
