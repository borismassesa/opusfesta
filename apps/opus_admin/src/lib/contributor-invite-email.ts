// Email template for contributor invitations. Kept separate from the
// server action so we can reuse the same content for the mailto: fallback.

export type ContributorInviteEmailInput = {
  recipientEmail: string
  recipientName: string | null
  articleTitle: string | null
  inviteLink: string
  expiresAt: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildContributorInviteEmail(input: ContributorInviteEmailInput): {
  subject: string
  text: string
  html: string
} {
  const greetingName = input.recipientName?.trim() || input.recipientEmail
  const titleClause = input.articleTitle?.trim()
    ? ` on "${input.articleTitle.trim()}"`
    : ''
  const subject = input.articleTitle?.trim()
    ? `Invitation to write for OpusFesta — ${input.articleTitle.trim()}`
    : 'Invitation to write for OpusFesta Ideas & Advice'

  const expiry = new Date(input.expiresAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const text = [
    `Hi ${greetingName},`,
    '',
    `We'd love for you to write for OpusFesta's Ideas & Advice section${titleClause}.`,
    '',
    `Use this link to start drafting (it's scoped to your email — sign in with ${input.recipientEmail}):`,
    input.inviteLink,
    '',
    `This invitation expires on ${expiry}.`,
    '',
    "You can save drafts and submit your article for review without needing access to the admin tools. The editorial team will review and either publish your piece or send back notes.",
    '',
    'Looking forward to your story!',
    '— The OpusFesta team',
  ].join('\n')

  const html = `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FDFDFD;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFDFD;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border:1px solid #F1F1F1;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 8px;">
                <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;font-weight:700;color:#7E5896;">OpusFesta · Ideas &amp; Advice</p>
                <h1 style="margin:12px 0 0;font-size:22px;line-height:1.3;font-weight:600;color:#111;">Write for OpusFesta</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0;">
                <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#333;">Hi ${escapeHtml(greetingName)},</p>
                <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#333;">
                  We&rsquo;d love for you to write for OpusFesta&rsquo;s Ideas &amp; Advice section${
                    input.articleTitle?.trim()
                      ? ` on <strong>${escapeHtml(input.articleTitle.trim())}</strong>`
                      : ''
                  }.
                </p>
                <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#333;">
                  Click the button below to start drafting. The link is scoped to <strong>${escapeHtml(input.recipientEmail)}</strong> — sign in with that email when prompted.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 32px 4px;">
                <a href="${escapeHtml(input.inviteLink)}"
                   style="display:inline-block;background:#C9A0DC;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px;">
                  Open contributor workspace
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#666;word-break:break-all;">
                  Or copy this link: <a href="${escapeHtml(input.inviteLink)}" style="color:#7E5896;">${escapeHtml(input.inviteLink)}</a>
                </p>
                <p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#666;">
                  This invite expires on <strong>${escapeHtml(expiry)}</strong>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;">
                <p style="margin:0;font-size:14px;line-height:1.6;color:#444;">
                  You can save drafts and submit your article for review without needing access to the admin tools. The editorial team will review and either publish your piece or send back notes.
                </p>
                <p style="margin:18px 0 0;font-size:14px;line-height:1.6;color:#444;">Looking forward to your story.</p>
                <p style="margin:4px 0 0;font-size:14px;line-height:1.6;color:#444;">— The OpusFesta team</p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;font-size:12px;color:#999;">
            You received this because admin@opusfesta.com invited you to contribute. If this wasn&rsquo;t expected, ignore the email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()

  return { subject, text, html }
}
