// Branded HTML for the "please pledge a contribution" email — the email
// counterpart to the WhatsApp pledge-link template. Self-contained (own
// inline styles) so it renders consistently across email clients; the CTA
// button links straight to the couple's (possibly event-scoped) pledge page.

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface PledgeRequestEmail {
  subject: string
  html: string
  text: string
}

export function pledgeRequestEmail(coupleName: string, contactFirstName: string, link: string): PledgeRequestEmail {
  const couple = escapeHtml(coupleName)
  const firstName = escapeHtml(contactFirstName)
  const subject = `You're invited to contribute — ${coupleName}`
  const greeting = firstName ? `${firstName}, ` : ''

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#FAFAF8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1A1A1A;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${couple} would love your contribution toward their big day.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#fff;border:1px solid #ececf0;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 0;">
                <p style="margin:0 0 18px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:#7E5896;">OpusPass</p>
                <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:650;color:#1A1A1A;">💚 A pledge from you would mean a lot</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0;font-size:15px;line-height:1.6;color:#3a3742;">
                <p style="margin:0 0 12px;">${greeting}${couple} are preparing their wedding and would value your contribution.</p>
                <p style="margin:0;color:#8b8790;">Habari! ${couple} wanaandaa harusi yao na wangependa mchango wako.</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 32px 8px;">
                <a href="${link}" style="display:inline-block;background:#6B3FA0;color:#fff;font-weight:700;font-size:15px;text-decoration:none;padding:13px 28px;border-radius:999px;">
                  Pledge your contribution
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:4px 32px 28px;font-size:12px;color:#b6b2ba;word-break:break-all;">
                ${link}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #ececf0;color:#8b8790;font-size:12px;line-height:1.6;">
                Sent via OpusPass on behalf of ${couple} · Tanzania
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const text =
    `${greeting}${coupleName} are preparing their wedding and would value your contribution. ` +
    `Please pledge what you can here: ${link}\n\n` +
    `Habari! ${coupleName} wanaandaa harusi yao na wangependa mchango wako. Tafadhali weka kiasi unachoweza kuchangia hapa: ${link}`

  return { subject, html, text }
}
