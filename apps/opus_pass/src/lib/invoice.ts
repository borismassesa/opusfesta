import type { StoredOrder } from '@/lib/cart-storage'

const tzs = (n: number) =>
  `TZS ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

function formatDate(iso: string, offsetDays = 0): string {
  // Parse date-only values (YYYY-MM-DD, e.g. the event date) as local time so
  // they don't drift a day across timezones; full timestamps parse as-is.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  const d = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  if (offsetDays) d.setDate(d.getDate() + offsetDays)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Coloured tier pill — mirrors the classic/signature swatches used on the cart card. */
function tierPillStyle(item: StoredOrder['items'][number]): string {
  const key = (item.tierId ?? item.tier ?? '').toLowerCase()
  if (key === 'classic') return 'background:#EFE3FA;color:#6B4E8C;'
  if (key === 'signature') return 'background:#F5EACF;color:#8A6B1E;'
  return 'background:#f3f4f6;color:#374151;'
}

// Small inline clock to echo the lucide Clock icon on the cart/confirmation rows.
const CLOCK_SVG =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'

// Lucide-style icons labelling the "Billed to" fields (name / email / phone).
const ICON = (paths: string) =>
  `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
const USER_SVG = ICON('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>')
const MAIL_SVG = ICON('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>')
const PHONE_SVG = ICON('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>')

// Inline brand-coloured social icons for the letterhead footer. Inlined (not
// referenced) so they render in the printed PDF without any network fetch.
const SOCIAL_ICONS = [
  // Instagram — gradient rounded square
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-label="Instagram"><defs><linearGradient id="ig" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".45" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig)"/><rect x="6.2" y="6.2" width="11.6" height="11.6" rx="3.6" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="12" r="2.9" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="16.1" cy="7.9" r="1.05" fill="#fff"/></svg>',
  // Facebook — blue circle with f
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-label="Facebook"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path d="M13.7 12.6h1.8l.3-2.3h-2.1V8.9c0-.66.22-1.1 1.16-1.1h1.02V5.74c-.18-.02-.92-.08-1.78-.08-1.76 0-2.96 1.07-2.96 3.05v1.59H9.2v2.3h1.94V18h2.56z" fill="#fff"/></svg>',
  // TikTok — black rounded square with note
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-label="TikTok"><rect width="24" height="24" rx="6" fill="#010101"/><path d="M16.9 8.7a3.65 3.65 0 0 1-2.6-1.1v5.2a3.85 3.85 0 1 1-3.85-3.85c.18 0 .35.02.52.05v2.05a1.85 1.85 0 1 0 1.33 1.77V5.5h1.98a3.66 3.66 0 0 0 2.62 3.05z" fill="#fff"/></svg>',
  // LinkedIn — blue rounded square with in
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-label="LinkedIn"><rect width="24" height="24" rx="5" fill="#0A66C2"/><circle cx="7.6" cy="7.7" r="1.35" fill="#fff"/><rect x="6.35" y="9.9" width="2.5" height="7.1" fill="#fff"/><path d="M10.7 9.9h2.4v1c.42-.72 1.25-1.22 2.3-1.22 1.78 0 2.7 1.1 2.7 3.05V17h-2.5v-3.55c0-.92-.33-1.55-1.16-1.55-.7 0-1.1.47-1.28.93-.07.16-.08.39-.08.62V17h-2.5z" fill="#fff"/></svg>',
].join('')

