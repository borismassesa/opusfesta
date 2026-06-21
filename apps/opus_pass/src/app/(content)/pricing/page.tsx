import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Check, ArrowRight, Sparkles, PartyPopper, Gem, Crown, ShieldCheck, Lock } from 'lucide-react'
import { loadPackagesContent } from '@/lib/cms/packages'
import { FAQItem } from '@/app/invitations/FAQAccordion'
import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'

// Tier data comes from the per-guest packages CMS (loadPackagesContent); the
// page's own chrome (headings, badges, FAQ, security copy) comes from the Site UI
// "pricing" area, resolved per-locale from the locale cookie — so the page must
// never be baked into a shared cache (which would serve one visitor's language to
// all). force-dynamic replaces the previous ISR revalidate.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pricing | OpusPass',
  description:
    'Simple per-guest pricing. Choose Essential, Classic, Elegant or Signature — every package includes the digital card, ticket, delivery and door check-in. Pay by mobile money or card.',
}

const tzs = (n: number) => `TZS ${n.toLocaleString('en-US')}`

// Per-tier pastel palette — mirrors the package selector on the product detail page
// (slate = Essential / lavender = Classic / blush = Elegant / gold = Signature) so
// pricing feels like the same product. Keyed by the stable tier id
// ('lite' | 'classic' | 'elegant' | 'signature').
const TIER_STYLES: Record<string, { card: string; price: string; chip: string; col: string }> = {
  lite: { card: 'bg-[#E1E8F0] border-[#D3DBE5]', price: 'text-[#475569]', chip: 'bg-[#E1E8F0] text-[#3F4E63]', col: '' },
  classic: { card: 'bg-[#ECDDF7] border-[#E3D2F2]', price: 'text-[#403d39]', chip: 'bg-[#E4D3F4] text-[#7B4FB0]', col: 'bg-[#F6EEFB]' },
  elegant: { card: 'bg-[#F4E3EC] border-[#ECD3DF]', price: 'text-[#8A4E68]', chip: 'bg-[#F0D8E4] text-[#97506E]', col: '' },
  signature: { card: 'bg-[#F5E7BF] border-[#EBDCAE]', price: 'text-[#7A6418]', chip: 'bg-[#F3E3B2] text-[#7A6012]', col: '' },
}
const DEFAULT_TIER_STYLE = { card: 'bg-white border-gray-200', price: 'text-[#1A1A1A]', chip: 'bg-gray-100 text-gray-700', col: '' }

// One comparison cell: a check for "Yes", a muted dash for "—"/blank, text otherwise.
// aria-labels are CMS-driven (passed down from the page).
function TierValue({
  value,
  includedLabel,
  notIncludedLabel,
}: {
  value?: string
  includedLabel: string
  notIncludedLabel: string
}) {
  const v = (value ?? '').trim()
  if (!v || v === '—') return <span className="text-gray-300" aria-label={notIncludedLabel}>—</span>
  if (v === 'Yes')
    return <Check className="mx-auto h-[18px] w-[18px] text-[#5C6B4D]" aria-label={includedLabel} />
  return <span className="text-[13px] leading-tight text-gray-700">{v}</span>
}

// Logo chips mirror the cart page so checkout feels consistent end-to-end.
const PAYMENT_METHODS = [
  { id: 'mpesa', label: 'M-Pesa', src: '/assets/payment-logos/m-pesa-logo.png', width: 600, height: 400, className: 'h-[26px] w-auto' },
  { id: 'airtel', label: 'Airtel Money', src: '/assets/payment-logos/airtel-money.png', width: 390, height: 230, className: 'h-[24px] w-auto' },
  { id: 'mixx', label: 'Mixx by Yas (Tigo Pesa)', src: '/assets/payment-logos/mixx-by-yass-tigo-pesa.png', width: 600, height: 400, className: 'h-[28px] w-auto' },
  { id: 'selcom', label: 'Selcom Pesa', src: '/assets/payment-logos/selcom.png', width: 385, height: 200, className: 'h-[22px] w-auto' },
  { id: 'visa', label: 'Visa', src: '/assets/payment-logos/visa.svg', width: 1000, height: 325, className: 'h-[17px] w-auto' },
  { id: 'mastercard', label: 'Mastercard', src: '/assets/payment-logos/mastercard.svg', width: 1000, height: 618, className: 'h-[20px] w-auto' },
] as const

