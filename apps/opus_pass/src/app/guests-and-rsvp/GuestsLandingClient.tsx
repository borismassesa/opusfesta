'use client'

import { useState } from 'react'
import {
  ChevronDown, FileDown, Printer, Share2, ClipboardCheck,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import HeroSection from '@/components/shadcn-studio/blocks/hero-section-01/hero-section-01'
import BentoGrid from '@/components/shadcn-studio/blocks/bento-grid-13/bento-grid-13'

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function GuestsLandingClient({
  testimonials,
}: {
  testimonials?: React.ReactNode
}) {
  return (
    <div className="bg-white text-[#1A1A1A]">
      <HeroSection />
      <BentoGrid />
      <SpreadTheJoy />
      {testimonials}
      <FAQs />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SPREAD THE JOY — four ways to share a finished invitation: download, print,
//  share digitally, and manage RSVPs. Centered icon row, digital-first framing.
// ─────────────────────────────────────────────────────────────────────────────

const SPREAD_WAYS: Array<{
  icon: LucideIcon
  title: string
  description: string
}> = [
  {
    icon: FileDown,
    title: 'Download',
    description: 'Get a digital copy of your invitation by downloading it to your device.',
  },
  {
    icon: Printer,
    title: 'Print',
    description: 'Download a high-quality PDF and print at home, or let us do the printing!',
  },
  {
    icon: Share2,
    title: 'Share',
    description: 'Spread the word on social media, by text message, or email to friends and family.',
  },
  {
    icon: ClipboardCheck,
    title: 'Manage',
    description: 'Create an online event page to collect RSVPs and manage all the little details!',
  },
]

function SpreadTheJoy() {
  return (
    <section className="px-4 sm:px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-gray-900">
            Endless ways to spread the joy
          </h2>
          <p className="mt-4 text-sm md:text-base text-gray-600">
            Design it once, share it everywhere!
          </p>
        </div>

        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {SPREAD_WAYS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <Icon size={30} strokeWidth={1.5} className="text-[#1A1A1A]" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-bold text-gray-900">{title}</h3>
              <p className="mt-3 max-w-[15rem] text-[14px] sm:text-[15px] text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  FAQS
// ─────────────────────────────────────────────────────────────────────────────

type FaqItem = { q: string; a: React.ReactNode }

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Is OpusPass really free for guest management?',
    a: 'Yes. Building your guest list, sending digital invites, and tracking RSVPs is completely free. We only charge for premium card designs or optional paper printing.',
  },
  {
    q: 'How do guests RSVP without an account?',
    a: (
      <>
        Each guest gets a personal link by WhatsApp or SMS. They tap, see a
        beautiful RSVP page in English or Kiswahili, choose their reply, and
        that&rsquo;s it — no app, no login.
      </>
    ),
  },
  {
    q: 'Can I send to a few guests by paper instead?',
    a: 'Of course. Choose any design from /invitations and order a small premium pack (50–500 cards). We print and deliver in Dar, Arusha and Mwanza. Digital + paper, one event.',
  },
  {
    q: 'What if my guests are older and don’t use WhatsApp?',
    a: 'OpusPass falls back to SMS automatically. The same RSVP page works on any phone with a browser, including small entry-level Androids and feature phones.',
  },
  {
    q: 'Can my planner see the RSVPs too?',
    a: 'Yes. You can share a read-only link with your wedding planner, family, or venue. They see live counts and meal picks without being able to change anything.',
  },
  {
    q: 'Does it support meal choices, plus-ones and kids?',
    a: 'Yes. You can add custom questions per event — meal picks, dietary needs, plus-one names, child counts, song requests. Replies land in your dashboard, filterable in one click.',
  },
]

function FAQs() {
  return (
    <section className="px-4 sm:px-6 pb-16 sm:pb-20">
      <div className="mx-auto max-w-4xl pt-12 sm:pt-16">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-gray-900 mb-4">
            Questions, answered.
          </h2>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-700 leading-relaxed">
            Everything you need to know about guests &amp; RSVPs on OpusPass.
          </p>
        </div>
        <div className="border-y border-gray-200">
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 sm:py-6 text-left"
      >
        <span className="text-[15px] sm:text-[17px] font-medium text-gray-900">
          {q}
        </span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-gray-600 shrink-0 transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      {open && (
        <p className="pb-5 sm:pb-6 pr-12 text-[14px] sm:text-[15px] text-gray-700 leading-relaxed">
          {a}
        </p>
      )}
    </div>
  )
}
