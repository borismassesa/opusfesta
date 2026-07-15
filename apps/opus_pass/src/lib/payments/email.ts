import 'server-only'

import { createElement } from 'react'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import { Resend } from 'resend'
import type { OrderRow } from './orders'
import { orderRowToStoredOrder } from './orders'
import { InvoicePdf } from '@/lib/invoice-pdf'

type EmailAttachment = { filename: string; content: Buffer }

// Best-effort invoice PDF — a render failure must never block the email.
async function invoicePdfAttachment(order: OrderRow): Promise<EmailAttachment | null> {
  try {
    const content = await renderToBuffer(
      createElement(InvoicePdf, { order: orderRowToStoredOrder(order) }) as ReactElement<DocumentProps>,
    )
    return { filename: `OpusFesta-Invoice-${order.ref}.pdf`, content }
  } catch (error) {
    console.error('[invitation-payments-email] invoice PDF render failed', error)
    return null
  }
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || 'OpusFesta <admin@opusfesta.com>'
}

function adminRecipients(): string[] {
  const raw =
    process.env.INVITATION_PAYMENTS_ADMIN_EMAIL ||
    process.env.FINANCE_EMAIL ||
    process.env.ADMIN_EMAIL ||
    ''
  return raw
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)
}

function formatTzs(value: number | string): string {
  return `TZS ${Number(value).toLocaleString('en-US')}`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function appUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_OPUS_ADMIN_URL ||
    process.env.NEXT_PUBLIC_OPUS_ADMIN_BASE_URL ||
    'https://admin.opusfesta.com'
  return `${base.replace(/\/$/, '')}${path}`
}

function orderRows(order: OrderRow): string {
  const rows = [
    ['Order', order.ref],
    ['Customer', order.contact_name || order.contact_email],
    ['Email', order.contact_email],
    ['Phone', order.contact_phone],
    ['Amount', formatTzs(order.amount_total)],
    ['Payer', order.payer_name || ''],
    ['Payer phone', order.payer_phone || ''],
    ['Payment reference', order.payment_reference || ''],
  ].filter(([, value]) => value)

  return rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:7px 0;color:#666;font-size:13px;">${escapeHtml(label)}</td>
          <td style="padding:7px 0;color:#111;font-size:13px;font-weight:600;text-align:right;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join('')
}

// The selected card's hero image, shown at the top of customer emails. Email
// clients may block remote images, so it's purely decorative — all order facts
// remain in the text rows below.
function heroImageHtml(order: OrderRow): string {
  const src = order.items.find((i) => i.image)?.image
  if (!src) return ''
  return `
      <tr><td align="center" style="padding:18px 28px 0;">
        <img src="${escapeHtml(src)}" alt="" width="120" style="width:120px;max-width:120px;height:auto;border-radius:8px;border:1px solid #e6e6e6;" />
      </td></tr>`
}

function emailShell(args: { preheader: string; heading: string; body: string; eyebrow?: string }): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#FAFAF8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1A1A1A;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(args.preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#fff;border:1px solid #e6e6e6;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px 0;">
                <p style="margin:0 0 16px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:#7E5896;">${escapeHtml(args.eyebrow ?? 'OpusFesta Invitations')}</p>
                <h1 style="margin:0;font-size:24px;line-height:1.25;font-weight:650;color:#1A1A1A;">${escapeHtml(args.heading)}</h1>
              </td>
            </tr>
            ${args.body}
            <tr>
              <td style="padding:24px 28px;border-top:1px solid #e6e6e6;color:#666;font-size:12px;line-height:1.6;">
                OpusFesta · Dar es Salaam, Tanzania
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

// Tanzanian mobile numbers are 255 + 9 digits (or local 0 + 9). Anything else
// gets flagged in the finance email so the reviewer double-checks it.
function isValidTzPhone(phone: string | null): boolean {
  const digits = (phone ?? '').replace(/\D/g, '')
  return /^255\d{9}$/.test(digits) || /^0\d{9}$/.test(digits)
}

