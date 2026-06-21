import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Ticket, ScanLine, BellRing } from 'lucide-react'
import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings, type HowItWorksStrings } from '@/lib/cms/ui-strings'

// Per-locale CMS copy is resolved from the locale cookie, so the page must never
// be baked into a shared cache (which would serve one visitor's language to all).
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'How it works | OpusPass',
  description:
    'Build your guest list, send invitations by WhatsApp or SMS, and watch RSVPs land in your dashboard live — then plan seating and check guests in at the door.',
}

export default async function HowItWorksPage() {
  const locale = await getLocale()
  const t = await loadUiStrings('how-it-works', locale)

  const steps: { n: string; titleKey: keyof HowItWorksStrings; bodyKey: keyof HowItWorksStrings }[] = [
    { n: '01', titleKey: 'step_list_title', bodyKey: 'step_list_body' },
    { n: '02', titleKey: 'step_send_title', bodyKey: 'step_send_body' },
    { n: '03', titleKey: 'step_replies_title', bodyKey: 'step_replies_body' },
    { n: '04', titleKey: 'step_checkin_title', bodyKey: 'step_checkin_body' },
  ]

  const guest: { Icon: typeof Ticket; titleKey: keyof HowItWorksStrings; bodyKey: keyof HowItWorksStrings }[] = [
    { Icon: Ticket, titleKey: 'guest_card_title', bodyKey: 'guest_card_body' },
    { Icon: BellRing, titleKey: 'guest_reminders_title', bodyKey: 'guest_reminders_body' },
    { Icon: ScanLine, titleKey: 'guest_entry_title', bodyKey: 'guest_entry_body' },
  ]

  return (
    <>
      {/* Hero */}
      <section className="px-4 sm:px-6 pt-20 sm:pt-28 pb-10 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-[13px] text-gray-500 mb-3">{t.eyebrow}</p>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-[#403d39]">
            {t.title}
          </h1>
          <p className="mt-5 text-[15px] sm:text-base text-gray-600 leading-relaxed mx-auto max-w-2xl">
            {t.intro}
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-5xl grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-gray-200 bg-white p-6">
              <span className="font-serif italic text-2xl text-[#5C6B4D]">{s.n}</span>
              <h2 className="mt-2 text-[17px] font-extrabold tracking-tight text-[#1A1A1A]">
                {t[s.titleKey]}
              </h2>
              <p className="mt-1.5 text-[14px] text-gray-600 leading-relaxed">{t[s.bodyKey]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What every guest gets */}
      <section className="px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#403d39]">
              {t.guest_section_title}
            </h2>
            <p className="mt-3 text-[15px] text-gray-600 leading-relaxed">
              {t.guest_section_intro}
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {guest.map(({ Icon, titleKey, bodyKey }) => (
              <div key={titleKey} className="rounded-2xl border border-gray-200 bg-white p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2EFE9] text-[#5C6B4D]">
                  <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-[16px] font-extrabold tracking-tight text-[#1A1A1A]">
                  {t[titleKey]}
                </h3>
                <p className="mt-1.5 text-[14px] text-gray-600 leading-relaxed">{t[bodyKey]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 pb-24 text-center">
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/my/dashboard?seed=1"
            className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-gray-800"
          >
            {t.cta_primary}
            <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-7 py-3.5 text-[14px] font-bold text-[#1A1A1A] transition-colors hover:border-gray-400"
          >
            {t.cta_secondary}
          </Link>
        </div>
      </section>
    </>
  )
}
