import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Ticket, ScanLine, BellRing } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How it works | OpusPass',
  description:
    'Build your guest list, send invitations by WhatsApp or SMS, and watch RSVPs land in your dashboard live — then plan seating and check guests in at the door.',
}

const STEPS = [
  {
    n: '01',
    title: 'Build your list',
    body: 'Create your event, then type names in or paste from a spreadsheet. Group by family, side or table.',
  },
  {
    n: '02',
    title: 'Send by WhatsApp or SMS',
    body: 'One-tap send. Each guest gets a personal link, an animated digital card and their own ticket.',
  },
  {
    n: '03',
    title: 'Watch replies live',
    body: 'Joyful yeses, regrets and meal picks land in your dashboard instantly — in English or Kiswahili.',
  },
  {
    n: '04',
    title: 'Plan & check in',
    body: 'Arrange seating, send reminders, then scan tickets at the door to verify every guest on the day.',
  },
]

const GUEST = [
  {
    Icon: Ticket,
    title: 'A card and a ticket',
    body: 'Every guest receives a digital invitation with all your details plus a personal ticket with a unique barcode.',
  },
  {
    Icon: BellRing,
    title: 'Gentle reminders',
    body: 'Automatic nudges before the day help guests confirm and cut down no-shows — no chasing in group chats.',
  },
  {
    Icon: ScanLine,
    title: 'Fast entry',
    body: 'At the gate their ticket is scanned to verify entry — stopping fake invitees and keeping the line moving.',
  },
]

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-4 sm:px-6 pt-20 sm:pt-28 pb-10 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-[13px] text-gray-500 mb-3">How it works</p>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-[#403d39]">
            From first invite to final toast.
          </h1>
          <p className="mt-5 text-[15px] sm:text-base text-gray-600 leading-relaxed mx-auto max-w-2xl">
            No more chasing replies in WhatsApp groups. Send once, track everywhere — and arrive on
            the day knowing exactly who’s coming.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-5xl grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-gray-200 bg-white p-6">
              <span className="font-serif italic text-2xl text-[#5C6B4D]">{s.n}</span>
              <h2 className="mt-2 text-[17px] font-extrabold tracking-tight text-[#1A1A1A]">
                {s.title}
              </h2>
              <p className="mt-1.5 text-[14px] text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What every guest gets */}
      <section className="px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#403d39]">
              What every guest gets
            </h2>
            <p className="mt-3 text-[15px] text-gray-600 leading-relaxed">
              The experience is built for them too — not just for you.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {GUEST.map(({ Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2EFE9] text-[#5C6B4D]">
                  <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-[16px] font-extrabold tracking-tight text-[#1A1A1A]">
                  {title}
                </h3>
                <p className="mt-1.5 text-[14px] text-gray-600 leading-relaxed">{body}</p>
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
            Start your guest list
            <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-7 py-3.5 text-[14px] font-bold text-[#1A1A1A] transition-colors hover:border-gray-400"
          >
            See pricing
          </Link>
        </div>
      </section>
    </>
  )
}
