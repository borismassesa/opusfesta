import 'server-only'

import { Resend } from 'resend'
import type { OrderRow } from './orders'

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

function emailShell(args: { preheader: string; heading: string; body: string }): string {
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
                <p style="margin:0 0 16px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:#7E5896;">OpusFesta Invitations</p>
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

async function send(args: { to: string | string[]; subject: string; html: string; text: string }) {
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
  const customerHtml = emailShell({
    preheader: `Invoice ${order.ref} is under payment review.`,
    heading: 'Your payment invoice is under review',
    body: `
      ${heroImageHtml(order)}
      <tr><td style="padding:16px 28px 0;color:#333;font-size:15px;line-height:1.65;">
        We received your Lipa Namba payment details. The OpusFesta team will confirm the transaction before your invitation order moves into design.
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

  const adminHtml = emailShell({
    preheader: `Manual Lipa Namba payment submitted for ${order.ref}.`,
    heading: 'Invitation payment needs approval',
    body: `
      <tr><td style="padding:16px 28px 0;color:#333;font-size:15px;line-height:1.65;">
        A customer submitted manual Lipa Namba payment details. Review the transaction in Finance → Invitation Payments.
      </td></tr>
      <tr><td style="padding:18px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F0DFF6;background:#FCF7FF;border-radius:10px;padding:8px 14px;">
          ${orderRows(order)}
        </table>
      </td></tr>
      <tr><td align="center" style="padding:0 28px 24px;">
        <a href="${escapeHtml(appUrl('/finance/payments'))}" style="display:inline-block;background:#C9A0DC;color:#1A1A1A;text-decoration:none;font-weight:700;font-size:14px;padding:13px 22px;border-radius:999px;">Open payment queue</a>
      </td></tr>`,
  })

  const [customer, admin] = await Promise.all([
    send({
      to: order.contact_email,
      subject: `Invoice ${order.ref} - payment under review`,
      html: customerHtml,
      text: `Invoice ${order.ref}\nAmount: ${formatTzs(order.amount_total)}\nPayment reference: ${order.payment_reference ?? ''}\nYour payment is under review.`,
    }),
    send({
      to: adminRecipients(),
      subject: `Invitation payment submitted - ${order.ref}`,
      html: adminHtml,
      text: `Review invitation payment ${order.ref}\nAmount: ${formatTzs(order.amount_total)}\nPayer: ${order.payer_name ?? ''}\nPhone: ${order.payer_phone ?? ''}\nReference: ${order.payment_reference ?? ''}`,
    }),
  ])

  return { customerSent: customer.sent, adminSent: admin.sent }
}
