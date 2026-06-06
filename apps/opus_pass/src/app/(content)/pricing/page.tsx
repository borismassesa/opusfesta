import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '../PageShell'

export const metadata: Metadata = {
  title: 'Pricing | OpusPass',
  description:
    'OpusPass is free to start — guest list, digital invitations and RSVP tracking at no cost. Pay only for premium card designs and optional paper printing.',
}

const FREE = [
  'Unlimited guest list & groups',
  'Digital invitations by WhatsApp & SMS',
  'Live RSVP tracking, English & Kiswahili',
  'Seating chart & floor plan',
]

const PAID = [
  'Premium animated card designs',
  'Optional paper printing & delivery (Dar, Arusha, Mwanza)',
  'Wedding website premium themes',
]

export default function PricingPage() {
  return (
    <PageShell
      eyebrow="Pricing"
      title="Free to start. Pay only for the extras."
      intro="Building your guest list, sending digital invites and tracking RSVPs is completely free. You only pay when you want premium designs or paper."
    >
      <div className="grid gap-5 sm:grid-cols-2 not-prose">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="font-serif text-xl text-[#403d39] mb-3">Free, always</h2>
          <ul className="space-y-2 text-[14px] text-gray-700">
            {FREE.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="font-serif text-xl text-[#403d39] mb-3">Paid add-ons</h2>
          <ul className="space-y-2 text-[14px] text-gray-700">
            {PAID.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-[13px] text-gray-500">
        Placeholder pricing — final amounts to be confirmed before launch.
      </p>
      <Link
        href="/my/dashboard?seed=1"
        className="inline-flex items-center rounded-full bg-black hover:bg-gray-800 text-white px-7 py-3.5 text-[14px] font-bold"
      >
        Start your guest list
      </Link>
    </PageShell>
  )
}
