import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MessageCircle, MapPin, Clock, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact | OpusPass',
  description:
    'Get in touch with the OpusPass team. We’re based in Dar es Salaam and reply within one business day by email or WhatsApp.',
}

const METHODS: {
  Icon: typeof Mail
  label: string
  value: string
  href?: string
  external?: boolean
}[] = [
  {
    Icon: Mail,
    label: 'Email',
    value: 'hello@opusfesta.com',
    href: 'mailto:hello@opusfesta.com',
  },
  {
    Icon: MessageCircle,
    label: 'WhatsApp',
    value: 'Chat with the team',
    href: 'https://wa.me/255000000000',
    external: true,
  },
  {
    Icon: MapPin,
    label: 'Office',
    value: 'Mbezi Beach, Dar es Salaam, Tanzania',
  },
  {
    Icon: Clock,
    label: 'Hours',
    value: 'Mon–Sat, 9am–6pm EAT · replies within one business day',
  },
]

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-4 sm:px-6 pt-20 sm:pt-28 pb-10 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-[13px] text-gray-500 mb-3">Contact</p>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-[#403d39]">
            We’d love to hear from you.
          </h1>
          <p className="mt-5 text-[15px] sm:text-base text-gray-600 leading-relaxed mx-auto max-w-2xl">
            Questions about your guest list, invitations or an event? Reach out and we’ll get back
            within one business day.
          </p>
        </div>
      </section>

      {/* Methods */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-3xl grid gap-4 sm:grid-cols-2">
          {METHODS.map(({ Icon, label, value, href, external }) => {
            const inner = (
              <>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2EFE9] text-[#5C6B4D]">
                  <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
                </span>
                <p className="mt-4 text-[12px] uppercase tracking-wider text-gray-500">{label}</p>
                <p className="mt-1 text-[15px] font-medium text-gray-900">{value}</p>
              </>
            )
            const base = 'flex flex-col rounded-2xl border border-gray-200 bg-white p-6'
            if (href) {
              return (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`${base} transition-colors hover:border-gray-300`}
                >
                  {inner}
                </a>
              )
            }
            return (
              <div key={label} className={base}>
                {inner}
              </div>
            )
          })}
        </div>
      </section>

      {/* Help Centre nudge */}
      <section className="px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl text-[#403d39]">Looking for a quick answer?</h2>
            <p className="mt-1.5 text-[14px] text-gray-600 leading-relaxed">
              Our Help Centre covers invitations, RSVPs, payments and more.
            </p>
          </div>
          <Link
            href="/help"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-300 px-6 py-3 text-[14px] font-bold text-[#1A1A1A] transition-colors hover:border-gray-400"
          >
            Visit Help Centre
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <p className="mx-auto mt-5 max-w-3xl text-[13px] text-gray-500">
          Placeholder contact details — confirm the real phone, WhatsApp number and address before
          launch.
        </p>
      </section>
    </>
  )
}