export default async function PricingPage() {
  const locale = await getLocale()
  const t = await loadUiStrings('pricing', locale)
  const { tiers, note } = await loadPackagesContent()

  const pricingFaqs: { id: string; q: string; a: string }[] = [
    { id: 'how-charged', q: t.faq_how_charged_q, a: t.faq_how_charged_a },
    { id: 'large-events', q: t.faq_large_events_q, a: t.faq_large_events_a },
    { id: 'payment', q: t.faq_payment_q, a: t.faq_payment_a },
    { id: 'paper', q: t.faq_paper_q, a: t.faq_paper_a },
  ]

  // Reconstruct a comparison matrix from each tier's bullet list: the union of
  // all bullet labels (in tier order), with each tier's value = its emphasis
  // note, "Yes" when present without a note, or "—" when the tier lacks it.
  const allLabels: string[] = []
  for (const tier of tiers) for (const b of tier.includes) if (!allLabels.includes(b.label)) allLabels.push(b.label)
  const rows = allLabels.map((label, i) => {
    const values: Record<string, string> = {}
    for (const tier of tiers) {
      const b = tier.includes.find((x) => x.label === label)
      values[tier.id] = b ? b.note || 'Yes' : '—'
    }
    return { id: `r${i}`, label, values }
  })
  // "Included in every package" = present in every tier as a plain Yes.
  const everyTierPlainYes = (r: { values: Record<string, string> }) =>
    tiers.length > 0 && tiers.every((tier) => r.values[tier.id] === 'Yes')
  const included = rows.filter(everyTierPlainYes)
  const upgrades = rows.filter((r) => !everyTierPlainYes(r))

  return (
    <>
      {/* Hero */}
      <section className="px-4 sm:px-6 pt-20 sm:pt-28 pb-10 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-[#403d39]">
            {t.hero_title}
          </h1>
          <p className="mt-5 text-[15px] sm:text-base text-gray-600 leading-relaxed mx-auto max-w-2xl">
            {t.hero_subtitle}
          </p>
        </div>
      </section>

      {/* Tier cards */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-6xl grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => {
            const style = TIER_STYLES[tier.id] ?? DEFAULT_TIER_STYLE
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border p-6 shadow-sm ${style.card}`}
              >
                {tier.id === 'lite' && (
                  <span className="absolute -top-2.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-[#475569] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                    <Sparkles size={12} strokeWidth={2.5} aria-hidden="true" />
                    {t.badge_basic}
                  </span>
                )}
                {tier.featured && (
                  <span className="absolute -top-2.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--on-accent)] shadow-sm">
                    <PartyPopper size={12} strokeWidth={2.5} aria-hidden="true" />
                    {t.badge_popular}
                  </span>
                )}
                {tier.id === 'elegant' && (
                  <span className="absolute -top-2.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-[#C98BA8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                    <Gem size={12} strokeWidth={2.5} aria-hidden="true" />
                    {t.badge_premium}
                  </span>
                )}
                {tier.id === 'signature' && (
                  <span className="absolute -top-2.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-b from-[#E6C66E] to-[#C9A84C] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#3A2C06] shadow-sm">
                    <Crown size={12} strokeWidth={2.5} aria-hidden="true" />
                    {t.badge_luxury}
                  </span>
                )}
                <h2 className="mt-2 font-serif text-xl text-[#403d39]">{tier.name}</h2>
                <p className="mt-1 text-[13px] text-gray-600">{tier.best_for}</p>
                <p className="mt-5 whitespace-nowrap">
                  <span className={`font-serif text-3xl ${style.price}`}>{tzs(tier.price_per_guest)}</span>
                  <span className="text-[14px] text-gray-500"> {t.per_guest_suffix}</span>
                </p>
                <Link
                  href="/invitations/catalog"
                  className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1A1A1A] px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-gray-800"
                >
                  {t.choose_prefix} {tier.name}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )
          })}
        </div>
        {note && (
          <p className="mx-auto mt-5 max-w-5xl text-center text-[13px] text-gray-500">{note}</p>
        )}
      </section>

      {/* Included in every package */}
      <section className="px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl tracking-tight text-[#403d39]">
            {t.included_title}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {included.map((f) => (
              <li key={f.id} className="flex items-start gap-2.5 text-[14px] text-gray-700">
                <Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#5C6B4D]" aria-hidden="true" />
                <span>{f.label}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-12 font-serif text-2xl tracking-tight text-[#403d39]">
            {t.upgrades_title}
          </h3>
          <p className="mt-2 text-[14px] text-gray-600">
            {t.upgrades_intro}
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="w-[34%] pb-3 align-bottom" />
                  {tiers.map((tier) => {
                    const style = TIER_STYLES[tier.id] ?? DEFAULT_TIER_STYLE
                    return (
                      <th
                        key={tier.id}
                        scope="col"
                        className={`px-3 pt-4 pb-3 text-center align-bottom ${style.col} ${style.col ? 'rounded-t-2xl' : ''}`}
                      >
                        <span
                          className={`inline-block rounded-full px-3 py-1 font-serif text-[15px] ${style.chip}`}
                        >
                          {tier.name}
                        </span>
                        <span className="mt-1.5 block text-[12px] font-medium text-gray-500 tabular-nums">
                          {tzs(tier.price_per_guest)}
                          <span className="font-normal text-gray-400"> {t.per_guest_suffix}</span>
                        </span>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {upgrades.map((f, i) => {
                  const last = i === upgrades.length - 1
                  return (
                    <tr key={f.id}>
                      <th
                        scope="row"
                        className="border-t border-gray-100 py-3.5 pr-4 text-left text-[14px] font-medium text-gray-800"
                      >
                        {f.label}
                      </th>
                      {tiers.map((tier) => {
                        const style = TIER_STYLES[tier.id] ?? DEFAULT_TIER_STYLE
                        return (
                          <td
                            key={tier.id}
                            className={`border-t border-gray-100 px-3 py-3.5 text-center ${style.col} ${
                              last && style.col ? 'rounded-b-2xl' : ''
                            }`}
                          >
                            <TierValue
                              value={f.values[tier.id]}
                              includedLabel={t.value_included}
                              notIncludedLabel={t.value_not_included}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Payment methods */}
      <section className="px-4 sm:px-6 pb-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <h2 className="font-serif text-xl text-[#403d39]">{t.pay_title}</h2>
          <p className="mt-2 text-[14px] text-gray-600">
            {t.pay_intro}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {PAYMENT_METHODS.map((m) => (
              <span
                key={m.id}
                className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-3 shadow-sm"
                aria-label={m.label}
                title={m.label}
                role="img"
              >
                <Image src={m.src} alt="" width={m.width} height={m.height} className={m.className} />
              </span>
            ))}
          </div>

          {/* Security reassurance */}
          <div className="mt-6 grid gap-3 border-t border-gray-100 pt-6 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <Lock className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#5C6B4D]" aria-hidden="true" />
              <p className="text-[13px] text-gray-600 leading-relaxed">
                {t.security_encrypted}
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#5C6B4D]" aria-hidden="true" />
              <p className="text-[13px] text-gray-600 leading-relaxed">
                {t.security_receipt}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[5fr_7fr] lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#403d39]">
              {t.faq_title}
            </h2>
            <p className="mt-3 text-[15px] text-gray-600 leading-relaxed">
              {t.faq_intro}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#1A1A1A] px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-gray-800"
              >
                {t.contact_cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/help"
                className="text-[14px] font-bold text-[#5C6B4D] underline-offset-4 hover:underline"
              >
                {t.help_link}
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-5 sm:px-7">
            {pricingFaqs.map((f) => (
              <FAQItem key={f.id} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

    </>
  )
}