function invoiceHtml(order: StoredOrder, origin: string): string {
  const rows = order.items
    .map((i) => {
      const packageRow = i.tier
        ? `<div class="item-meta-row"><span class="item-meta-label">Package</span><span class="tier-pill" style="${tierPillStyle(i)}">${esc(i.tier)}</span></div>`
        : ''
      const addOns =
        i.addOns && i.addOns.length > 0
          ? `<div class="item-meta-row item-addons"><span class="item-meta-label">Add-ons</span><ul class="addon-list">${i.addOns
              .map((a) => `<li>${esc(a)}</li>`)
              .join('')}</ul></div>`
          : ''
      const guests =
        i.guests != null
          ? `<div class="guest-block"><span class="guest-label">Guests</span><span class="guest-pill">${i.guests}</span></div>`
          : ''
      return `
      <div class="item-row">
        <div class="item-main">
          <div class="item-name">${esc(i.name)}</div>
          ${packageRow}
          ${addOns}
          <div class="item-delivery">${CLOCK_SVG}<span>Delivered within 24 hours</span></div>
        </div>
        <div class="item-right">
          ${guests}
          <div class="item-price">${tzs(i.total)}</div>
        </div>
      </div>`
    })
    .join('')

  const discountRow =
    order.discount > 0
      ? `<tr><td>Discount</td><td class="num">-${tzs(order.discount)}</td></tr>`
      : ''

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>OpusFesta-Invoice-${esc(order.ref)}</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  /* Drop the page margin so the browser omits its own date/title/URL/page
     headers and footers; spacing is handled by the sheet's own padding. */
  @page { margin: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1a1a1a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .sheet { max-width: 720px; margin: 0 auto; padding: 48px 40px 160px; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
  .brand-logo { display: block; height: 38px; width: auto; }
  .doc-title { text-align: right; }
  .doc-title h1 { margin: 0; font-size: 26px; letter-spacing: 0.12em; color: #1a1a1a; }
  .paid {
    display: inline-block; margin-top: 8px; padding: 5px 14px; border-radius: 999px;
    background: #ecfdf5; color: #047857; font-size: 13px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; border: 1px solid #6ee7b7;
  }
  .meta { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 32px; }
  .meta .block { font-size: 13px; line-height: 1.6; }
  .meta .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 2px; }
  .meta .val { color: #1a1a1a; font-weight: 600; }
  .meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, auto)); gap: 14px 32px; }
  .mi { font-size: 13px; line-height: 1.5; }
  .mi .label { margin-bottom: 1px; }
  .billed-to { text-align: right; }
  .bt-row { display: flex; align-items: center; justify-content: flex-end; gap: 6px; margin-top: 5px; color: #4b5563; }
  .bt-row svg { flex-shrink: 0; }
  .bt-val { font-weight: 600; color: #1a1a1a; }
  table { width: 100%; border-collapse: collapse; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .section-label {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
    color: #9ca3af; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;
  }
  /* Item rows — invoice lines carrying the cart line item's pills/details */
  .items { display: flex; flex-direction: column; }
  .item-row {
    display: flex; align-items: center; gap: 20px;
    padding: 16px 0; border-bottom: 1px solid #f3f4f6;
  }
  .item-main { flex: 1 1 auto; min-width: 0; }
  .item-name { font-weight: 600; font-size: 14px; color: #111827; }
  .item-meta-row { display: flex; align-items: baseline; gap: 8px; margin-top: 8px; }
  .item-addons { align-items: flex-start; }
  .item-meta-label {
    flex-shrink: 0; width: 58px; font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: #9ca3af; padding-top: 1px;
  }
  .tier-pill {
    display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.04em; padding: 3px 9px; border-radius: 4px;
  }
  .addon-list { margin: 0; padding: 0; list-style: none; font-size: 12px; color: #4b5563; }
  .addon-list li { position: relative; padding-left: 13px; line-height: 1.55; }
  .addon-list li::before { content: "•"; position: absolute; left: 2px; color: #9ca3af; }
  .item-delivery {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: #6b7280; margin-top: 10px;
  }
  .item-right { display: flex; align-items: center; gap: 24px; flex-shrink: 0; }
  .guest-block { display: flex; flex-direction: column; align-items: center; gap: 5px; }
  .guest-label {
    font-size: 9px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.04em; color: #9ca3af;
  }
  .guest-pill {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 48px; height: 30px; padding: 0 12px; border: 1px solid #e5e7eb;
    border-radius: 8px; background: #fff; font-size: 13px; font-weight: 600;
    color: #111827; font-variant-numeric: tabular-nums; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .item-price {
    font-size: 16px; font-weight: 600; color: #111827;
    white-space: nowrap; font-variant-numeric: tabular-nums;
  }
  .totals { margin-top: 18px; margin-left: auto; width: 280px; }
  .totals table td { border: none; padding: 6px 0; font-size: 14px; color: #4b5563; }
  .totals table td.num { color: #1a1a1a; font-weight: 600; }
  .totals .grand td { padding-top: 14px; border-top: 1px solid #e5e7eb; font-size: 17px; font-weight: 800; color: #1a1a1a; }
  .pay { margin-top: 28px; font-size: 13px; color: #4b5563; }
  .pay .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; }
  .footer { margin-top: 44px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; line-height: 1.6; text-align: center; }
  .support-note {
    margin: 16px auto 0; max-width: 460px; padding: 11px 16px; border-radius: 10px;
    background: #faf7fd; border: 1px solid #ece3f5; font-size: 11.5px; line-height: 1.55;
    color: #6b7280; text-align: center;
  }
  .support-note .support-strong { font-weight: 700; color: #5c2d8c; }
  .support-note strong { color: #1a1a1a; font-weight: 600; }
  /* Letterhead footer — pinned to the bottom of the printed page */
  .letterhead { position: fixed; left: 0; right: 0; bottom: 0; }
  .lh-inner { max-width: 720px; margin: 0 auto; padding: 0 40px 24px; }
  .lh-cols { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 14px; }
  .lh-company, .lh-contact { font-size: 10px; line-height: 1.55; color: #6b7280; flex: 1 1 0; }
  .lh-company { text-align: left; }
  .lh-contact { text-align: center; }
  .lh-name, .lh-web { font-weight: 700; color: #5c2d8c; }
  .lh-web { margin-bottom: 2px; }
  .lh-social { flex: 1 1 0; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .lh-social-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; }
  .lh-social-icons { display: flex; align-items: center; gap: 8px; }
  .lh-social svg { display: block; }
  .lh-bar { height: 5px; border-radius: 3px; background: #5c2d8c; }
  @media print {
    .sheet { padding: 40px 36px 150px; }
    .lh-inner { padding: 0 36px 32px; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <div class="top">
      <div>
        <img class="brand-logo" src="${origin}/assets/logo/OpusPass%20Logo.svg" alt="OpusPass" />
      </div>
      <div class="doc-title">
        <h1>INVOICE</h1>
        <div class="paid">Paid</div>
      </div>
    </div>

    <div class="meta">
      <div class="block meta-grid">
        <div class="mi"><div class="label">Order ID</div><div class="val">${esc(order.ref)}</div></div>
        ${formatDate(order.paidAt) ? `<div class="mi"><div class="label">Payment date</div><div>${formatDate(order.paidAt)}</div></div>` : ''}
        ${formatDate(order.paidAt) ? `<div class="mi"><div class="label">Delivery date</div><div>${formatDate(order.paidAt, 1)}</div></div>` : ''}
        ${order.eventDate && formatDate(order.eventDate) ? `<div class="mi"><div class="label">Event date</div><div>${formatDate(order.eventDate)}</div></div>` : ''}
      </div>
      <div class="block billed-to">
        <div class="label">Billed to</div>
        ${order.contact.name ? `<div class="bt-row"><span class="bt-val">${esc(order.contact.name)}</span>${USER_SVG}</div>` : ''}
        <div class="bt-row"><span>${esc(order.contact.email)}</span>${MAIL_SVG}</div>
        <div class="bt-row"><span>${esc(order.contact.phone)}</span>${PHONE_SVG}</div>
      </div>
    </div>

    <div class="section-label">Order summary</div>
    <div class="items" style="margin-top:4px">${rows}</div>

    <div class="totals">
      <table>
        <tr><td>Subtotal</td><td class="num">${tzs(order.subtotal)}</td></tr>
        ${discountRow}
        <tr><td>Delivery</td><td class="num">Free</td></tr>
        <tr class="grand"><td>Total paid</td><td class="num">${tzs(order.total)}</td></tr>
      </table>
    </div>

    ${
      order.paymentLabel
        ? `<div class="pay"><span class="label">Payment method</span><br/>${esc(order.paymentLabel)}</div>`
        : ''
    }

    <div class="footer">
      Thank you for choosing OpusPass. Your invitation will be prepared and activated within
      24 hours. We look forward to being part of your special day.
    </div>

    <div class="support-note">
      <span class="support-strong">Need changes?</span>
      Message us on WhatsApp at <strong>+255 799 242 475</strong> within 24 hours of delivery —
      one free round of revisions is included.
    </div>

    <div class="letterhead">
      <div class="lh-inner">
        <div class="lh-cols">
          <div class="lh-company">
            <div class="lh-name">OpusPass by OpusFesta</div>
            <div>OpusFesta Company Limited</div>
            <div>Samaki Wabichi Annex, Mbezi Beach</div>
            <div>P.O.Box 7787 Dar es Salaam, Tanzania</div>
          </div>
          <div class="lh-contact">
            <div class="lh-web">www.opusfesta.com</div>
            <div>info@opusfesta.com&nbsp;|&nbsp;+255 799 242 475</div>
          </div>
          <div class="lh-social">
            <span class="lh-social-label">Follow us</span>
            <div class="lh-social-icons">${SOCIAL_ICONS}</div>
          </div>
        </div>
        <div class="lh-bar"></div>
      </div>
    </div>
  </div>
</body>
</html>`
}

/**
 * Renders a branded invoice into a hidden iframe and opens the print dialog,
 * where the customer can "Save as PDF". No third-party dependency, and avoids
 * popup blockers (iframe rather than window.open).
 */
export function downloadInvoice(order: StoredOrder): void {
  if (typeof document === 'undefined') return

  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) {
    iframe.remove()
    return
  }

  doc.open()
  doc.write(invoiceHtml(order, window.location.origin))
  doc.close()

  const win = iframe.contentWindow!
  win.onafterprint = () => window.setTimeout(() => iframe.remove(), 500)

  let printed = false
  const triggerPrint = () => {
    if (printed) return
    printed = true
    win.focus()
    win.print()
  }

  // Wait for the logo (and any other images) to load so they appear in the
  // printed PDF; fall back to a fixed delay so we never hang on a failed load.
  const images = Array.from(doc.images)
  if (images.length === 0) {
    window.setTimeout(triggerPrint, 300)
  } else {
    Promise.all(
      images.map(
        (img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.onload = () => resolve()
                img.onerror = () => resolve()
              }),
      ),
    ).then(() => window.setTimeout(triggerPrint, 150))
    // Safety net in case an image never resolves.
    window.setTimeout(triggerPrint, 2000)
  }
}
