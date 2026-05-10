// Shared chrome for transactional emails sent from vendors_portal. Kept in
// lockstep with apps/opus_admin/src/lib/email-shell.ts so the brand chrome
// (logo, accent, footer, dark-mode rules) renders identically regardless of
// which app sent the message.

export const BRAND = {
  accent: '#C9A0DC',
  accentHover: '#b97fd0',
  onAccent: '#1A1A1A',
  accentTintWash: '#FCF7FF',
  accentTintPale: '#F0DFF6',
  ink: {
    primary: '#1A1A1A',
    secondary: '#333333',
    muted: '#666666',
    line: '#E6E6E6',
  },
  surface: {
    page: '#FAFAF8',
    card: '#FFFFFF',
  },
} as const

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function logoUrl(): string {
  const raw = process.env.NEXT_PUBLIC_WEBSITE_URL?.trim() || 'https://opusfesta.com'
  return `${raw.replace(/\/$/, '')}/assets/logo/opusfesta-logo-black.png`
}

function preheaderHtml(text: string): string {
  if (!text) return ''
  const padding = '&zwnj;&nbsp;'.repeat(120)
  return `<div style="display:none !important;visibility:hidden;mso-hide:all;font-size:1px;color:${BRAND.surface.page};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(text)}${padding}</div>`
}

export function bulletproofButton(args: {
  href: string
  label: string
}): string {
  const href = escapeHtml(args.href)
  const label = escapeHtml(args.label)
  return `
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
      href="${href}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="50%" stroke="f"
      fillcolor="${BRAND.accent}">
      <w:anchorlock/>
      <center style="color:${BRAND.onAccent};font-family:sans-serif;font-size:14px;font-weight:700;">${label}</center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-- -->
    <a href="${href}"
       style="display:inline-block;background:${BRAND.accent};color:${BRAND.onAccent};text-decoration:none;font-weight:700;font-size:14px;line-height:1;padding:14px 26px;border-radius:999px;mso-padding-alt:0;">
      ${label}
    </a>
    <!--<![endif]-->`
}

function footerHtml(): string {
  return `
    <tr>
      <td style="padding:28px 32px 20px;border-top:1px solid ${BRAND.ink.line};">
        <p style="margin:0;font-size:12px;line-height:1.65;color:${BRAND.ink.muted};">
          OpusFesta · Dar es Salaam, Tanzania
        </p>
        <p style="margin:6px 0 0;font-size:12px;line-height:1.65;color:${BRAND.ink.muted};">
          Automated message — replies route to a human team member when applicable.
        </p>
      </td>
    </tr>`
}

export type EmailSection =
  | { kind: 'paragraph'; text: string }
  | { kind: 'titleCard'; title: string; meta?: string }
  | { kind: 'detailRows'; label?: string; rows: Array<{ label: string; value: string }> }
  | { kind: 'notesCard'; label: string; body: string }
  | { kind: 'cta'; href: string; label: string }
  | { kind: 'secondaryLink'; href: string; label: string }
  | { kind: 'spacer'; size?: number }

