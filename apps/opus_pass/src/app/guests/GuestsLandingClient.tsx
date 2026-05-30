'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronDown, Clock, Send, FileDown, Printer, Share2, ClipboardCheck,
  MapPin, SlidersHorizontal, Link2, UserCheck, MessageCircle, BellRing, Gift,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function GuestsLandingClient() {
  return (
    <div className="bg-white text-[#1A1A1A]">
      <HeroBanner />
      <CollectionGrid />
      <SpreadTheJoy />
      <TurnIntoRsvp />
      <FAQs />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  HERO — sage backdrop with a live RSVP dashboard mock and a phone showing
//  a WhatsApp digital invite being sent
// ─────────────────────────────────────────────────────────────────────────────

function HeroBanner() {
  return (
    <section className="px-4 sm:px-6 pt-4 sm:pt-6">
      <div className="mx-auto max-w-7xl">
        <div
          className="relative overflow-hidden rounded-md min-h-[300px] sm:min-h-[380px] md:min-h-[460px]"
          style={{ backgroundColor: '#D6E0CC' }}
        >
          <div
            className="absolute inset-0 opacity-[0.18] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #5C6B4D 0.6px, transparent 0)',
              backgroundSize: '6px 6px',
            }}
          />

          <div className="relative grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-4 p-6 sm:p-10 md:p-14">
            <div className="md:col-span-7 lg:col-span-7">
              <h1 className="text-[1.8rem] sm:text-[2.2rem] md:text-[2.6rem] lg:text-[2.9rem] font-black uppercase tracking-tighter leading-[1.1] text-[#1A1A1A]">
                Your guest list,
                <br />
                replying in real time.
              </h1>
              <p className="mt-6 sm:mt-7 text-[16px] sm:text-[17px] md:text-[18px] lg:text-[19px] text-[#1A1A1A]/80 leading-[1.7] max-w-xl">
                Send digital invitations by WhatsApp or SMS and watch the
                &ldquo;Joyful yes&rdquo; replies roll in. Free guest list,
                free RSVP page, bilingual English &amp; Swahili — built for
                Tanzanian weddings.
              </p>
              <div className="mt-9 sm:mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href="/my/dashboard?seed=1"
                  className="inline-flex items-center rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-7 py-3 text-[13px] sm:text-[14px] font-extrabold uppercase tracking-[0.1em]"
                >
                  Start your guest list
                </Link>
                <Link
                  href="#explore"
                  className="text-[13px] sm:text-[14px] font-semibold text-[#1A1A1A] underline underline-offset-[6px] decoration-[#1A1A1A]/40 hover:decoration-[#1A1A1A]"
                >
                  Explore the suite <span aria-hidden>→</span>
                </Link>
              </div>
            </div>

            <div className="md:col-span-5 lg:col-span-5 relative h-[260px] sm:h-[340px] md:h-[400px]">
              <div className="absolute left-0 top-[6%] w-[88%] aspect-[16/11] rounded-md shadow-xl bg-[#1A1A1A] p-[6px] rotate-[-3deg]">
                <div className="relative h-full w-full overflow-hidden rounded-sm bg-white">
                  <RsvpDashboardMock />
                </div>
              </div>
              <div className="absolute right-[2%] bottom-[2%] w-[30%] aspect-[9/19] rounded-2xl shadow-xl bg-[#1A1A1A] p-[5px] rotate-[5deg]">
                <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-[#ECE5DD]">
                  <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[36%] h-[10px] bg-[#1A1A1A] rounded-b-md z-10" />
                  <WhatsAppInviteMock />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  COLLECTION GRID — magazine grid on a light-grey canvas: two medium feature
//  cards and a row of four image-top cards. Square white cards separated by
//  the grey gutter (WeddingWire / Zola "shop" layout).
// ─────────────────────────────────────────────────────────────────────────────

const MEDIUM_CARDS: Array<{
  eyebrow: string
  title: string
  cta: string
  href: string
  image: string
}> = [
  {
    eyebrow: 'Free forever',
    title: 'Guest list',
    cta: 'Build your list',
    href: '/my/dashboard/guests',
    image: '/assets/images/cutesy_couple.jpg',
  },
  {
    eyebrow: 'Plan together',
    title: 'Events',
    cta: 'Add your events',
    href: '/my/dashboard/events',
    image: '/assets/images/coupleswithpiano.jpg',
  },
]

const SMALL_CARDS: Array<{
  title: string
  cta: string
  href: string
  image: string
}> = [
  {
    title: 'Send invites',
    cta: 'Send now',
    href: '/my/dashboard/invitations',
    image: '/assets/images/churchcouples.jpg',
  },
  {
    title: 'RSVPs',
    cta: 'Track replies',
    href: '/my/dashboard/rsvps',
    image: '/assets/images/couples_together.jpg',
  },
  {
    title: 'Contact Collector',
    cta: 'Collect details',
    href: '/my/dashboard/guests',
    image: '/assets/images/bride_umbrella.jpg',
  },
  {
    title: 'English & Kiswahili',
    cta: 'RSVP in both',
    href: '/my/dashboard?seed=1',
    image: '/assets/images/ring_piano.jpg',
  },
]

function CardLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-[14px] font-bold text-gray-900 hover:text-gray-500"
    >
      {label} <span aria-hidden>→</span>
    </Link>
  )
}

function CollectionGrid() {
  return (
    <section id="explore" className="px-4 sm:px-6 mt-16 sm:mt-24 scroll-mt-24">
      <div className="mx-auto max-w-7xl">
        <div className="space-y-4 sm:space-y-5">
          {/* Two medium feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {MEDIUM_CARDS.map((card) => (
              <div
                key={card.title}
                className="grid grid-cols-1 sm:grid-cols-5 overflow-hidden bg-white border border-gray-200 shadow-sm"
              >
                <div className="sm:col-span-2 p-7 sm:p-8 flex flex-col justify-center">
                  <p className="text-[13px] text-gray-500 mb-2">{card.eyebrow}</p>
                  <h3 className="font-serif text-2xl sm:text-3xl leading-tight text-[#403d39] mb-4">
                    {card.title}
                  </h3>
                  <CardLink label={card.cta} href={card.href} />
                </div>
                <div className="sm:col-span-3 relative min-h-[220px] sm:min-h-[260px]">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Four image-top cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {SMALL_CARDS.map((card) => (
              <div
                key={card.title}
                className="overflow-hidden bg-white border border-gray-200 shadow-sm flex flex-col"
              >
                <div className="relative aspect-[5/4]">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="px-5 py-7 sm:py-8 text-center flex flex-col items-center gap-3">
                  <h3 className="font-serif text-xl sm:text-2xl text-[#403d39]">
                    {card.title}
                  </h3>
                  <CardLink label={card.cta} href={card.href} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
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
    <section className="px-4 sm:px-6 pt-20 sm:pt-28">
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
//  TURN INTO RSVP — headline + feature list on the left, a decorative RSVP
//  invitation mock on the right.
// ─────────────────────────────────────────────────────────────────────────────

const RSVP_FEATURES: Array<{ icon: LucideIcon; text: string }> = [
  { icon: MapPin, text: 'Add maps, gift registries, and extras to your RSVP' },
  { icon: SlidersHorizontal, text: 'Set RSVP rules like deadlines, guest limits, and more' },
  { icon: Link2, text: 'Share it seamlessly with a link or QR code' },
  { icon: UserCheck, text: 'Guests RSVP in one click' },
  { icon: MessageCircle, text: 'Communicate easily with your guests' },
  { icon: BellRing, text: 'Track responses in real time and get email notifications' },
]

function TurnIntoRsvp() {
  return (
    <section className="px-4 sm:px-6 pt-20 sm:pt-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left — headline + features */}
        <div>
          <h2 className="text-4xl font-black leading-[1.08] tracking-tight text-[#1A1A1A] sm:text-5xl lg:text-[3.4rem]">
            Turn any invitation into an online{' '}
            <span className="text-[#3C9A5F]">RSVP</span>
          </h2>
          <ul className="mt-9 border-t border-gray-200 sm:mt-11">
            {RSVP_FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4 border-b border-gray-200 py-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gray-100 text-[#1A1A1A]">
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="text-[15px] text-gray-700 sm:text-base">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — decorative RSVP mock (hidden from assistive tech: fake invite copy is purely visual) */}
        <div className="order-first lg:order-last" aria-hidden="true">
          <RsvpInviteMock />
        </div>
      </div>
    </section>
  )
}

function RsvpPill({ label, mark, color }: { label: string; mark: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border-[1.5px] bg-white px-3.5 py-2 text-[12px] font-bold text-[#1A1A1A] shadow-md"
      style={{ borderColor: color }}
    >
      {label}
      <span style={{ color }}>{mark}</span>
    </span>
  )
}

function RsvpChip({ icon: Icon, label, className }: { icon: LucideIcon; label: string; className?: string }) {
  return (
    <span
      className={cn(
        'absolute inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#1A1A1A] shadow-md ring-1 ring-black/5',
        className,
      )}
    >
      <Icon size={13} strokeWidth={2} className="text-[#5C6B4D]" aria-hidden="true" />
      {label}
    </span>
  )
}

function RsvpInviteMock() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-[#E3F1E8] p-5 sm:p-6">
      {/* soft decorative blobs */}
      <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#9FE870]/30" aria-hidden="true" />
      <span className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-[#F5DCE2]/60" aria-hidden="true" />

      {/* Yes / Maybe / No pills */}
      <div className="relative z-20 flex flex-wrap justify-center gap-2">
        <RsvpPill label="Yes" mark="✓" color="#5BA86F" />
        <RsvpPill label="Maybe" mark="?" color="#C99A2E" />
        <RsvpPill label="No" mark="✕" color="#A04450" />
      </div>

      {/* Invitation card */}
      <div className="relative z-0 mx-auto mt-5 w-[76%] overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black/5">
        <div className="bg-gradient-to-br from-[#F5EFE3] to-[#EAF2EC] px-5 py-9 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#5C6B4D]">You&rsquo;re invited</p>
          <p className="mt-3 font-serif text-2xl italic text-[#1A1A1A]">Amani &amp; Neema</p>
          <div className="mx-auto my-3 h-px w-10 bg-[#5C6B4D]/40" />
          <p className="text-[11px] tracking-[0.2em] text-[#1A1A1A]/70">SAT · 22 · 08 · 2026 · 4PM</p>
          <p className="mt-6 text-[13px] font-extrabold tracking-[0.2em] text-[#5C6B4D]">PLEASE RSVP!</p>
          <p className="mt-1 text-[10px] text-[#1A1A1A]/50">opus.pass/amani-neema</p>
        </div>
      </div>

      {/* Floating chips */}
      <RsvpChip icon={Link2} label="Customize link" className="left-2 top-[40%]" />
      <RsvpChip icon={MapPin} label="Location" className="left-4 bottom-[16%]" />
      <RsvpChip icon={Gift} label="Gift registry" className="right-2 top-[38%]" />
      <RsvpChip icon={ClipboardCheck} label="Attendance" className="right-3 bottom-[20%]" />
    </div>
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
    <section className="px-4 sm:px-6 pb-20 sm:pb-28">
      <div className="mx-auto max-w-4xl pt-24 sm:pt-32 md:pt-40">
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

// ─────────────────────────────────────────────────────────────────────────────
//  VISUAL PRIMITIVES — pure CSS mocks used in the hero
// ─────────────────────────────────────────────────────────────────────────────

type RsvpRow = {
  name: string
  status: 'yes' | 'maybe' | 'no'
}

const SAMPLE_RSVPS: RsvpRow[] = [
  { name: 'Maria K.', status: 'yes' },
  { name: 'James M.', status: 'yes' },
  { name: 'Faith L.', status: 'maybe' },
  { name: 'Daniel W.', status: 'yes' },
  { name: 'Grace N.', status: 'no' },
  { name: 'Peter O.', status: 'yes' },
  { name: 'Joyce S.', status: 'yes' },
]

function RsvpDashboardMock() {
  const yesCount = SAMPLE_RSVPS.filter((r) => r.status === 'yes').length
  const maybeCount = SAMPLE_RSVPS.filter((r) => r.status === 'maybe').length
  const noCount = SAMPLE_RSVPS.filter((r) => r.status === 'no').length

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-gray-400">
          OpusPass · Guests
        </p>
        <span className="h-2.5 w-2.5" />
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pt-3.5">
        <StatPill label="Yes" value={yesCount} color="#9FE870" textColor="#1A1A1A" />
        <StatPill label="Maybe" value={maybeCount} color="#FFE7AE" textColor="#7A5800" />
        <StatPill label="No" value={noCount} color="#FFD7DA" textColor="#7A1F2B" />
      </div>

      <div className="flex-1 px-4 pt-3 pb-2 space-y-1.5 overflow-hidden">
        {SAMPLE_RSVPS.slice(0, 4).map((r, i) => (
          <RsvpRowItem key={i} row={r} />
        ))}
      </div>

      <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] font-bold text-gray-500">
          <Clock size={11} />
          Updated just now
        </div>
        <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] font-bold text-[#5C6B4D]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#9FE870] animate-pulse" />
          Live
        </div>
      </div>
    </div>
  )
}

function StatPill({
  label,
  value,
  color,
  textColor,
}: {
  label: string
  value: number
  color: string
  textColor: string
}) {
  return (
    <div className="rounded-md px-2.5 py-2" style={{ backgroundColor: color }}>
      <p
        className="text-[9px] uppercase tracking-[0.18em] font-bold"
        style={{ color: textColor }}
      >
        {label}
      </p>
      <p
        className="text-[18px] font-black leading-none mt-1"
        style={{ color: textColor }}
      >
        {value}
      </p>
    </div>
  )
}

function RsvpRowItem({ row }: { row: RsvpRow }) {
  const statusColor =
    row.status === 'yes'
      ? '#9FE870'
      : row.status === 'maybe'
        ? '#E8B547'
        : '#A04450'
  const statusLabel =
    row.status === 'yes'
      ? 'Joyful yes'
      : row.status === 'maybe'
        ? 'Maybe'
        : 'Regrets'
  return (
    <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
      <span
        className="h-2 w-2 rounded-full shrink-0"
        style={{ backgroundColor: statusColor }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-[#1A1A1A] leading-tight truncate">
          {row.name}
        </p>
      </div>
      <span
        className="text-[9px] uppercase tracking-[0.14em] font-bold px-1.5 py-0.5 rounded-sm"
        style={{
          backgroundColor: `${statusColor}33`,
          color: '#1A1A1A',
        }}
      >
        {statusLabel}
      </span>
    </div>
  )
}

function WhatsAppInviteMock() {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="bg-[#075E54] text-white px-3 pt-6 pb-2 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[var(--accent)] grid place-items-center text-[8px] font-extrabold text-[#1A1A1A]">
          M
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold truncate">Maria K.</p>
          <p className="text-[7px] text-white/70">online</p>
        </div>
      </div>
      <div className="flex-1 p-2 space-y-1.5 overflow-hidden">
        <div className="max-w-[88%] rounded-md bg-white text-[#1A1A1A] px-2 py-1.5 shadow-sm text-[8px] leading-snug">
          Karibu sana harusini! Tap kuhakikisha unakuja 💚
        </div>
        <div className="max-w-[88%] rounded-md bg-white text-[#1A1A1A] p-1 shadow-sm">
          <div className="rounded-sm bg-[#F5EFE3] px-2 py-2.5 text-center">
            <p className="text-[5px] uppercase tracking-[0.2em] text-[#5C6B4D]">
              You are invited
            </p>
            <p className="mt-1 font-serif italic text-[10px] text-[#1A1A1A]">
              Amani &amp; Neema
            </p>
            <div className="my-1 mx-auto h-px w-4 bg-[#5C6B4D]/40" />
            <p className="text-[5px] tracking-[0.2em] text-[#1A1A1A]/70">
              22 · 08 · 2026
            </p>
          </div>
          <p className="text-[6px] text-[#1A1A1A]/70 mt-1.5 px-1 truncate">
            opus.pass/n/amani-neema/maria
          </p>
        </div>
        <div className="max-w-[70%] ml-auto rounded-md bg-[#DCF8C6] text-[#1A1A1A] px-2 py-1.5 shadow-sm text-[8px]">
          Joyful yes! 💚
        </div>
      </div>
      <div className="bg-white px-2 py-1.5 flex items-center gap-1.5 border-t border-black/5">
        <div className="flex-1 h-3 rounded-full bg-gray-100" />
        <div className="w-4 h-4 rounded-full bg-[#25D366] grid place-items-center">
          <Send size={6} className="text-white" />
        </div>
      </div>
    </div>
  )
}
