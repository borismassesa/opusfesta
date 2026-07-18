import 'server-only'
import { sendEmail } from '@/lib/email'
import { getWhatsAppProvider } from '@/lib/whatsapp'

// Best-effort "claim receipt" messaging — sent to both the claiming guest
// and the couple right after a successful gift-registry claim, so the guest
// knows exactly where to buy the gift (most gifts here are bought in person
// at a Tanzanian shop, not shipped) and the couple can reach the guest to
// say thank you. Mirrors the dry-run-aware, never-throw pattern used by
// sendPledgeReminderSms/sendPledgeReminderEmail — a missing gateway/API key
// degrades to a logged no-op, it never breaks the claim itself.

export type ReceiptLang = 'sw' | 'en'

export interface ReceiptGift {
  title: string
  priceLabel: string | null
  shopName: string | null
  shopLocation: string | null
  shopContact: string | null
  productLink: string | null
}

function whereToBuyLines(gift: ReceiptGift, lang: ReceiptLang): string[] {
  const lines: string[] = []
  if (gift.shopName || gift.shopLocation || gift.shopContact) {
    if (gift.shopName) lines.push(lang === 'sw' ? `Duka: ${gift.shopName}` : `Shop: ${gift.shopName}`)
    if (gift.shopLocation) lines.push(lang === 'sw' ? `Eneo: ${gift.shopLocation}` : `Location: ${gift.shopLocation}`)
    if (gift.shopContact) lines.push(lang === 'sw' ? `Mawasiliano ya duka: ${gift.shopContact}` : `Shop contact: ${gift.shopContact}`)
  } else if (gift.productLink) {
    lines.push(lang === 'sw' ? `Nunua mtandaoni: ${gift.productLink}` : `Buy online: ${gift.productLink}`)
  }
  return lines
}

function buildGuestReceiptText(guestName: string, coupleName: string, gift: ReceiptGift, lang: ReceiptLang): string {
  const intro =
    lang === 'sw'
      ? `Asante ${guestName}! Umechukua "${gift.title}" kutoka orodha ya zawadi ya ${coupleName}. 💚`
      : `Thank you ${guestName}! You've claimed "${gift.title}" from ${coupleName}'s gift registry. 💚`
  const price = gift.priceLabel ? (lang === 'sw' ? `Bei: ${gift.priceLabel}` : `Price: ${gift.priceLabel}`) : null
  const shopLines = whereToBuyLines(gift, lang)
  const footer = lang === 'sw' ? 'Asante kwa upendo wako!' : 'Thank you for your generosity!'
  return [intro, price, ...shopLines, footer].filter(Boolean).join('\n')
}

function buildCoupleReceiptText(
  guestName: string,
  guestPhone: string,
  guestEmail: string | null,
  gift: ReceiptGift,
  lang: ReceiptLang,
): string {
  const intro =
    lang === 'sw'
      ? `${guestName} amechukua "${gift.title}" kutoka orodha yenu ya zawadi! 🎁`
      : `${guestName} claimed "${gift.title}" from your gift registry! 🎁`
  const contact =
    lang === 'sw'
      ? `Mawasiliano ya mgeni: ${guestPhone}${guestEmail ? ` · ${guestEmail}` : ''}`
      : `Guest contact: ${guestPhone}${guestEmail ? ` · ${guestEmail}` : ''}`
  return [intro, contact].join('\n')
}

function toHtml(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#1A1A1A;white-space:pre-line">${escaped}</div>`
}

export interface SendReceiptsInput {
  gift: ReceiptGift
  coupleName: string
  guestName: string
  guestPhone: string
  guestEmail: string | null
  coupleEmail: string | null
  couplePhone: string | null
  lang: ReceiptLang
}

export interface SendReceiptsResult {
  guestEmailSent: boolean
  guestWhatsAppSent: boolean
  coupleEmailSent: boolean
  coupleWhatsAppSent: boolean
}

/** Never throws — every channel is best-effort and independently guarded. */
export async function sendGiftClaimReceipts(input: SendReceiptsInput): Promise<SendReceiptsResult> {
  const guestText = buildGuestReceiptText(input.guestName, input.coupleName, input.gift, input.lang)
  const coupleText = buildCoupleReceiptText(input.guestName, input.guestPhone, input.guestEmail, input.gift, input.lang)
  const wa = getWhatsAppProvider()

  const guestSubject = input.lang === 'sw' ? `Umechukua zawadi: ${input.gift.title}` : `You claimed a gift: ${input.gift.title}`
  const coupleSubject =
    input.lang === 'sw' ? `${input.guestName} amechukua zawadi` : `${input.guestName} claimed a gift`

  const [guestEmailResult, guestWaResult, coupleEmailResult, coupleWaResult] = await Promise.allSettled([
    input.guestEmail
      ? sendEmail({ to: input.guestEmail, subject: guestSubject, html: toHtml(guestText), text: guestText })
      : Promise.resolve(null),
    wa.sendText(input.guestPhone, guestText),
    input.coupleEmail
      ? sendEmail({ to: input.coupleEmail, subject: coupleSubject, html: toHtml(coupleText), text: coupleText })
      : Promise.resolve(null),
    input.couplePhone ? wa.sendText(input.couplePhone, coupleText) : Promise.resolve(null),
  ])

  const guestEmailSent = guestEmailResult.status === 'fulfilled' && guestEmailResult.value?.sent === true
  const guestWhatsAppSent = guestWaResult.status === 'fulfilled' && guestWaResult.value?.ok === true && !guestWaResult.value?.dryRun
  const coupleEmailSent = coupleEmailResult.status === 'fulfilled' && coupleEmailResult.value?.sent === true
  const coupleWhatsAppSent =
    coupleWaResult.status === 'fulfilled' && coupleWaResult.value?.ok === true && !coupleWaResult.value?.dryRun

  if (guestEmailResult.status === 'rejected') console.error('[gift-registry] guest receipt email failed', guestEmailResult.reason)
  if (guestWaResult.status === 'rejected') console.error('[gift-registry] guest receipt WhatsApp failed', guestWaResult.reason)
  if (coupleEmailResult.status === 'rejected') console.error('[gift-registry] couple receipt email failed', coupleEmailResult.reason)
  if (coupleWaResult.status === 'rejected') console.error('[gift-registry] couple receipt WhatsApp failed', coupleWaResult.reason)

  return { guestEmailSent, guestWhatsAppSent, coupleEmailSent, coupleWhatsAppSent }
}
