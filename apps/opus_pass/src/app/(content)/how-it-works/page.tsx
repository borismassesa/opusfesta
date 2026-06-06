import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '../PageShell'

export const metadata: Metadata = {
  title: 'How it works | OpusPass',
  description:
    'Build your guest list, send invitations by WhatsApp or SMS, and watch RSVPs land in your dashboard live — then plan your seating.',
}

const STEPS = [
  {
    n: '01',
    title: 'Build your list',
    body: 'Type names in or paste from a spreadsheet. Group by family, side or table.',
  },
  {
    n: '02',
    title: 'Send by WhatsApp or SMS',
    body: 'One-tap send. Each guest gets a personal link and an animated digital card.',
  },
  {
    n: '03',
    title: 'Watch replies live',
    body: 'Joyful yes, regrets and meal picks land in your dashboard instantly.',
  },
  {
    n: '04',
    title: 'Plan the seating',
    body: 'Drag confirmed guests onto tables and export a chart for your venue.',
  },
]

export default function HowItWorksPage() {
  return (
    <PageShell
      eyebrow="How it works"
      title="From first invite to final toast."
      intro="No more chasing replies in WhatsApp groups. Send once, track everywhere."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-lg border border-gray-200 bg-white p-6">
            <span className="font-serif italic text-2xl text-[#5C6B4D]">{s.n}</span>
            <h2 className="mt-2 text-[17px] font-extrabold tracking-tight text-[#1A1A1A]">
              {s.title}
            </h2>
            <p className="mt-1 text-[14px] text-gray-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
      <Link
        href="/my/dashboard?seed=1"
        className="inline-flex items-center rounded-full bg-black hover:bg-gray-800 text-white px-7 py-3.5 text-[14px] font-bold"
      >
        Start your guest list
      </Link>
    </PageShell>
  )
}
