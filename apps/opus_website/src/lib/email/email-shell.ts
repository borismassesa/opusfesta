export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function plaintextLines(lines: Array<string | null | undefined>): string {
  return lines.filter((line): line is string => typeof line === 'string').join('\n')
}

export function renderEmail(args: {
  heading: string
  preheader: string
  intro: string
  rows?: Array<{ label: string; value: string }>
  cta?: { href: string; label: string }
  closing?: string
}): string {
  const rows = (args.rows ?? [])
    .map(
      (row) =>
        `<tr><td style="padding:6px 0;font-size:14px;line-height:1.6;color:#333;"><strong style="color:#1A1A1A;">${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)}</td></tr>`,
    )
    .join('')

  const cta = args.cta
    ? `<tr><td style="padding-top:20px;"><a href="${escapeHtml(args.cta.href)}" style="display:inline-block;background:#C9A0DC;color:#1A1A1A;text-decoration:none;font-weight:700;font-size:14px;line-height:1;padding:12px 22px;border-radius:999px;">${escapeHtml(args.cta.label)}</a></td></tr>`
    : ''

  const closing = args.closing
    ? `<tr><td style="padding-top:18px;font-size:14px;line-height:1.65;color:#333;">${args.closing}</td></tr>`
    : ''

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(args.heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:#FAFAF8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1A1A;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(args.preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#fff;border:1px solid #E6E6E6;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:22px 26px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:#666;">OpusFesta</td>
            </tr>
            <tr>
              <td style="padding:12px 26px 0;"><h1 style="margin:0;font-size:24px;line-height:1.25;color:#1A1A1A;">${escapeHtml(args.heading)}</h1></td>
            </tr>
            <tr>
              <td style="padding:16px 26px 0;font-size:15px;line-height:1.65;color:#333;">${args.intro}</td>
            </tr>
            <tr>
              <td style="padding:14px 26px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>
              </td>
            </tr>
            ${cta}
            ${closing}
            <tr>
              <td style="padding:24px 26px 22px;border-top:1px solid #E6E6E6;margin-top:20px;font-size:12px;line-height:1.65;color:#666;">
                OpusFesta · Dar es Salaam, Tanzania
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()
}
