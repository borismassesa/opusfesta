// Editorial team notification when a contributor submits a draft for review.
// Mirrors the contributor-invite email style so both look like the same sender.

export type EditorialNotificationInput = {
  authorName: string | null
  authorEmail: string
  articleTitle: string
  category: string
  wordCount: number
  reviewLink: string
  submittedAt: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildEditorialNotificationEmail(input: EditorialNotificationInput): {
  subject: string
  text: string
  html: string
} {
  const author = input.authorName?.trim() || input.authorEmail
  const title = input.articleTitle?.trim() || 'Untitled draft'
  const subject = `New submission: ${title}`
  const submittedDate = new Date(input.submittedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const text = [
    `${author} submitted "${title}" for review.`,
    '',
    `Category: ${input.category}`,
    `Word count: ${input.wordCount.toLocaleString()}`,
    `Submitted: ${submittedDate}`,
    `Author: ${author} <${input.authorEmail}>`,
    '',
    `Open in admin: ${input.reviewLink}`,
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
                <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;font-weight:700;color:#7E5896;">OpusFesta · Submissions</p>
                <h1 style="margin:12px 0 0;font-size:22px;line-height:1.3;font-weight:600;color:#111;">New submission for review</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0;">
                <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#333;">
                  <strong>${escapeHtml(author)}</strong> submitted <strong>&ldquo;${escapeHtml(title)}&rdquo;</strong> and it&rsquo;s waiting in the queue.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F4FB;border:1px solid #E9DDF1;border-radius:12px;">
                  <tr>
                    <td style="padding:14px 18px;font-size:14px;line-height:1.7;color:#333;">
                      <div><strong style="color:#111;">Category:</strong> ${escapeHtml(input.category)}</div>
                      <div><strong style="color:#111;">Word count:</strong> ${input.wordCount.toLocaleString()}</div>
                      <div><strong style="color:#111;">Submitted:</strong> ${escapeHtml(submittedDate)}</div>
                      <div><strong style="color:#111;">Author:</strong> ${escapeHtml(author)} &lt;${escapeHtml(input.authorEmail)}&gt;</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:22px 32px 8px;">
                <a href="${escapeHtml(input.reviewLink)}"
                   style="display:inline-block;background:#5B2D8E;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px;">
                  Open in admin
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 28px;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#666;word-break:break-all;">
                  Or paste this link: <a href="${escapeHtml(input.reviewLink)}" style="color:#7E5896;">${escapeHtml(input.reviewLink)}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()

  return { subject, text, html }
}