// A single pledge/thank-you card design unlock, not a guest-tier invitation
// order — the "invitation" copy in these emails would be wrong (there's no
// tier/guest count, and nothing "moves into design"; it just unlocks).
function isTemplateOrder(order: OrderRow): boolean {
  return order.items[0]?.kind === 'template_unlock'
}

function formatDateTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Finance "payment needs verification" email — a focused review surface that
 * leads with the amount, surfaces the three fields the reviewer checks against
 * the mobile-money statement (amount, payer phone, reference), and flags an
 * invalid customer phone. Self-contained HTML (its own <style>) so it can use a
 * richer layout than the shared emailShell.
 */
function financeVerificationEmail(order: OrderRow): string {
  const item = order.items[0]
  const tier = item?.tier
  const planParts = [
    tier ? `${escapeHtml(tier)}${/signature/i.test(tier) ? ' ★' : ''}` : null,
    item?.guests != null ? `<span style="font-weight:500;color:#5B5249;">· ${item.guests.toLocaleString('en-US')} guests</span>` : null,
  ].filter(Boolean)
  const plan = planParts.length ? planParts.join(' &nbsp;') : '—'

  const customerName = order.contact_name || order.contact_email
  const phoneValid = isValidTzPhone(order.contact_phone)
  const submitted = formatDateTime(order.payment_submitted_at) || formatDateTime(order.paid_at)
  const reviewUrl = appUrl('/finance/payments')
  const amount = formatTzs(order.amount_total)

  const phoneCell = phoneValid
    ? `<div class="val mono">${escapeHtml(order.contact_phone)}</div>`
    : `<div class="val mono" style="color:#9B2C2C;">${escapeHtml(order.contact_phone || '—')}
         <span style="display:inline-block;font-size:11px;font-weight:700;color:#9B2C2C;background:#FBE9E9;border:1px solid #F0C9C9;border-radius:6px;padding:2px 7px;margin-left:6px;font-family:'Satoshi',Arial,sans-serif;">⚠ unusual format</span>
       </div>
       <div style="font-size:12px;color:#8A8278;margin-top:3px;">Not a valid TZ number (expected 255 + 9 digits).</div>`

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OpusPass · Payment needs verification</title>
<style>
  body { margin:0; padding:0; background:#FAF6EF; -webkit-font-smoothing:antialiased; }
  .card { max-width:560px; margin:0 auto; background:#FFFFFF; border:2px solid #1A1A1A; border-radius:18px; box-shadow:8px 8px 0 #7E5896; overflow:hidden; font-family:'Satoshi','Segoe UI',Helvetica,Arial,sans-serif; color:#1A1A1A; }
  .pad { padding:28px 32px; }
  .display { font-family:'Clash Display','Segoe UI',Helvetica,Arial,sans-serif; }
  a { color:#7E5896; }
  .row td { padding:13px 0; border-bottom:1px solid #EFE9DF; vertical-align:top; }
  .lbl { font-size:12px; letter-spacing:.04em; text-transform:uppercase; color:#8A8278; }
  .val { font-size:16px; font-weight:700; color:#1A1A1A; word-break:break-word; }
  .mono { font-family:'SF Mono',Menlo,Consolas,monospace; letter-spacing:.02em; }
  @media (max-width:480px){ .pad{ padding:22px 20px; } .hero-amt{ font-size:34px !important; } }
</style>
</head>
<body style="margin:0;padding:0;background:#FAF6EF;">
<div style="width:100%;background:#FAF6EF;padding:32px 16px;box-sizing:border-box;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(amount)} manual Lipa Namba payment awaiting your verification — order ${escapeHtml(order.ref)}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" class="card" cellpadding="0" cellspacing="0">

      <tr><td class="pad" style="padding-bottom:18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td align="left" style="font-size:0;">
            <span class="display" style="font-size:20px;font-weight:700;color:#7E5896;">OpusPass</span>
            <span style="font-size:12px;color:#8A8278;font-weight:500;"> &nbsp;by OpusFesta</span>
          </td>
          <td align="right">
            <span style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8A5A00;background:#FBEFD6;border:1px solid #E9CF9B;border-radius:999px;padding:6px 12px;">⏳ Awaiting verification</span>
          </td>
        </tr></table>
      </td></tr>

      <tr><td class="pad" style="padding-top:6px;padding-bottom:8px;">
        <div class="display" style="font-size:26px;line-height:1.2;font-weight:700;margin:0 0 6px;">Payment needs verification</div>
        <div style="font-size:15px;line-height:1.5;color:#5B5249;margin:0;">A customer submitted manual Lipa Namba details. Match them against your mobile-money statement before approving.</div>
      </td></tr>

      <tr><td class="pad" style="padding-top:8px;padding-bottom:8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4FBF6;border:1px solid #CDE7D6;border-radius:12px;">
          <tr><td style="padding:18px 20px 8px;">
            <div class="lbl" style="color:#2D6A4F;margin-bottom:10px;">Check these against your statement</div>
            <div style="font-size:13px;color:#8A8278;margin-bottom:2px;">Order total to confirm</div>
            <div class="hero-amt display" style="font-size:38px;font-weight:700;color:#1A1A1A;line-height:1;margin-bottom:4px;">${escapeHtml(amount)}</div>
            <div style="font-size:12px;color:#8A8278;">Confirm the customer paid this exact amount before approving.</div>
          </td></tr>
          <tr><td style="padding:6px 20px 18px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="50%" valign="top" style="padding-right:8px;">
                <div class="lbl" style="margin-bottom:4px;">Payer phone</div>
                <div class="val mono">${escapeHtml(order.payer_phone || '—')}</div>
              </td>
              <td width="50%" valign="top" style="padding-left:8px;">
                <div class="lbl" style="margin-bottom:4px;">Payment reference</div>
                <div class="val mono">${escapeHtml(order.payment_reference || '—')}</div>
              </td>
            </tr></table>
          </td></tr>
        </table>
      </td></tr>

      <tr><td class="pad" style="padding-top:8px;padding-bottom:8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr class="row"><td>
            <div class="lbl">Order</div>
            <div class="val mono">${escapeHtml(order.ref)}</div>
          </td></tr>
          <tr class="row"><td>
            <div class="lbl">Plan</div>
            <div class="val">${plan}</div>
          </td></tr>
          <tr class="row"><td>
            <div class="lbl">Customer</div>
            <div class="val">${escapeHtml(customerName)}</div>
            <div style="font-size:14px;color:#5B5249;margin-top:2px;"><a href="mailto:${escapeHtml(order.contact_email)}">${escapeHtml(order.contact_email)}</a></div>
          </td></tr>
          <tr class="row"><td>
            <div class="lbl">Customer phone</div>
            ${phoneCell}
          </td></tr>
          <tr class="row"><td style="border-bottom:none;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="50%" valign="top">
                <div class="lbl">Paid to</div>
                <div class="val mono">${escapeHtml(order.payment_label || 'M-Pesa Lipa Namba')}</div>
              </td>
              <td width="50%" valign="top">
                <div class="lbl">Submitted</div>
                <div class="val">${escapeHtml(submitted || '—')}</div>
              </td>
            </tr></table>
          </td></tr>
        </table>
      </td></tr>

      <tr><td class="pad" style="padding-top:14px;padding-bottom:8px;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#C9A0DC;border-radius:999px;">
          <a href="${escapeHtml(reviewUrl)}" style="display:inline-block;padding:14px 34px;color:#1A1A1A;font-weight:700;font-size:15px;text-decoration:none;font-family:'Satoshi',Arial,sans-serif;">Review &amp; verify this payment</a>
        </td></tr></table>
        <div style="margin-top:14px;">
          <a href="${escapeHtml(reviewUrl)}" style="font-size:13px;color:#8A8278;text-decoration:underline;">Open full payment queue</a>
        </div>
      </td></tr>

      <tr><td class="pad" style="padding-top:18px;border-top:1px solid #EFE9DF;">
        <div style="font-size:12px;color:#A39A8E;line-height:1.5;">
          You're receiving this because you're on the OpusPass finance approvals list.<br>
          OpusPass · a product of OpusFesta · Dar es Salaam, Tanzania
        </div>
      </td></tr>

    </table>
  </td></tr></table>
</div>
</body>
</html>`
}

async function send(args: {
  to: string | string[]
  subject: string
  html: string
  text: string
  attachments?: EmailAttachment[]
}) {
  if (!resend) return { sent: false as const, reason: 'not_configured' as const }
  const to = Array.isArray(args.to) ? args.to : [args.to]
  if (to.length === 0) return { sent: false as const, reason: 'no_recipient' as const }
  try {
    const result = await resend.emails.send({
      from: fromAddress(),
      to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      ...(args.attachments?.length ? { attachments: args.attachments } : {}),
    })
    if (result.error) {
      console.error('[invitation-payments-email] resend error', result.error)
      return { sent: false as const, reason: 'send_failed' as const }
    }
    return { sent: true as const }
  } catch (error) {
    console.error('[invitation-payments-email] send failed', error)
    return { sent: false as const, reason: 'send_failed' as const }
  }
}

export async function sendManualPaymentSubmittedEmails(order: OrderRow): Promise<{
  customerSent: boolean
  adminSent: boolean
}> {
  const isTemplate = isTemplateOrder(order)
  const customerHtml = emailShell({
    eyebrow: isTemplate ? 'OpusPass' : 'OpusFesta Invitations',
    preheader: `Invoice ${order.ref} is under payment review.`,
    heading: 'Your payment invoice is under review',
    body: `
      ${heroImageHtml(order)}
      <tr><td style="padding:16px 28px 0;color:#333;font-size:15px;line-height:1.65;">
        We received your Lipa Namba payment details. The OpusFesta team will confirm the transaction before your ${isTemplate ? 'design unlocks' : 'invitation order moves into design'}.
      </td></tr>
      <tr><td style="padding:18px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F0DFF6;background:#FCF7FF;border-radius:10px;padding:8px 14px;">
          ${orderRows(order)}
        </table>
      </td></tr>
      <tr><td style="padding:0 28px 22px;color:#666;font-size:13px;line-height:1.6;">
        Keep this email as your invoice while finance verifies the payment. We will email you again once it is approved.
      </td></tr>`,
  })

  const adminHtml = financeVerificationEmail(order)

  // The customer email always carries the invoice PDF (status: under review).
  const invoice = await invoicePdfAttachment(order)

  const [customer, admin] = await Promise.all([
    send({
      to: order.contact_email,
      subject: `Invoice ${order.ref} - payment under review`,
      html: customerHtml,
      text: `Invoice ${order.ref}\nAmount: ${formatTzs(order.amount_total)}\nPayment reference: ${order.payment_reference ?? ''}\nYour payment is under review.`,
      attachments: invoice ? [invoice] : undefined,
    }),
    send({
      to: adminRecipients(),
      subject: `${isTemplate ? 'Template' : 'Invitation'} payment submitted - ${order.ref}`,
      html: adminHtml,
      text: `Review ${isTemplate ? 'template' : 'invitation'} payment ${order.ref}\nAmount: ${formatTzs(order.amount_total)}\nPayer: ${order.payer_name ?? ''}\nPhone: ${order.payer_phone ?? ''}\nReference: ${order.payment_reference ?? ''}`,
    }),
  ])

  return { customerSent: customer.sent, adminSent: admin.sent }
}