function renderSection(section: EmailSection): string {
  switch (section.kind) {
    case 'paragraph':
      return `<tr><td style="padding:0 32px;"><p style="margin:14px 0 0;font-size:15px;line-height:1.65;color:${BRAND.ink.secondary};">${section.text}</p></td></tr>`
    case 'titleCard': {
      const meta = section.meta
        ? `<p style="margin:8px 0 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:${BRAND.ink.muted};">${escapeHtml(section.meta)}</p>`
        : ''
      return `
        <tr>
          <td style="padding:18px 32px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface.page};border:1px solid ${BRAND.ink.line};border-left:4px solid ${BRAND.accent};border-radius:8px;">
              <tr>
                <td style="padding:14px 18px;">
                  <p style="margin:0;font-size:18px;line-height:1.35;font-weight:600;color:${BRAND.ink.primary};">${escapeHtml(section.title)}</p>
                  ${meta}
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    }
    case 'detailRows': {
      const label = section.label
        ? `<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:${BRAND.ink.primary};">${escapeHtml(section.label)}</p>`
        : ''
      const rows = section.rows
        .map(
          (r) => `<div style="font-size:14px;line-height:1.7;color:${BRAND.ink.secondary};">
            <strong style="color:${BRAND.ink.primary};">${escapeHtml(r.label)}:</strong> ${escapeHtml(r.value)}
          </div>`
        )
        .join('')
      return `
        <tr>
          <td style="padding:18px 32px 0;">
            ${label}
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.accentTintWash};border:1px solid ${BRAND.accentTintPale};border-radius:12px;">
              <tr><td style="padding:14px 18px;">${rows}</td></tr>
            </table>
          </td>
        </tr>`
    }
    case 'notesCard': {
      const blocks = section.body
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map(
          (p) =>
            `<p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:${BRAND.ink.secondary};white-space:pre-wrap;">${escapeHtml(p)}</p>`
        )
        .join('')
      return `
        <tr>
          <td style="padding:18px 32px 0;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:${BRAND.ink.primary};">${escapeHtml(section.label)}</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.accentTintWash};border:1px solid ${BRAND.accentTintPale};border-radius:12px;">
              <tr><td style="padding:14px 18px;">${blocks || `<p style="margin:0;color:${BRAND.ink.muted};font-size:14px;">No notes provided.</p>`}</td></tr>
            </table>
          </td>
        </tr>`
    }
    case 'cta':
      return `<tr><td align="center" style="padding:24px 32px 8px;">${bulletproofButton({ href: section.href, label: section.label })}</td></tr>`
    case 'secondaryLink':
      return `<tr><td align="center" style="padding:6px 32px 0;"><a href="${escapeHtml(section.href)}" style="color:${BRAND.ink.primary};text-decoration:underline;font-size:14px;">${escapeHtml(section.label)}</a></td></tr>`
    case 'spacer':
      return `<tr><td style="font-size:0;line-height:0;height:${section.size ?? 8}px;">&nbsp;</td></tr>`
  }
}

export function renderEmail(args: {
  preheader: string
  eyebrow: string
  heading: string
  sections: EmailSection[]
  closing?: string
}): string {
  const sections = args.sections.map((s) => renderSection(s)).join('')
  const closing = args.closing
    ? `<tr><td style="padding:18px 32px 0;"><p style="margin:0;font-size:14px;line-height:1.65;color:${BRAND.ink.secondary};">${args.closing}</p></td></tr>`
    : ''
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${escapeHtml(args.heading)}</title>
    <style>
      @media (prefers-color-scheme: dark) {
        body, .bg-page { background:#1A1718 !important; }
        .bg-card { background:#262122 !important; }
        .ink-primary { color:#F5F2F4 !important; }
        .ink-secondary { color:#D7CFD3 !important; }
        .ink-muted { color:#A39CA0 !important; }
        .border-line { border-color:#3A3335 !important; }
      }
      @media (max-width: 600px) {
        .container { width:100% !important; max-width:100% !important; }
        .px-32 { padding-left:20px !important; padding-right:20px !important; }
      }
      a { color:${BRAND.ink.primary}; }
    </style>
  </head>
  <body class="bg-page" style="margin:0;padding:0;background:${BRAND.surface.page};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.ink.primary};">
    ${preheaderHtml(args.preheader)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-page" style="background:${BRAND.surface.page};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" class="container bg-card" style="max-width:560px;width:100%;background:${BRAND.surface.card};border:1px solid ${BRAND.ink.line};border-radius:18px;overflow:hidden;">
            <tr>
              <td class="px-32 border-line" style="padding:24px 32px 0;border-bottom:1px solid ${BRAND.ink.line};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <img src="${escapeHtml(logoUrl())}" alt="OpusFesta" width="150" style="display:block;width:150px;max-width:150px;height:auto;border:0;outline:none;text-decoration:none;" />
                    </td>
                    <td align="right">
                      <span class="ink-muted" style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:${BRAND.ink.muted};">${escapeHtml(args.eyebrow)}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="px-32" style="padding:22px 32px 0;">
                <h1 class="ink-primary" style="margin:0;font-size:24px;line-height:1.25;font-weight:600;color:${BRAND.ink.primary};letter-spacing:-0.01em;">${escapeHtml(args.heading)}</h1>
              </td>
            </tr>
            ${sections}
            ${closing}
            <tr><td style="font-size:0;line-height:0;height:24px;">&nbsp;</td></tr>
            ${footerHtml()}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()
}

export function plaintextLines(lines: Array<string | null | undefined>): string {
  return lines.filter((line): line is string => typeof line === 'string').join('\n')
}
